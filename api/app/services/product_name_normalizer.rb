# Turns the abbreviations used on the physical-store Excel sheet into readable
# product names and stable identity keys.
#
#   ProductNameNormalizer.display_name("SPOTLIGHT BIOLOGY F3 & 4")
#   # => "Spotlight Biology — Form 3–4"
#   ProductNameNormalizer.source_key("F3 BIO KLB")
#   # => "f3-bio-klb"
class ProductNameNormalizer
  PREFIX     = /\A(PP\d|\d{1,2})\s*-\s*/i
  FORM_PAIR  = /\bF(?:ORM)?\.?\s*([1-4])\s*(?:&|\bAND\b)\s*([1-4])\b/i
  FORM       = /\bF(?:ORM)?\.?\s*([1-4])\b/i
  GRADE      = /\bGR(?:ADE)?\.?\s*(\d{1,2})\b/i
  PP         = /\bPP\.?\s*([12])\b/i
  JUNIOR_SEC = /\bJUNIOR\s+SEC(?:ONDARY)?\b|\bJSS\b/i
  SECONDARY  = /\bSEC(?:ONDARY)?\b/i

  # Excel shorthand → customer-facing text. Applied as whole tokens so
  # "MATHS" is never rewritten by the "MATH" entry.
  ABBREVIATIONS = {
    "L/HORN" => "Longhorn",
    "LHORN" => "Longhorn",
    "MAC" => "Macmillan",
    "NPPE" => "New Progressive Primary English",
    "KMF" => "KCSE Made Familiar",
    "COMPRE" => "Comprehensive",
    "HCOVER" => "Hardcover",
    "B/STUDIES" => "Business Studies",
    "SS" => "Social Studies",
    "CSL" => "Community Service Learning",
    "KIS" => "Kiswahili",
    "ENG" => "English",
    "BIO" => "Biology",
    "CHEM" => "Chemistry",
    "GEO" => "Geography",
    "AGRI" => "Agriculture",
    "MATHS" => "Mathematics",
    "MATH" => "Mathematics",
    "PRETECHNICAL" => "Pre-Technical",
    "SEC" => "Secondary",
    "JSS" => "Junior Secondary",
    "P1" => "Paper 1",
    "P2" => "Paper 2",
    "PGS" => "Pages",
    "EVERDAY" => "Everyday",
    "AGRICLUTURE" => "Agriculture",
    "KIELEKEI" => "Kielekezi",
    "QUENNEX" => "Queenex",
    "QUENEX" => "Queenex",
    "CHAK" => "Chalk",
    "NBOOK" => "Notebook",
    "SCOLAR" => "Scholar",
    "AXTIVE" => "Active",
    "METALIC" => "Metallic",
    "WOOVEN" => "Woven",
    "CLOCHET" => "Crochet",
    "PORTIFOLIO" => "Portfolio",
    "WHITLE" => "Whistle",
    "DISCUSS" => "Discus",
    "AMBASSANDORS" => "Ambassadors",
    "SILIENT" => "Silent",
    "0BAMA" => "Obama",
    "STAEDLER" => "Staedtler",
    "TECHINICAL" => "Technical",
    "STANDI" => "Stadi",
    "MAZOEI" => "Mazoezi",
    "OURLIVES" => "Our Lives",
    "OURWORLD" => "Our World",
    "FULLSCAPS" => "Fullscap",
    "36O" => "360",
    "A6ENVELOP" => "A6 Envelope",
    "A7ENVELOP" => "A7 Envelope"
  }.freeze

  PHRASES = {
    /\bMASTER\s+PIECE\b/i => "Masterpiece",
    /\bNON\s+SHARPEN\b/i => "Non Sharpening",
    /\bTHUMB\s+TAC\b/i => "Thumb Tack",
    /\bENVELOP\b/i => "Envelope"
  }.freeze

  PUBLISHERS = {
    "KLB" => "KLB",
    "MACMILLAN" => "Macmillan",
    "MTP" => "MTP",
    "LONGHORN" => "Longhorn",
    "OXFORD" => "Oxford"
  }.freeze

  PRESERVE = %w[
    KLB MTP KMF KCSE KNEC CBC CRE PP1 PP2 A4 A5 A6 A7 AA AAA PVC DL ISBN
    NIV NKJIV RSV CD DVD HB JSS CSL JKF BIC KKY HJ
  ].freeze

  SMALL_WORDS = %w[
    a an and the of in on for to with no
    ya za wa na la cha vya kwa cia ria
  ].freeze

  class << self
    def display_name(raw_name)
      text = expand(title_text(raw_name))
      text = reorder_publisher(text)
      text = titleize(text)
      text = raw_name.to_s.strip if text.blank?

      levels = parse_levels(raw_name)
      label  = levels.any? ? level_label(levels) : nil
      label ? "#{text} — #{label}" : text
    end

    # Stable key for a row on the Excel sheet. Deliberately does not expand
    # abbreviations, so a later rename cannot create a second product.
    def source_key(raw_name)
      raw_name.to_s.strip.downcase
              .gsub(/\s+/, "-")
              .gsub(/[^a-z0-9]+/, "-")
              .gsub(/\A-+|-+\z/, "")
    end

    def parse_levels(raw_name)
      text   = raw_name.to_s
      levels = []

      levels << level_for(text[PREFIX, 1]) if text.match?(PREFIX)

      text.scan(FORM_PAIR).each { |from, to| levels.push(level_for("F#{from}"), level_for("F#{to}")) }
      text.scan(FORM).flatten.each { |n| levels << level_for("F#{n}") }
      text.scan(GRADE).flatten.each { |n| levels << grade_level(n) }
      text.scan(PP).flatten.each { |n| levels << "PP#{n}" }

      levels.compact.uniq
    end

    def parse_stage(raw_name)
      return "Junior Secondary" if raw_name.to_s.match?(JUNIOR_SEC)
      return "Secondary (8-4-4)" if raw_name.to_s.match?(SECONDARY)

      nil
    end

    def level_label(levels)
      list = Array(levels).compact_blank
      return nil if list.empty?
      return list.first if list.one?

      first = list.first
      last  = list.last
      prefix = first[/\A(.+?)\s+\d+\z/, 1]
      first_number = first[/\d+\z/].to_i

      if prefix && last.match?(/\A#{Regexp.escape(prefix)}\s+\d+\z/) &&
         last[/\d+\z/].to_i == first_number + list.size - 1
        "#{prefix} #{first_number}–#{last[/\d+\z/]}"
      else
        list.join(" & ")
      end
    end

    # Words that look like a typo or an unresolved abbreviation. Used by the
    # seed audit so these rows get a human review instead of a silent guess.
    def review_flags(raw_name)
      text = raw_name.to_s.upcase
      flags = []
      flags << "PMATH" if text.match?(/\bPMATH\b/)
      flags
    end

    private

    def level_for(token)
      value = token.to_s.strip.upcase
      case value
      when "PP1", "PP2"
        value
      when /\A(?:F|FORM)\s*([1-4])\z/
        "Form #{Regexp.last_match(1)}"
      when /\A(?:G|GR|GRADE)\s*(\d{1,2})\z/
        grade_level(Regexp.last_match(1))
      when /\A\d{1,2}\z/
        grade_level(value)
      end
    end

    def grade_level(number)
      value = number.to_i
      value.between?(1, 12) ? "Grade #{value}" : nil
    end

    # Removes the level markers from the title: they are rendered separately as
    # the "— Form 3" suffix.
    def title_text(raw_name)
      text = raw_name.to_s.strip
      text = text.sub(PREFIX, "")
      text = text.sub(/\A(?:PP\d)\s+/i, "")
      text = text.gsub(FORM_PAIR, " ")
      text = text.gsub(FORM, " ")
      text = text.gsub(GRADE, " ")
      text.gsub(/\s+/, " ").strip
    end

    def expand(text)
      result = text.dup
      PHRASES.each { |pattern, replacement| result.gsub!(pattern, replacement) }

      result.gsub!(/(\d)\s*PGS\b/i, '\1 Pages')
      result.gsub!(/\bBK\s*(\d)\b/i, 'Book \1')
      result.gsub!(/\bVOL\s*(\d)\b/i, 'Volume \1')

      ABBREVIATIONS.each do |from, to|
        result.gsub!(/\b#{Regexp.escape(from)}\b/i, to)
      end

      result.squeeze(" ").strip
    end

    def reorder_publisher(text)
      tokens = text.split
      return text if tokens.size < 2

      publisher = PUBLISHERS[tokens.last.upcase]
      return text unless publisher

      ([publisher] + tokens[0..-2]).join(" ")
    end

    def titleize(text)
      text.split(/\s+/).each_with_index.map do |word, index|
        core = word.gsub(%r{[^A-Za-z0-9/&'.+-]}, "")

        if PRESERVE.include?(core.upcase)
          core.upcase
        elsif word.match?(/\A\d/)
          word
        elsif index.positive? && SMALL_WORDS.include?(word.downcase)
          word.downcase
        else
          capitalize_word(word)
        end
      end.join(" ")
    end

    def capitalize_word(word)
      word.split("/").map do |part|
        part.split("-").map { |piece| piece.empty? ? piece : piece[0].upcase + piece[1..].to_s.downcase }.join("-")
      end.join("/")
    end
  end
end
