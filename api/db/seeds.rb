# ============================================================
# db/seeds.rb — Them Bookshop
# Source: THEM_FEB_2026.xls (physical-store stock sheet)
# Run:    rails db:seed
# Reset:  rails db:seed:replant
#
# Row data lives in db/seeds/catalogue/*.rb. Each Excel string is kept as
# +raw_name+ and imported by a stable +source_key+, so renaming the
# customer-facing title never creates a duplicate product.
# ============================================================
require_relative "seeds/catalogue"

puts "🌱 Seeding Them Bookshop..."

# ── Admin ─────────────────────────────────────────────────────────────────────
admin_password = ENV["ADMIN_PASSWORD"].presence
if admin_password.blank?
  raise "ADMIN_PASSWORD must be set before seeding in production" if Rails.env.production?

  admin_password = "Admin@2025!"
end

admin = AdminUser.find_or_initialize_by(email: ENV.fetch("ADMIN_EMAIL", "admin@thembookshop.co.ke"))
admin.assign_attributes(
  name: "Bookshop Admin",
  password: admin_password,
  active: true
)
admin.save!
puts "✅ Admin: #{admin.email}"

# ── Helpers ───────────────────────────────────────────────────────────────────
SKIP_NAMES = ["GRANT IN AID", "AIRTEL", "SAFARICOM", "CASHSALE", "PETTY CASH", "RAFFLE"].freeze

def catalogue_description(attributes, levels)
  parts = []
  level_label = ProductNameNormalizer.level_label(levels)
  parts << "#{attributes[:subcategory]} for #{level_label}." if level_label
  parts << "#{attributes[:subcategory]}." if level_label.nil?

  subject_label = [attributes[:subject], attributes[:subsubject]].compact_blank.join(" · ")
  parts << "Subject: #{subject_label}." if subject_label.present?
  parts << "Available at Them Bookshop, Nairobi."
  parts.join(" ")
end

# ── Flatten sections ──────────────────────────────────────────────────────────
entries = THEM_BOOKSHOP_CATALOGUE.flat_map do |section|
  section[:rows].map do |raw_name, price, stock, badge, overrides|
    {
      section: section,
      raw_name: raw_name,
      price: price,
      stock: stock,
      badge: badge,
      overrides: overrides || {}
    }
  end
end

# ── Import ────────────────────────────────────────────────────────────────────
created = updated = skipped = 0
failures = []
duplicate_keys = []
seen_keys = {}
review = []

entries.each_with_index do |entry, index|
  raw_name = entry[:raw_name].to_s.strip

  next if SKIP_NAMES.include?(raw_name)
  next if entry[:price].to_i.zero? && entry[:stock].to_i.zero?

  source_key = ProductNameNormalizer.source_key(raw_name)
  if seen_keys[source_key]
    duplicate_keys << raw_name
    next
  end
  seen_keys[source_key] = true

  attributes = ProductCatalog.classify(
    raw_name: raw_name,
    category: entry[:overrides][:category] || entry[:section][:category],
    subcategory: entry[:overrides][:subcategory] || entry[:section][:subcategory],
    stage: entry[:overrides][:stage] || entry[:section][:stage]
  ).merge(entry[:overrides])

  levels       = Array(attributes[:class_levels]).compact_blank
  display_name = attributes[:name].presence || ProductNameNormalizer.display_name(raw_name)

  product = Product.find_or_initialize_by(source_key: source_key)
  is_new  = product.new_record?

  product.assign_attributes(
    name: display_name,
    raw_name: raw_name,
    description: catalogue_description(attributes, levels),
    category: attributes[:category],
    subcategory: attributes[:subcategory],
    subject: attributes[:subject],
    subsubject: attributes[:subsubject],
    stage: attributes[:stage],
    class_levels: levels,
    class_level: levels.first,
    price: entry[:price],
    stock_quantity: entry[:stock].to_i,
    badge: entry[:badge],
    active: entry[:price].to_i.positive?,
    sort_order: index
  )

  if product.save
    is_new ? created += 1 : updated += 1
    print "."
  else
    skipped += 1
    failures << "#{raw_name}: #{product.errors.full_messages.join(", ")}"
    puts "\n❌ #{raw_name}: #{product.errors.full_messages.join(", ")}"
  end

  flags = ProductNameNormalizer.review_flags(raw_name)
  review << [raw_name, product.name, flags] if flags.any?
end

# ── Remove the pre-taxonomy rows ──────────────────────────────────────────────
# Every catalogue product now has a subcategory. Anything without one is a row
# from the old Textbooks/Storybooks/… scheme; keep it only if it has orders.
deleted = deactivated = 0
Product.where(subcategory: nil).find_each do |product|
  if product.order_items.exists?
    product.update_columns(active: false)
    deactivated += 1
  else
    product.image.purge if product.image.attached?
    product.destroy!
    deleted += 1
  end
end

# ── Audit ─────────────────────────────────────────────────────────────────────
puts "\n\n✅ #{created} created, #{updated} updated, #{skipped} skipped"
puts "🧹 Legacy rows: #{deleted} deleted, #{deactivated} deactivated (had orders)"
puts "📦 Total active products: #{Product.active.count}"

puts "\nCatalogue by department:"
Product::TAXONOMY.each do |category, subcategories|
  total = Product.active.where(category: category).count
  puts "  #{category}: #{total}"
  subcategories.each do |subcategory|
    count = Product.active.where(category: category, subcategory: subcategory).count
    puts "    - #{subcategory}: #{count}" if count.positive?
  end
end

invalid_subcategories = Product.active.where.not(subcategory: Product::SUBCATEGORIES)
invalid_subjects     = Product.active.where.not(subject: nil).where.not(subject: Product::SUBJECTS)
invalid_levels       = Product.active.where.not("class_levels <@ ARRAY[?]::varchar[]", Product::CLASS_LEVELS)

puts "\nAudit:"
puts "  Invalid subcategories: #{invalid_subcategories.count}"
puts "  Invalid subjects:      #{invalid_subjects.count}"
puts "  Invalid class levels:  #{invalid_levels.count}"

missing_subject = Product.active
                         .where(category: "Books", subject: nil)
                         .where.not(subcategory: ["Bibles & Religious", "Reference & Dictionaries"])
if missing_subject.exists?
  puts "  Books without a subject (review): #{missing_subject.count}"
  missing_subject.limit(15).pluck(:raw_name).each { |name| puts "    · #{name}" }
end

missing_level = Product.active
                       .where(category: "Books")
                       .where("class_levels = '{}'")
                       .where(stage: nil)
if missing_level.exists?
  puts "  Books without a level or stage (review): #{missing_level.count}"
  missing_level.limit(15).pluck(:raw_name).each { |name| puts "    · #{name}" }
end

duplicate_names = Product.active.group(:name).having("COUNT(*) > 1").count
if duplicate_names.any?
  puts "\n⚠️  Duplicate display names (kept as separate stock rows):"
  duplicate_names.each_key do |name|
    raws = Product.active.where(name: name).order(:source_key).pluck(:raw_name)
    puts "  #{name}: #{raws.join(" / ")}"
  end
end

puts "\n⚠️  Duplicate source keys (skipped): #{duplicate_keys.uniq.join(", ")}" if duplicate_keys.any?

if review.any?
  puts "\n⚠️  Flagged for manual review:"
  review.each { |raw, display, flags| puts "  #{raw} → #{display} (#{flags.join(", ")})" }
end

if failures.any?
  puts "\n❌ #{failures.length} row(s) failed validation:"
  failures.each { |failure| puts "  #{failure}" }
end

puts "\n🎉 Them Bookshop seeded!"
puts "\n📋 Admin:"
puts "   Email:    #{admin.email}"
puts "   Password: configured via ADMIN_PASSWORD in api/.env"
