require "rails_helper"

RSpec.describe ProductNameNormalizer do
  describe ".display_name" do
    it "turns Excel shorthand into a readable name with the level suffix" do
      expect(described_class.display_name("F3 BIO KLB")).to eq("KLB Biology — Form 3")
    end

    it "renders a multi-level span" do
      expect(described_class.display_name("SPOTLIGHT BIOLOGY F3 & 4")).to eq("Spotlight Biology — Form 3–4")
    end

    it "expands an acronym and normalises the grade" do
      expect(described_class.display_name("NPPE GR 2"))
        .to eq("New Progressive Primary English — Grade 2")
    end

    it "fixes common typos from the stock sheet" do
      expect(described_class.display_name("0BAMA")).to eq("Obama")
      expect(described_class.display_name("DUSTLESS CHAK COLOURED")).to eq("Dustless Chalk Coloured")
    end
  end

  describe ".source_key" do
    it "is stable across case, punctuation and spacing" do
      expect(described_class.source_key("F3 BIO KLB")).to eq("f3-bio-klb")
      expect(described_class.source_key("  f3 bio-klb ")).to eq("f3-bio-klb")
    end
  end

  describe ".parse_levels" do
    it "reads form ranges as separate levels" do
      expect(described_class.parse_levels("TARGETER CHEMISTRY F3&4")).to eq(["Form 3", "Form 4"])
    end

    it "reads prefix grades and pre-primary levels" do
      expect(described_class.parse_levels("7-MENTOR MATHS")).to eq(["Grade 7"])
      expect(described_class.parse_levels("PP1-FIRST STEP LANGUAGE")).to eq(["PP1"])
    end
  end

  describe ".parse_stage" do
    it "treats SEC and JSS as stage hints, not class levels" do
      expect(described_class.parse_stage("360 SEC ATLAS")).to eq("Secondary (8-4-4)")
      expect(described_class.parse_stage("360 JUNIOR SEC ATLAS")).to eq("Junior Secondary")
      expect(described_class.parse_stage("7-MENTOR MATHS")).to be_nil
    end
  end

  describe ".level_label" do
    it "collapses a consecutive range" do
      expect(described_class.level_label(["Form 3", "Form 4"])).to eq("Form 3–4")
    end

    it "joins non-consecutive levels" do
      expect(described_class.level_label(["Grade 7", "Grade 9"])).to eq("Grade 7 & Grade 9")
    end
  end

  describe ".review_flags" do
    it "flags the unresolved PMATH row" do
      expect(described_class.review_flags("3-PMATH")).to include("PMATH")
    end
  end
end
