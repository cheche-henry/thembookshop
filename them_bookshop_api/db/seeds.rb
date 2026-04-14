# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
# Create Admin
AdminUser.find_or_create_by!(email: 'hisnameishenry01@gmail.com') do |u|
  u.password = 'SecureAdminPass123!'
end

# Create Sample Products
products_data = [
  { name: 'Mathematics Grade 1', price: 450, category: 'Textbooks', class_level: 'Grade 1', subject: 'Mathematics', stock_quantity: 50, description: 'CBC aligned Grade 1 Math textbook.' },
  { name: 'English Form 1', price: 650, category: 'Textbooks', class_level: 'Form 1', subject: 'English', stock_quantity: 40, description: 'Secondary English curriculum book.' },
  { name: 'KCPE Revision Guide', price: 850, category: 'Revision', class_level: 'Grade 6', subject: 'Mixed', stock_quantity: 100, description: 'Complete KCPE past papers & answers.' },
  { name: 'Mathematical Set', price: 150, category: 'Stationery', class_level: 'All Levels', subject: 'Mathematics', stock_quantity: 200, description: 'Geometry set with compass & protractor.' },
  { name: 'School Backpack', price: 1200, category: 'School Bags', class_level: 'All Levels', stock_quantity: 30, description: 'Waterproof, ergonomic school bag.' }
]

products_data.each do |data|
  Product.find_or_create_by!(name: data[:name]) do |p|
    p.assign_attributes(data)
  end
end

puts "✅ Seeded #{Product.count} products & admin user."