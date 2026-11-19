require "rails_helper"

RSpec.describe Product, type: :model do
  it "has a valid factory" do
    expect(build(:product)).to be_valid
  end

  describe "taxonomy validations" do
    it "rejects a subcategory from another department" do
      product = build(:product, category: "Books", subcategory: "Calculators")

      expect(product).not_to be_valid
      expect(product.errors[:subcategory]).to include("is not available under Books")
    end

    it "allows Fasihi as a Kiswahili component" do
      product = build(:product, subject: "Kiswahili", subsubject: "Fasihi")

      expect(product).to be_valid
    end

    it "rejects a component that does not belong to the subject" do
      product = build(:product, subject: "English", subsubject: "Fasihi")

      expect(product).not_to be_valid
      expect(product.errors[:subsubject]).to include("is not a component of English")
    end

    it "rejects unknown class levels" do
      product = build(:product, class_levels: ["Form 9"])

      expect(product).not_to be_valid
      expect(product.errors[:class_levels].first).to include("unknown level")
    end
  end

  describe "scopes" do
    it "matches a product when any of its class levels is requested" do
      paired = create(:product, class_levels: ["Form 3", "Form 4"], class_level: "Form 3")
      other  = create(:product, class_levels: ["Grade 7"], class_level: "Grade 7")

      expect(described_class.by_level("Form 4")).to contain_exactly(paired)
      expect(described_class.by_level("Grade 7")).to contain_exactly(other)
    end

    it "filters by subcategory, subject and stage" do
      product = create(
        :product,
        subcategory: "Reference & Dictionaries",
        subject: "Geography",
        subsubject: nil,
        class_levels: [],
        class_level: nil,
        stage: "Secondary (8-4-4)"
      )

      expect(described_class.by_subcategory("Reference & Dictionaries")).to include(product)
      expect(described_class.by_subject("Geography")).to include(product)
      expect(described_class.by_stage("Secondary (8-4-4)")).to include(product)
    end
  end

  describe "labels" do
    it "describes a multi-level book" do
      product = build(:product, class_levels: ["Form 3", "Form 4"])

      expect(product.level_label).to eq("Form 3–4")
    end

    it "combines the subject and its component" do
      product = build(:product, subject: "Kiswahili", subsubject: "Fasihi")

      expect(product.subject_label).to eq("Kiswahili · Fasihi")
    end

    it "combines the department and subcategory" do
      product = build(:product, category: "Stationery", subcategory: "Calculators", subject: nil)

      expect(product.category_label).to eq("Stationery · Calculators")
    end
  end
end
