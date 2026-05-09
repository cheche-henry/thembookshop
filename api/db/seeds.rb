# ============================================================
# db/seeds.rb — Them Bookshop
# Run with: rails db:seed
# ============================================================

puts "🌱 Seeding database..."

# ── Admin User ────────────────────────────────────────────────────────────────
admin = AdminUser.find_or_initialize_by(email: ENV.fetch("ADMIN_EMAIL", "admin@thembookshop.co.ke"))
admin.assign_attributes(
  name:     "Bookshop Admin",
  password: ENV.fetch("ADMIN_PASSWORD", "Admin@2025!"),
  active:   true,
)
admin.save!
puts "✅ Admin user: #{admin.email}"

# ── Products ──────────────────────────────────────────────────────────────────
products_data = [
  # Primary Textbooks
  { name: "KLB Mathematics Grade 4", category: "Textbooks", class_level: "Grade 4", subject: "Mathematics", price: 380, stock_quantity: 85, badge: "Best Seller", description: "Kenya Literature Bureau approved Mathematics textbook for Grade 4. Covers all CBC topics including fractions, geometry, and data handling." },
  { name: "English Activities Grade 2", category: "Textbooks", class_level: "Grade 2", subject: "English", price: 320, stock_quantity: 60, badge: nil, description: "Engaging English activities book for Grade 2 learners aligned with CBC curriculum." },
  { name: "Integrated Science Grade 5", category: "Textbooks", class_level: "Grade 5", subject: "Science", price: 420, stock_quantity: 45, badge: "New", description: "Comprehensive Science textbook for Grade 5 with colorful illustrations and hands-on experiments." },
  { name: "Social Studies Grade 3", category: "Textbooks", class_level: "Grade 3", subject: "Social Studies", price: 350, stock_quantity: 70, badge: nil, description: "Social Studies textbook for Grade 3 covering community, environment, and citizenship." },
  { name: "Kiswahili Lugha Grade 6", category: "Textbooks", class_level: "Grade 6", subject: "Kiswahili", price: 360, stock_quantity: 55, badge: nil, description: "Kiswahili Lugha na Fasihi textbook for Grade 6. Inashughulikia sarufi, uandishi, na fasihi." },
  { name: "Creative Arts & Craft Grade 1", category: "Textbooks", class_level: "Grade 1", subject: "Creative Arts", price: 290, stock_quantity: 40, badge: "Popular", description: "Fun and colorful Creative Arts book for Grade 1 with simple drawing and craft activities." },

  # Secondary Textbooks
  { name: "Secondary Mathematics Form 2", category: "Textbooks", class_level: "Form 2", subject: "Mathematics", price: 520, stock_quantity: 75, badge: "Best Seller", description: "Comprehensive Form 2 Mathematics covering algebra, geometry, statistics, and trigonometry. KLB approved." },
  { name: "Biology Form 3 Student's Book", category: "Textbooks", class_level: "Form 3", subject: "Biology", price: 560, stock_quantity: 38, badge: nil, description: "Detailed Biology textbook for Form 3 covering cells, genetics, ecology, and reproduction." },
  { name: "English Language Form 1", category: "Textbooks", class_level: "Form 1", subject: "English", price: 480, stock_quantity: 62, badge: nil, description: "English Language Form 1 textbook covering grammar, comprehension, and composition writing." },
  { name: "Chemistry Form 4 Student's Book", category: "Textbooks", class_level: "Form 4", subject: "Chemistry", price: 580, stock_quantity: 30, badge: "New Edition", description: "Comprehensive Form 4 Chemistry covering organic chemistry, industrial chemistry and electrochemistry." },
  { name: "Geography Form 2", category: "Textbooks", class_level: "Form 2", subject: "Geography", price: 510, stock_quantity: 44, badge: nil, description: "Form 2 Geography covering physical and human geography, map reading, and field studies." },
  { name: "Physics Form 1 Student's Book", category: "Textbooks", class_level: "Form 1", subject: "Physics", price: 500, stock_quantity: 50, badge: nil, description: "Introduction to Physics for Form 1. Covers measurements, forces, motion, and light." },

  # Revision Books
  { name: "KCPE Mathematics Revision", category: "Revision Books", class_level: "Grade 6", subject: "Mathematics", price: 450, stock_quantity: 90, badge: "Exam Prep", description: "Comprehensive KCPE Mathematics revision guide with past papers 2015–2024 and detailed solutions." },
  { name: "KCSE English Revision Guide", category: "Revision Books", class_level: "Form 4", subject: "English", price: 520, stock_quantity: 80, badge: "Exam Prep", description: "KCSE English revision with model essays, comprehension practice, and grammar exercises." },
  { name: "KCSE Sciences Revision Pack", category: "Revision Books", class_level: "Form 4", subject: "Science", price: 680, stock_quantity: 35, badge: "Bundle Deal", description: "All-in-one Sciences revision covering Biology, Chemistry, and Physics with past papers." },

  # Storybooks
  { name: "African Tales for Young Readers", category: "Storybooks", price: 250, stock_quantity: 100, badge: "Popular", description: "A wonderful collection of African folktales that teach moral lessons. Perfect for ages 6–12." },
  { name: "Nakuru the Brave – Vol. 1", category: "Storybooks", price: 220, stock_quantity: 55, badge: "New", description: "An exciting adventure story following Nakuru, a young boy from Kisumu who discovers a hidden forest treasure." },
  { name: "Mama Told Me So – Swahili Tales", category: "Storybooks", price: 230, stock_quantity: 48, badge: nil, description: "Bilingual storybook in Swahili and English. Great for building language skills." },

  # Stationery
  { name: "Exercise Books – Pack of 10", category: "Exercise Books", price: 180, stock_quantity: 200, badge: "Value Pack", description: "Quality 80-page ruled exercise books. Pack of 10." },
  { name: "Graph Paper Exercise Books – Pack of 5", category: "Exercise Books", price: 120, stock_quantity: 150, badge: nil, description: "Graph paper exercise books for Maths and Science. Pack of 5." },
  { name: "Bic Cristal Pens – Box of 12", category: "Pens & Pencils", price: 150, stock_quantity: 300, badge: "Best Seller", description: "Reliable Bic Cristal ballpoint pens, blue ink. Box of 12." },
  { name: "HB Pencils with Eraser – Pack of 6", category: "Pens & Pencils", price: 90, stock_quantity: 250, badge: nil, description: "Quality HB pencils with built-in eraser tips. Pack of 6." },
  { name: "Colored Pencils – 24 Colors", category: "Pens & Pencils", price: 200, stock_quantity: 120, badge: nil, description: "Vibrant colored pencils for art and creative activities. 24 colors in a sturdy tin case." },
  { name: "Helix Geometry Set", category: "Geometry Sets", price: 280, stock_quantity: 160, badge: "Best Seller", description: "Complete geometry set with compass, protractor, set squares, and ruler. Ideal for Form 1–4." },
  { name: "Junior Geometry Set", category: "Geometry Sets", price: 180, stock_quantity: 130, badge: nil, description: "Compact geometry set for upper primary learners." },
  { name: "30cm Wooden Ruler", category: "Rulers", price: 40, stock_quantity: 400, badge: nil, description: "Durable 30cm wooden ruler with clear cm and mm markings." },
  { name: "Primary School Backpack – Blue", category: "School Bags", price: 1200, stock_quantity: 40, badge: "Popular", description: "Durable waterproof backpack for primary school learners. Padded straps, ergonomic back support." },
  { name: "Secondary School Backpack – Black", category: "School Bags", price: 1800, stock_quantity: 25, badge: "New", description: "Large capacity backpack for secondary students. Fits A4 textbooks and laptops up to 15 inches." },
  { name: "Cartoon Schoolbag – Grades 1–3", category: "School Bags", price: 950, stock_quantity: 35, badge: "Kids Favorite", description: "Fun cartoon-print school bag for young learners. Lightweight with reflective strips for safety." },
]

created = 0
products_data.each_with_index do |attrs, i|
  product = Product.find_or_initialize_by(name: attrs[:name])
  product.assign_attributes(attrs.merge(active: true, sort_order: i))
  if product.save
    created += 1
    print "."
  else
    puts "\n❌ Failed to save '#{attrs[:name]}': #{product.errors.full_messages.join(', ')}"
  end
end

puts "\n✅ #{created} products seeded"
puts "\n🎉 Done! Them Bookshop is ready."
puts "\n📋 Admin login:"
puts "   Email:    #{admin.email}"
puts "   Password: #{ENV.fetch('ADMIN_PASSWORD', 'Admin@2025!')}"
puts "\n⚠️  Change the admin password immediately in production!"
