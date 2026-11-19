require "rails_helper"

RSpec.describe ProductCatalog do
  def classify(raw_name, category:, subcategory:, stage: nil)
    described_class.classify(raw_name: raw_name, category: category, subcategory: subcategory, stage: stage)
  end

  describe ".classify" do
    it "puts Fasihi under Kiswahili rather than beside it" do
      result = classify("10-FANI YA FASIHI SIMULIZI", category: "Books", subcategory: "Textbooks")

      expect(result[:subject]).to eq("Kiswahili")
      expect(result[:subsubject]).to eq("Fasihi")
      expect(result[:class_levels]).to eq(["Grade 10"])
    end

    it "gives Kiswahili set books the Fasihi component" do
      result = classify("MASKINI MILIONEA", category: "Books", subcategory: "Set Books & Literature")

      expect(result[:subcategory]).to eq("Set Books & Literature")
      expect(result[:subject]).to eq("Kiswahili")
      expect(result[:subsubject]).to eq("Fasihi")
    end

    it "gives English set books the Literature component" do
      result = classify("MEMORIES WE LOST", category: "Books", subcategory: "Set Books & Literature")

      expect(result[:subject]).to eq("English")
      expect(result[:subsubject]).to eq("Literature")
    end

    it "classifies kamusi as a Kiswahili reference" do
      result = classify("KAMUSI SANIFU", category: "Books", subcategory: "Reference & Dictionaries")

      expect(result[:subcategory]).to eq("Reference & Dictionaries")
      expect(result[:subject]).to eq("Kiswahili")
      expect(result[:subsubject]).to be_nil
    end

    it "keeps Bibles religious without a school subject" do
      result = classify("KISWAHILI BIBLE", category: "Books", subcategory: "Bibles & Religious")

      expect(result[:subcategory]).to eq("Bibles & Religious")
      expect(result[:subject]).to be_nil
    end

    it "moves revision series into Revision & Exam Prep" do
      result = classify("HIGH FLYER PHYSICS", category: "Books", subcategory: "Textbooks")

      expect(result[:subcategory]).to eq("Revision & Exam Prep")
      expect(result[:subject]).to eq("Physics")
    end

    it "promotes a paired form title to two class levels" do
      result = classify("SPOTLIGHT BIOLOGY F3 & 4", category: "Books", subcategory: "Textbooks")

      expect(result[:subject]).to eq("Biology")
      expect(result[:class_levels]).to eq(["Form 3", "Form 4"])
    end

    it "stores a stage instead of a class level for stage-wide references" do
      result = classify("360 SEC ATLAS", category: "Books", subcategory: "Reference & Dictionaries", stage: "Secondary (8-4-4)")

      expect(result[:class_levels]).to be_empty
      expect(result[:stage]).to eq("Secondary (8-4-4)")
      expect(result[:subject]).to eq("Geography")
    end

    it "leaves stationery without a subject" do
      result = classify("80PGS SUPERIOR", category: "Stationery", subcategory: "Exercise Books & Notebooks")

      expect(result[:subject]).to be_nil
      expect(result[:class_levels]).to be_empty
    end
  end
end
