require "rails_helper"

RSpec.describe "Api::V1::Products", type: :request do
  let!(:textbook) do
    create(
      :product,
      name: "KLB Biology Form 3",
      category: "Books",
      subcategory: "Textbooks",
      subject: "Biology",
      subsubject: nil,
      class_levels: ["Form 3"],
      class_level: "Form 3"
    )
  end

  let!(:revision) do
    create(
      :product,
      name: "High Flyer Physics",
      category: "Books",
      subcategory: "Revision & Exam Prep",
      subject: "Physics",
      subsubject: nil,
      class_levels: ["Form 4"],
      class_level: "Form 4"
    )
  end

  let!(:fasihi) do
    create(
      :product,
      name: "Fani ya Fasihi Simulizi",
      category: "Books",
      subcategory: "Textbooks",
      subject: "Kiswahili",
      subsubject: "Fasihi",
      class_levels: ["Grade 10"],
      class_level: "Grade 10"
    )
  end

  let!(:inactive) { create(:product, name: "Hidden Book", active: false) }

  def body
    JSON.parse(response.body)
  end

  describe "GET /api/v1/products" do
    it "returns only active products" do
      get "/api/v1/products"

      names = body["data"].map { |product| product["name"] }
      expect(names).to include(textbook.name)
      expect(names).not_to include(inactive.name)
    end

    it "filters by subcategory" do
      get "/api/v1/products", params: { subcategory: "Revision & Exam Prep" }

      expect(body["data"].map { |product| product["name"] }).to contain_exactly(revision.name)
      expect(body["meta"]["total_count"]).to eq(1)
    end

    it "filters by any class level in the array" do
      get "/api/v1/products", params: { class_level: "Form 4" }

      expect(body["data"].map { |product| product["name"] }).to contain_exactly(revision.name)
    end

    it "filters a subject component such as Fasihi" do
      get "/api/v1/products", params: { subject: "Kiswahili", subsubject: "Fasihi" }

      expect(body["data"].map { |product| product["name"] }).to contain_exactly(fasihi.name)
    end

    it "includes the taxonomy labels in the payload" do
      get "/api/v1/products", params: { q: "KLB Biology" }

      product = body["data"].first
      expect(product["subcategory"]).to eq("Textbooks")
      expect(product["level_label"]).to eq("Form 3")
      expect(product["category_label"]).to eq("Books · Textbooks")
    end
  end

  describe "GET /api/v1/products/:id" do
    it "returns the product" do
      get "/api/v1/products/#{textbook.id}"

      expect(response).to have_http_status(:ok)
      expect(body["data"]["name"]).to eq(textbook.name)
    end
  end

  describe "GET /api/v1/products/facets" do
    it "nests subcategory counts under departments" do
      get "/api/v1/products/facets"

      books = body["data"]["categories"].find { |entry| entry["name"] == "Books" }
      textbooks = books["subcategories"].find { |entry| entry["name"] == "Textbooks" }

      expect(textbooks["count"]).to be >= 1
    end

    it "nests Fasihi under Kiswahili" do
      get "/api/v1/products/facets"

      kiswahili = body["data"]["subjects"].find { |entry| entry["name"] == "Kiswahili" }
      fasihi_entry = kiswahili["components"].find { |entry| entry["name"] == "Fasihi" }

      expect(fasihi_entry["count"]).to eq(1)
    end
  end

  describe "GET /api/v1/products/meta" do
    it "exposes the taxonomy used by the admin form" do
      get "/api/v1/products/meta"

      data = body["data"]
      books = data["categories"].find { |entry| entry["name"] == "Books" }
      kiswahili = data["subjects"].find { |entry| entry["name"] == "Kiswahili" }

      expect(books["subcategories"]).to include("Textbooks", "Revision & Exam Prep")
      expect(kiswahili["components"]).to include("Fasihi")
      expect(data["stages"].map { |entry| entry["name"] }).to include("Secondary (8-4-4)")
    end
  end
end
