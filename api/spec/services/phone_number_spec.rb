require "rails_helper"

RSpec.describe PhoneNumber do
  describe ".normalize" do
    it "normalises local, spaced, and international formats to 2547XXXXXXXX" do
      expect(described_class.normalize("0712 345 678")).to eq("254712345678")
      expect(described_class.normalize("0712345678")).to eq("254712345678")
      expect(described_class.normalize("+254 712 345 678")).to eq("254712345678")
      expect(described_class.normalize("254712345678")).to eq("254712345678")
      expect(described_class.normalize("712345678")).to eq("254712345678")
    end

    it "keeps non-Kenyan input as digits" do
      expect(described_class.normalize("+44 7700 900123")).to eq("447700900123")
    end
  end

  describe ".valid?" do
    it "accepts Kenyan mobile numbers" do
      expect(described_class.valid?("0712 345 678")).to be(true)
      expect(described_class.valid?("+254112345678")).to be(true)
    end

    it "rejects invalid numbers" do
      expect(described_class.valid?("12345")).to be(false)
      expect(described_class.valid?("")).to be(false)
      expect(described_class.valid?("0812345678")).to be(false)
    end
  end

  describe ".local" do
    it "returns the local display format" do
      expect(described_class.local("+254712345678")).to eq("0712345678")
    end

    it "returns the original value when it cannot be normalised" do
      expect(described_class.local("n/a")).to eq("n/a")
    end
  end
end
