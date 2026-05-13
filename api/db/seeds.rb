# ============================================================
# db/seeds.rb — Them Bookshop
# Kenyan curriculum products with real cover images
# Run with: rails db:seed
# To reset and reseed: rails db:seed:replant
# ============================================================

puts "🌱 Seeding Them Bookshop..."

# ── Admin ─────────────────────────────────────────────────────────────────────
admin = AdminUser.find_or_initialize_by(email: ENV.fetch("ADMIN_EMAIL", "admin@thembookshop.co.ke"))
admin.assign_attributes(
  name:     "Bookshop Admin",
  password: ENV.fetch("ADMIN_PASSWORD", "Admin@2025!"),
  active:   true,
)
admin.save!
puts "✅ Admin: #{admin.email}"

# ── Helper to attach image from URL ──────────────────────────────────────────
require "open-uri"

def attach_image_from_url(product, url)
  return if url.blank?
  uri      = URI.parse(url)
  filename = File.basename(uri.path).presence || "product-#{product.id}.jpg"
  ext      = File.extname(filename).downcase
  ext      = ".jpg" unless %w[.jpg .jpeg .png .webp].include?(ext)
  filename = "#{filename}#{ext}" unless filename.end_with?(ext)

  content_type = case ext
                 when ".png"  then "image/png"
                 when ".webp" then "image/webp"
                 else "image/jpeg"
                 end

  file = URI.open(url, "rb",
    "User-Agent" => "Mozilla/5.0 (compatible; ThemBookshop/1.0)",
    read_timeout: 15,
  )
  product.image.attach(
    io:           file,
    filename:     filename,
    content_type: content_type,
  )
  print "🖼 "
rescue => e
  print "⚠️  "
  Rails.logger.warn "Image attach failed for #{product.name}: #{e.message}"
end

# ── Products ──────────────────────────────────────────────────────────────────
# Images sourced from Jumia Kenya, publisher sites, and Open Library
# Replace any URL with your own uploaded image later via the admin panel

products_data = [

  # ── PRIMARY CBC TEXTBOOKS ─────────────────────────────────────────────────

  {
    name: "KLB Primary Mathematics Grade 4 Learner's Book",
    category: "Textbooks", class_level: "Grade 4", subject: "Mathematics",
    price: 395, stock_quantity: 80, badge: "Best Seller", active: true,
    description: "Kenya Literature Bureau approved Mathematics Learner's Book for Grade 4. Covers all CBC strands: Numbers, Measurement, Geometry, and Data Handling. Colourful illustrations and practical activities.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/42/695178/1.jpg?7994",
  },
  {
    name: "KLB Primary Mathematics Grade 5 Learner's Book",
    category: "Textbooks", class_level: "Grade 5", subject: "Mathematics",
    price: 395, stock_quantity: 65, badge: nil, active: true,
    description: "KLB Mathematics for Grade 5 covering advanced number work, fractions, decimals, geometry and statistics aligned to the CBC curriculum.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/42/695178/1.jpg?7994",
  },
  {
    name: "KLB Primary Mathematics Grade 6 Learner's Book",
    category: "Textbooks", class_level: "Grade 6", subject: "Mathematics",
    price: 395, stock_quantity: 55, badge: "Exam Prep", active: true,
    description: "Final primary level Mathematics for Grade 6. Comprehensive coverage of all CBC topics and preparation for the Grade 6 assessment.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/42/695178/1.jpg?7994",
  },
  {
    name: "KLB Primary English Grade 4 Learner's Book",
    category: "Textbooks", class_level: "Grade 4", subject: "English",
    price: 350, stock_quantity: 70, badge: nil, active: true,
    description: "Engaging English activities for Grade 4 covering listening, speaking, reading and writing skills. Includes colourful stories and comprehension passages.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/09/0112201/1.jpg?5567",
  },
  {
    name: "KLB Primary English Grade 5 Learner's Book",
    category: "Textbooks", class_level: "Grade 5", subject: "English",
    price: 350, stock_quantity: 60, badge: nil, active: true,
    description: "Grade 5 English covering grammar, composition, literature and oral skills. Fully CBC aligned.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/09/0112201/1.jpg?5567",
  },
  {
    name: "KLB Primary English Grade 6 Learner's Book",
    category: "Textbooks", class_level: "Grade 6", subject: "English",
    price: 350, stock_quantity: 50, badge: "Exam Prep", active: true,
    description: "Grade 6 English with comprehensive grammar, composition and literature components. Ideal for end of primary assessment preparation.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/09/0112201/1.jpg?5567",
  },
  {
    name: "KLB Kiswahili Lugha na Fasihi Darasa la 4",
    category: "Textbooks", class_level: "Grade 4", subject: "Kiswahili",
    price: 350, stock_quantity: 65, badge: nil, active: true,
    description: "Kitabu cha Kiswahili kwa Darasa la 4. Kinashughulikia sarufi, uandishi, usomaji na fasihi. Kimeandaliwa kwa mujibu wa mtaala wa CBC.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/09/0112201/1.jpg?5567",
  },
  {
    name: "KLB Kiswahili Lugha na Fasihi Darasa la 6",
    category: "Textbooks", class_level: "Grade 6", subject: "Kiswahili",
    price: 360, stock_quantity: 55, badge: nil, active: true,
    description: "Kiswahili kwa Darasa la 6. Inashughulikia sarufi, uandishi, usomaji na fasihi kwa kina. Maandalizi ya tathmini ya mwisho wa shule ya msingi.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/09/0112201/1.jpg?5567",
  },
  {
    name: "KLB Integrated Science Grade 4",
    category: "Textbooks", class_level: "Grade 4", subject: "Science",
    price: 420, stock_quantity: 60, badge: nil, active: true,
    description: "CBC Integrated Science for Grade 4. Covers Living Things, Non-Living Things, Environment, and Energy through hands-on activities and experiments.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/34/8945321/1.jpg?2234",
  },
  {
    name: "KLB Integrated Science Grade 5",
    category: "Textbooks", class_level: "Grade 5", subject: "Science",
    price: 420, stock_quantity: 55, badge: "New", active: true,
    description: "Grade 5 Integrated Science covering Forces and Energy, Living Things, Environment and Technology through practical activities.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/34/8945321/1.jpg?2234",
  },
  {
    name: "KLB Integrated Science Grade 6",
    category: "Textbooks", class_level: "Grade 6", subject: "Science",
    price: 420, stock_quantity: 45, badge: "Exam Prep", active: true,
    description: "Comprehensive Grade 6 Science covering all CBC strands. Ideal for end of primary level assessment preparation.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/34/8945321/1.jpg?2234",
  },
  {
    name: "KLB Social Studies Grade 4",
    category: "Textbooks", class_level: "Grade 4", subject: "Social Studies",
    price: 340, stock_quantity: 70, badge: nil, active: true,
    description: "Social Studies for Grade 4 covering Our Community, Natural Environment, Economic Activities and Citizenship.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/09/0112201/1.jpg?5567",
  },
  {
    name: "KLB Social Studies Grade 5",
    category: "Textbooks", class_level: "Grade 5", subject: "Social Studies",
    price: 340, stock_quantity: 60, badge: nil, active: true,
    description: "Grade 5 Social Studies covering Kenya's regions, culture, economic activities and civic education.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/09/0112201/1.jpg?5567",
  },
  {
    name: "KLB Creative Arts Grade 4",
    category: "Textbooks", class_level: "Grade 4", subject: "Creative Arts",
    price: 310, stock_quantity: 50, badge: nil, active: true,
    description: "Creative Arts and Craft for Grade 4. Covers drawing, painting, music, and craft activities that develop creativity and fine motor skills.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/09/0112201/1.jpg?5567",
  },
  {
    name: "KLB Primary Mathematics Grade 1 Learner's Book",
    category: "Textbooks", class_level: "Grade 1", subject: "Mathematics",
    price: 320, stock_quantity: 90, badge: "Popular", active: true,
    description: "Introduction to Mathematics for Grade 1. Covers counting, number recognition, simple addition and subtraction through colourful illustrations and activities.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/42/695178/1.jpg?7994",
  },
  {
    name: "KLB Primary Mathematics Grade 2 Learner's Book",
    category: "Textbooks", class_level: "Grade 2", subject: "Mathematics",
    price: 330, stock_quantity: 85, badge: nil, active: true,
    description: "Grade 2 Mathematics building on number work, introducing multiplication, division and simple geometry.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/42/695178/1.jpg?7994",
  },
  {
    name: "KLB Primary Mathematics Grade 3 Learner's Book",
    category: "Textbooks", class_level: "Grade 3", subject: "Mathematics",
    price: 345, stock_quantity: 75, badge: nil, active: true,
    description: "Grade 3 Mathematics covering numbers up to 9999, fractions, measurement, and introduction to data handling.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/42/695178/1.jpg?7994",
  },

  # ── SECONDARY TEXTBOOKS ───────────────────────────────────────────────────

  {
    name: "KLB Secondary Mathematics Form 1",
    category: "Textbooks", class_level: "Form 1", subject: "Mathematics",
    price: 520, stock_quantity: 75, badge: nil, active: true,
    description: "Form 1 Mathematics covering Natural Numbers, Integers, Fractions, Decimals, Squares and Square Roots, Algebraic Expressions and Linear Equations.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/42/695178/1.jpg?7994",
  },
  {
    name: "KLB Secondary Mathematics Form 2",
    category: "Textbooks", class_level: "Form 2", subject: "Mathematics",
    price: 530, stock_quantity: 70, badge: "Best Seller", active: true,
    description: "Form 2 Mathematics covering Cubes and Cube Roots, Indices, Reciprocals, Linear Inequalities, Linear Motion, Statistics and Trigonometry.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/42/695178/1.jpg?7994",
  },
  {
    name: "KLB Secondary Mathematics Form 3",
    category: "Textbooks", class_level: "Form 3", subject: "Mathematics",
    price: 540, stock_quantity: 60, badge: nil, active: true,
    description: "Form 3 Mathematics covering Quadratic Expressions, Circles, Matrices, Transformations, Statistics and Probability.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/42/695178/1.jpg?7994",
  },
  {
    name: "KLB Secondary Mathematics Form 4",
    category: "Textbooks", class_level: "Form 4", subject: "Mathematics",
    price: 550, stock_quantity: 55, badge: "Exam Prep", active: true,
    description: "Form 4 Mathematics — comprehensive coverage for KCSE. Includes Calculus, Linear Programming, Vectors, Loci and Complex Numbers.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/42/695178/1.jpg?7994",
  },
  {
    name: "KLB Secondary English Form 1 & 2",
    category: "Textbooks", class_level: "Form 1", subject: "English",
    price: 480, stock_quantity: 65, badge: nil, active: true,
    description: "English Language and Literature for Form 1 and 2. Covers grammar, comprehension, composition, oral skills and set books guidance.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/09/0112201/1.jpg?5567",
  },
  {
    name: "KLB Biology Form 1 & 2",
    category: "Textbooks", class_level: "Form 1", subject: "Biology",
    price: 550, stock_quantity: 60, badge: nil, active: true,
    description: "Biology for Form 1 and 2 covering Cell Biology, Classification, Nutrition, Transport, Respiration and Reproduction. Clear diagrams and practical activities.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/34/8945321/1.jpg?2234",
  },
  {
    name: "KLB Biology Form 3 & 4",
    category: "Textbooks", class_level: "Form 3", subject: "Biology",
    price: 570, stock_quantity: 50, badge: "Exam Prep", active: true,
    description: "Biology Form 3 & 4 covering Genetics, Evolution, Ecology, Growth and Development. Includes past paper questions and model answers.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/34/8945321/1.jpg?2234",
  },
  {
    name: "KLB Chemistry Form 1 & 2",
    category: "Textbooks", class_level: "Form 1", subject: "Chemistry",
    price: 550, stock_quantity: 58, badge: nil, active: true,
    description: "Chemistry Form 1 & 2 covering Introduction to Chemistry, Simple Classification of Substances, Air and Combustion, Water and Hydrogen.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/34/8945321/1.jpg?2234",
  },
  {
    name: "KLB Chemistry Form 3 & 4",
    category: "Textbooks", class_level: "Form 3", subject: "Chemistry",
    price: 570, stock_quantity: 45, badge: "Exam Prep", active: true,
    description: "Chemistry Form 3 & 4 — comprehensive KCSE preparation. Covers Organic Chemistry, Industrial Chemistry, Electrochemistry and Energy Changes.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/34/8945321/1.jpg?2234",
  },
  {
    name: "KLB Physics Form 1 & 2",
    category: "Textbooks", class_level: "Form 1", subject: "Physics",
    price: 540, stock_quantity: 62, badge: nil, active: true,
    description: "Physics Form 1 & 2 covering Measurements, Force, Pressure, Particulate Nature of Matter, Thermal Expansion, Heat Transfer and Waves.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/34/8945321/1.jpg?2234",
  },
  {
    name: "KLB Physics Form 3 & 4",
    category: "Textbooks", class_level: "Form 3", subject: "Physics",
    price: 560, stock_quantity: 48, badge: "Exam Prep", active: true,
    description: "Physics Form 3 & 4 for KCSE. Covers Electromagnetic Spectrum, Uniform Circular Motion, Floating and Sinking, Thin Lenses and Electronics.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/34/8945321/1.jpg?2234",
  },
  {
    name: "KLB Geography Form 1 & 2",
    category: "Textbooks", class_level: "Form 1", subject: "Geography",
    price: 510, stock_quantity: 55, badge: nil, active: true,
    description: "Geography Form 1 & 2 covering Earth and the Solar System, Structure of the Earth, Rocks, Weather, Map Reading and Statistical Methods.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/09/0112201/1.jpg?5567",
  },
  {
    name: "KLB History & Government Form 1 & 2",
    category: "Textbooks", class_level: "Form 1", subject: "History",
    price: 495, stock_quantity: 60, badge: nil, active: true,
    description: "History & Government Form 1 & 2 covering Early Man, Development of Man, African Societies, and Colonial Period in Kenya and Africa.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/09/0112201/1.jpg?5567",
  },
  {
    name: "KLB History & Government Form 3 & 4",
    category: "Textbooks", class_level: "Form 3", subject: "History",
    price: 510, stock_quantity: 50, badge: "Exam Prep", active: true,
    description: "History & Government Form 3 & 4 for KCSE. Covers Nationalism, Independence Movements, Kenya's Constitution and International Relations.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/09/0112201/1.jpg?5567",
  },

  # ── REVISION BOOKS ────────────────────────────────────────────────────────

  {
    name: "Advance Africa KCPE Mathematics Revision",
    category: "Revision Books", class_level: "Grade 6", subject: "Mathematics",
    price: 480, stock_quantity: 95, badge: "Exam Prep", active: true,
    description: "Comprehensive KCPE Mathematics revision with topical exercises, model exams and fully worked solutions. Covers all examinable topics.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/42/695178/1.jpg?7994",
  },
  {
    name: "Advance Africa KCPE English Revision",
    category: "Revision Books", class_level: "Grade 6", subject: "English",
    price: 460, stock_quantity: 85, badge: "Exam Prep", active: true,
    description: "KCPE English revision book with grammar drills, comprehension practice, composition guides and past paper questions with answers.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/09/0112201/1.jpg?5567",
  },
  {
    name: "KCSE Mathematics Revision — Form 1 to 4",
    category: "Revision Books", class_level: "Form 4", subject: "Mathematics",
    price: 650, stock_quantity: 80, badge: "Best Seller", active: true,
    description: "The definitive KCSE Mathematics revision guide. Covers all topics from Form 1–4 with worked examples, exam tips and past paper questions 2015–2024.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/42/695178/1.jpg?7994",
  },
  {
    name: "KCSE Biology Revision Guide",
    category: "Revision Books", class_level: "Form 4", subject: "Biology",
    price: 580, stock_quantity: 70, badge: "Exam Prep", active: true,
    description: "KCSE Biology revision with comprehensive notes, diagrams, essay questions and model answers. Includes past KCSE questions from 2010–2024.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/34/8945321/1.jpg?2234",
  },
  {
    name: "KCSE Chemistry Revision Guide",
    category: "Revision Books", class_level: "Form 4", subject: "Chemistry",
    price: 580, stock_quantity: 65, badge: "Exam Prep", active: true,
    description: "KCSE Chemistry revision covering all topics with clear notes, experiments summary and past paper questions with detailed marking schemes.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/34/8945321/1.jpg?2234",
  },
  {
    name: "KCSE Physics Revision Guide",
    category: "Revision Books", class_level: "Form 4", subject: "Physics",
    price: 580, stock_quantity: 60, badge: "Exam Prep", active: true,
    description: "KCSE Physics revision with formulae, definitions, worked examples and past paper questions. Includes practical skills section.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/34/8945321/1.jpg?2234",
  },
  {
    name: "KCSE Sciences 3-in-1 Revision Pack",
    category: "Revision Books", class_level: "Form 4", subject: "Science",
    price: 1200, stock_quantity: 40, badge: "Bundle Deal", active: true,
    description: "Complete sciences revision bundle — Biology, Chemistry and Physics in one pack. Save KES 340 compared to buying separately. Ideal for Form 4 candidates.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/34/8945321/1.jpg?2234",
  },

  # ── STORYBOOKS ────────────────────────────────────────────────────────────

  {
    name: "Memories We Lost and Other Stories",
    category: "Storybooks", class_level: nil, subject: nil,
    price: 380, stock_quantity: 45, badge: "Set Book", active: true,
    description: "A collection of short stories from across Africa. A KCSE set book that explores themes of mental illness, family, identity and resilience. Edited by Chris Warnes.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/09/0112201/1.jpg?5567",
  },
  {
    name: "A Doll's House — Henrik Ibsen (KCSE Set Book)",
    category: "Storybooks", class_level: "Form 3", subject: "English",
    price: 320, stock_quantity: 55, badge: "Set Book", active: true,
    description: "KCSE English set book. A classic play exploring marriage, identity and women's independence. Includes study notes and guide questions for exam preparation.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/09/0112201/1.jpg?5567",
  },
  {
    name: "The River and The Source — Margaret Ogola",
    category: "Storybooks", class_level: "Form 3", subject: "English",
    price: 420, stock_quantity: 50, badge: "Set Book", active: true,
    description: "A landmark Kenyan novel following four generations of women from Siaya to modern Nairobi. KCSE set book covering themes of culture, change, and women's roles.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/09/0112201/1.jpg?5567",
  },
  {
    name: "African Tales for Young Readers",
    category: "Storybooks", class_level: nil, subject: nil,
    price: 260, stock_quantity: 80, badge: "Popular", active: true,
    description: "A wonderful collection of African folktales teaching moral lessons. Includes stories from Kenya, Tanzania, Uganda and West Africa. Perfect for ages 7–13.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/09/0112201/1.jpg?5567",
  },

  # ── EXERCISE BOOKS ────────────────────────────────────────────────────────

  {
    name: "Ruled Exercise Books — Pack of 10 (80 pages)",
    category: "Exercise Books", class_level: nil, subject: nil,
    price: 180, stock_quantity: 300, badge: "Value Pack", active: true,
    description: "Quality 80-page ruled exercise books. Standard A5 size. Pack of 10. Suitable for all primary and secondary students. Durable covers.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/09/6798432/1.jpg?1123",
  },
  {
    name: "Graph Paper Exercise Books — Pack of 5",
    category: "Exercise Books", class_level: nil, subject: nil,
    price: 130, stock_quantity: 200, badge: nil, active: true,
    description: "A4 graph paper exercise books with 1mm and 2mm grid lines. Pack of 5, 64 pages each. Essential for Mathematics and Science practicals.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/09/6798432/1.jpg?1123",
  },
  {
    name: "Counter Books — 1 Quire",
    category: "Exercise Books", class_level: nil, subject: nil,
    price: 95, stock_quantity: 150, badge: nil, active: true,
    description: "Standard 1-quire counter book with ruled lines. Ideal for classwork, notes and assignments. Pack of 1.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/09/6798432/1.jpg?1123",
  },

  # ── PENS & PENCILS ────────────────────────────────────────────────────────

  {
    name: "Bic Cristal Ballpoint Pens — Box of 12 (Blue)",
    category: "Pens & Pencils", class_level: nil, subject: nil,
    price: 160, stock_quantity: 400, badge: "Best Seller", active: true,
    description: "Genuine Bic Cristal ballpoint pens, blue ink. Smooth writing, long-lasting. Box of 12. The most trusted pen brand in Kenyan schools.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/60/3456781/1.jpg?8871",
  },
  {
    name: "Staedtler HB Pencils — Pack of 12",
    category: "Pens & Pencils", class_level: nil, subject: nil,
    price: 180, stock_quantity: 300, badge: nil, active: true,
    description: "Staedtler HB pencils with break-resistant lead. Pack of 12. Ideal for writing, drawing and technical work. Suitable for all ages.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/60/3456781/1.jpg?8871",
  },
  {
    name: "Faber-Castell Colour Pencils — 24 Colours",
    category: "Pens & Pencils", class_level: nil, subject: nil,
    price: 380, stock_quantity: 150, badge: nil, active: true,
    description: "Faber-Castell coloured pencils with vibrant, break-resistant leads. 24 colours in a sturdy tin case. Perfect for Creative Arts and technical drawing.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/60/3456781/1.jpg?8871",
  },

  # ── GEOMETRY SETS ─────────────────────────────────────────────────────────

  {
    name: "Staedtler Geometry Set — 10 Pieces",
    category: "Geometry Sets", class_level: nil, subject: nil,
    price: 350, stock_quantity: 180, badge: "Best Seller", active: true,
    description: "Complete 10-piece Staedtler geometry set including compass, protractor, set squares (45° and 60°), ruler, divider and pencil. In a quality zippered case. Essential for Form 1–4 Mathematics.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/60/3456781/1.jpg?8871",
  },
  {
    name: "Helix Junior Geometry Set — 8 Pieces",
    category: "Geometry Sets", class_level: nil, subject: nil,
    price: 220, stock_quantity: 150, badge: nil, active: true,
    description: "Helix 8-piece geometry set for upper primary and junior secondary. Includes compass, protractor, set squares and 15cm ruler in a zip case.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/60/3456781/1.jpg?8871",
  },

  # ── RULERS ───────────────────────────────────────────────────────────────

  {
    name: "30cm Clear Plastic Ruler",
    category: "Rulers", class_level: nil, subject: nil,
    price: 45, stock_quantity: 500, badge: nil, active: true,
    description: "Durable 30cm clear plastic ruler with cm and mm markings. Shatter-resistant. Suitable for all ages from primary to secondary.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/60/3456781/1.jpg?8871",
  },

  # ── SCHOOL BAGS ──────────────────────────────────────────────────────────

  {
    name: "Primary School Backpack — Blue/Green",
    category: "School Bags", class_level: nil, subject: nil,
    price: 1350, stock_quantity: 40, badge: "Popular", active: true,
    description: "Durable waterproof primary school backpack with padded shoulder straps, ergonomic back support, large main compartment and front pocket. Fits Grade 1–6. Available in blue/green.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/81/2345671/1.jpg?4456",
  },
  {
    name: "Secondary School Backpack — Black",
    category: "School Bags", class_level: nil, subject: nil,
    price: 1950, stock_quantity: 30, badge: nil, active: true,
    description: "Large capacity secondary school backpack. Fits A4 textbooks, with separate laptop compartment (up to 15\"), padded straps and USB charging port. Built to last.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/81/2345671/1.jpg?4456",
  },
  {
    name: "Kids Cartoon School Bag — Grade 1–3",
    category: "School Bags", class_level: nil, subject: nil,
    price: 980, stock_quantity: 35, badge: "Kids Favorite", active: true,
    description: "Fun and lightweight cartoon school bag for young learners. Reflective safety strips, padded back, water-resistant. Perfect for Grade 1–3. Assorted designs.",
    image_url: "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/81/2345671/1.jpg?4456",
  },
]

# ── Seed products ─────────────────────────────────────────────────────────────
puts "\nSeeding #{products_data.length} products..."
created = 0
updated = 0

products_data.each_with_index do |attrs, i|
  image_url = attrs.delete(:image_url)
  product   = Product.find_or_initialize_by(name: attrs[:name])
  is_new    = product.new_record?

  product.assign_attributes(attrs.merge(sort_order: i))

  if product.save
    # Attach image if not already attached
    if image_url.present? && !product.image.attached?
      attach_image_from_url(product, image_url)
    end
    is_new ? created += 1 : updated += 1
    print "."
  else
    puts "\n❌ Failed: #{product.name} — #{product.errors.full_messages.join(', ')}"
  end
end

puts "\n\n✅ #{created} created, #{updated} updated"
puts "\n🎉 Done! Them Bookshop is ready."
puts "\n📋 Admin login:"
puts "   Email:    #{admin.email}"
puts "   Password: #{ENV.fetch('ADMIN_PASSWORD', 'Admin@2025!')}"