# Resolves a raw Excel row into the storefront taxonomy. Section metadata from
# db/seeds/catalogue.rb supplies the default shelf; this class only overrides it
# when the title clearly belongs somewhere else (revision guides, atlases,
# Bibles, set books) and infers the subject / component.
class ProductCatalog
  RELIGIOUS = /\b(BIBLE|GOOD NEWS|NKJIV|RSV|NIV|KIROHO|ROHO|KUINIRA|NYIMBO|THARA|GOLDEN BELLS|KUGUNA|IBUKU)\b/i

  REFERENCE = /\b(ENCYCLOPEDIA|DICTIONARY|KAMUSI|ATLAS|MAP OF KENYA|KEY WORDS)\b/i

  REVISION = /
    \b(HIGH\ FLYER|TARGETER\ TRACKER|SMARTWAY\ BOOSTER|PIONEER\ REVISION|GUIDE)\b |
    \b(KCSE\ MADE\ FAMILIAR|KMF|KNEC\ TABLES|TOP\ NOTCH|MIRROR|MASTERPIECE|MASTER\ PIECE)\b |
    \b(A\ PLUS|HOW\ TO\ PASS|MASTERING|GET\ IT\ RIGHT|SOLVING\ PROBLEMS|BETTER\ COMPOSITION|BETTER\ ENGLISH)\b
  /xi

  KISWAHILI_MARKERS = %w[
    KISWAHILI FASIHI SIMULIZI FASAHA STADI KUSOMA KUANDIKA MWANGAZA CHECHE
    DADISI FANI KAULI KIELEKEI KIELEKEZI KAMUSI CHANZO KURUNZI JIFUNZE KIS
    SOMA
    MASKINI MASHETANI MSTAHIKI MAPAMBAZUKO KOSA NGUU BEMBEA MASHIMO KIGOGO
    CHOZI KABURI KIJANA UTEUZI MSHALE WEMA HIDAYA NDOTO HODI MAISHA BENDI
    MLEMAVU MWANA NYAMA KASUKU MJI
  ].freeze

  # Evaluated in order; the first match wins. Keep broad families (English) above
  # the subject-specific titles so "BETTER ENGLISH P1" stays English.
  SUBJECT_PATTERNS = {
    "Mathematics" => /
      \bMATHS?\b | \bMATHEMATICS\b | HESABU | PMATH
    /xi,
    "English" => /
      \bENGLISH\b | \bENG\b |
      SKILLS\s+IN\s+ENG | HEAD\s*START\s+ENG | TOP\s+SCHOLAR\s+ENG |
      MENTOR\s+ENG | VISIONARY\s+ENG | PROGRESSIVE\s+ENG | PROG\s+ENG |
      BETTER\s+ENG | BETTER\s+COMPOSITION | SUPER\s+MINDS\s+ENG |
      READ\s+WITH\s+US | SOUND\s*(?:AND|&)\s*READ | MASTERING\s+SOUND |
      NPPE | NEW\s+PROGRESSIVE\s+PRIMARY\s+ENGLISH
    /xi,
    "Pre-Technical" => /
      PRE[\s.-]*TECH | TECHNICAL\s+EDU | OXFORD\s+PRETEC | TOP\s+SCOLAR\s+PRE
    /xi,
    "Creative Arts" => /CREATIVE\s+ARTS/i,
    "CRE" => /
      \bCRE\b | GROWING\s+IN\s+CHRIST | GROW\s+IN\s+CHRIST | KNOWING\s+GOD |
      KUINIRA\s+NGAI | VISIONARY\s+CRE | MENTOR\s+CRE | SPOTLIGHT\s+CRE |
      TOP\s+SCHOLAR\s+CRE
    /xi,
    "Agriculture" => /AGRICULTURE|AGRI/i,
    "Social Studies" => /
      SOCIAL\s+STUDIES | SOCIAL\s+SCIENCE | SS\s+GUIDE | EVOLVING\s+WORLD\s+SS |
      MORAN\s+SS | ESSENTIAL\s+COMMUNITY | OUR\s+LIVES | OURLIVES |
      OUR\s+WORLD\s+ENV | ENVIRONMENT | SUPERMINDS\s+SS | LONGHORN\s+SS |
      VISIONARY\s+SS | MENTOR\s+SS | SUPER\s+MINDS\s+SS | SPOTLIGHT\s+SS |
      TOP\s+SCHOLAR\s+SS
    /xi,
    "Business" => %r{BUSINESS|B/STUDIES|BOOKLIST\s+MASTER\s+B}i,
    "Biology" => /\bBIO\b|BIOLOGY/i,
    "Chemistry" => /\bCHEM\b|CHEMISTRY/i,
    "Physics" => /PHYSICS/i,
    "Geography" => /\bGEO\b|GEOGRAPHY/i,
    "History" => /HISTORY/i,
    "Science" => /SCIENCE|INTEGRATED\s+SCI|SPARK\s+INTEGRATED|SPOTLIGHT\s+INTEGRATED/i
  }.freeze

  class << self
    def classify(raw_name:, category:, subcategory:, stage: nil)
      title       = raw_name.to_s
      category    = category.to_s
      subcategory = subcategory.to_s

      subcategory = books_subcategory(title, subcategory) if category == "Books"

      subject, subsubject = subject_pair(title, category: category, subcategory: subcategory)

      levels = ProductNameNormalizer.parse_levels(title)
      stage  = levels.any? ? nil : (stage.presence || ProductNameNormalizer.parse_stage(title))

      {
        category: category,
        subcategory: subcategory,
        subject: subject,
        subsubject: subsubject,
        class_levels: levels,
        stage: stage
      }
    end

    private

    def books_subcategory(title, fallback)
      return "Bibles & Religious"       if title.match?(RELIGIOUS)
      return "Reference & Dictionaries" if title.match?(REFERENCE)
      return "Revision & Exam Prep"     if title.match?(REVISION)

      fallback
    end

    def subject_pair(title, category:, subcategory:)
      return [nil, nil] unless category == "Books"
      return [nil, nil] if subcategory == "Bibles & Religious"

      if subcategory == "Reference & Dictionaries"
        return ["Kiswahili", nil] if title.match?(/KAMUSI/i)
        return ["Geography", nil] if title.match?(/ATLAS|MAP OF KENYA/i)

        return [nil, nil]
      end

      if ["Set Books & Literature", "Readers & Storybooks"].include?(subcategory)
        kiswahili = kiswahili_title?(title)
        return [kiswahili ? "Kiswahili" : "English", kiswahili ? "Fasihi" : "Literature"]
      end

      subject = infer_subject(title)
      return [nil, nil] unless subject

      [subject, infer_subsubject(title, subject)]
    end

    def kiswahili_title?(title)
      title.upcase.scan(/[A-Z]+/).intersect?(KISWAHILI_MARKERS)
    end

    def infer_subject(title)
      return "Kiswahili" if kiswahili_title?(title)

      text = title.upcase
      SUBJECT_PATTERNS.each do |subject, pattern|
        return subject if text.match?(pattern)
      end

      nil
    end

    def infer_subsubject(title, subject)
      text = title.upcase

      case subject
      when "Kiswahili"
        return "Fasihi" if text.match?(/FASIHI|SIMULIZI/)
        return "Insha"  if text.match?(/INSHA|COMPOSITION/)

        "Lugha"
      when "English"
        return "Literature"  if text.match?(/LITERATURE|PEARL|PARLIAMENT|WHALERIDER|MEMORIES|SAMARITAN|INHERITANCE/)
        return "Composition" if text.match?(/COMPOSITION/)

        "Language"
      end
    end
  end
end
