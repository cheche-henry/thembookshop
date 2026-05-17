# ============================================================
# db/seeds.rb — Them Bookshop
# Generated from THEM_FEB_2026.xls — 633 products
# Run: rails db:seed
# Reset: rails db:seed:replant
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

# ── Helper: parse grade prefix ─────────────────────────────────────────────────
# Products prefixed "7-MENTOR MATH" mean Grade 7 (Junior Secondary)
# "6-SPOTLIGHT ENGLISH" means Grade 6, etc.
def parse_grade(prefix)
  case prefix.to_s
  when "1"  then "Grade 1"
  when "2"  then "Grade 2"
  when "3"  then "Grade 3"
  when "4"  then "Grade 4"
  when "5"  then "Grade 5"
  when "6"  then "Grade 6"
  when "7"  then "Grade 7"
  when "8"  then "Grade 8"
  when "9"  then "Grade 9"
  when "10" then "Grade 10"
  when "PP1" then "PP1"
  when "PP2" then "PP2"
  else nil
  end
end

def guess_subject(title)
  t = title.upcase
  return "Mathematics"    if t.match?(/MATH|MATHS|MATHEMATICS|HESABU|PMATH|LETS DO MATH|SMART MIND|FOUNDATION MATH|CHOICE MATH|ACTIVE MATH|MASTER MATH|SMART MATH|SMARTWAY|BOOKLIST MASTER CORE/)
  return "English"        if t.match?(/ENGLISH|SKILLS IN ENG|HEADSTART ENG|TOP SCHOLAR ENG|SPOTLIGHT ENG|MENTOR ENG|EARLY GRADE ENG|PROGRESSIVE ENG|PROG ENG|VISIONARY ENG|BETTER ENG|SUPER MINDS ENG|READ WITH US|SOUND AND READ|SOUND & READ|MASTERING SOUND/)
  return "Kiswahili"      if t.match?(/KISWAHILI|FASAHA|STADI ZA|KUSOMA|KUANDIKA|MWANGAZA|CHECHE|DADISI|FANI YA|KAULI YA|KIELEKEI|FANI ZA|KAMUSI|CHANZO|KURUNZI|JIFUNZE KIS/)
  return "Science"        if t.match?(/SCIENCE|INTEGRATED SCI|ACTIVE INTEGRATED|SPARK INTEGRATED|SPOTLIGHT INTEGRATED|SUPER MINDS SCI|MASTER SCIENCE/)
  return "Agriculture"    if t.match?(/AGRICULTURE|AGRI|MTP AGRI|SPARK AGRI|SPOTLIGHT AGRI|MORAN AGRI|MENTOR AGRI|GET IT RIGHT AGRI|KCSE MADE FAMILIAR AGRI|QUENNEX AGRI/)
  return "Social Studies" if t.match?(/SOCIAL STUDIES|SOCIAL SCIENCE|SS GUIDE|EVOLVING WORLD SS|EVOLVING WORLD HISTORY|MORAN SS|ESSENTIAL COMMUNITY|OUR LIVES|OUR WORLD ENV|SUPERMINDS SS|LONGHORN SS|VISIONARY SS|MENTOR SS|SUPER MINDS SS|SPOTLIGHT SS|TOP SCHOLAR SS/)
  return "CRE"            if t.match?(/CRE|GROWING IN CHRIST|GROW IN CHRIST|KNOWING GOD|KUINIRA NGAI|VISIONARY CRE|MENTOR CRE|SPOTLIGHT CRE|TOP SCHOLAR CRE|ROHO|KIROHO|GOLDEN BELLS|BIBLE|GOOD NEWS|NKJIV|RSV|THARA|KUGUNA|IBUKU/)
  return "Pre-Technical"  if t.match?(/PRE.TECHNICAL|PRETECHNICAL|TECHNICAL EDU|OXFORD PRETEC|TOP SCOLAR PRE/)
  return "Creative Arts"  if t.match?(/CREATIVE ARTS|MENTOR CREATIVE|MORAN CREATIVE|LHORN CREATIVE|SUPERMINDS CRE/)
  return "Biology"        if t.match?(/BIO(?!LOGY)|BIOLOGY|MASTERPIECE BIO|MIRROR BIO|SPOTLIGHT BIO|A PLUS BIO|MASTERING BIO/)
  return "Chemistry"      if t.match?(/CHEM(?!ISTRY)|CHEMISTRY|TOP NOTCH CHEM|TARGETER CHEM|F3 MASTER PIECE CHEM|MASTERING CHEM/)
  return "Physics"        if t.match?(/PHYSICS|MIRROR PHYSICS|KCSE MADE FAMILIAR PHYSICS|HIGH FLYER PHYSICS/)
  return "Geography"      if t.match?(/GEO(?!GRAPHY)|GEOGRAPHY|MIRROR GEO|F3 COMPRE GEO|KMF GEO|360.*ATLAS|ATLAS|MAP OF KENYA|ACTIVE LEARNER ATLAS|MORAN.*ATLAS|OUR WORLD ATLAS/)
  return "History"        if t.match?(/HISTORY|MIRROR HISTORY|KMF HISTORY|EVOLVING WORLD HISTORY/)
  return "Business"       if t.match?(/BUSINESS|BOOKLIST MASTER B/)
  return "Fasihi"         if t.match?(/FASIHI SIMULIZI|FANI YA FASIHI/)
  nil
end

def guess_category(title, prefix)
  return "Textbooks" if prefix

  t = title.upcase
  # Reference / revision books
  return "Revision Books" if t.match?(/KCSE MADE FAMILIAR|KMF |HIGH FLYER PHYSICS|HOW TO PASS|MASTERING CHEM|MASTERING BIO|TOP NOTCH|MIRROR |MASTERPIECE|A PLUS BIO|F3 |F4 |TARGETER CHEM|KNEC TABLES|SPOTLIGHT BIO|BETTER COMPOSITION|SOLVING PROBLEMS|GET IT RIGHT|BETTER ENGLISH|PIONEER REVISION|TARGETER TRACKER$|SMARTWAY BOOSTER$|HIGH FLYER$/)
  return "Revision Books" if t.match?(/GUIDE /)
  return "Revision Books" if title.start_with?("GUIDE")

  # Storybooks / fiction
  return "Storybooks" if t.match?(/MASKINI|MASHETANI|MEMORIES WE LOST|MSTAHIKI|WHALERIDER|PARLIAMENT|MAPAMBAZUKO|GOVERNMENT INSPECTOR|KOSA LA BWANA|FATHER OF NATION|NGUU ZA JADI|BEMBEA|MASHIMO|SAMARITAN|THE PEARL|KIGOGO|CHOZI|INHERITANCE|KEY WORDS|DIARY OF A WIMPY|AMBASSANDORS|KABURI|KIJANA ALIYEUZA|KALULU|RAIN MAKER|TOUGH CHOICES|UTEUZI|TOBYS DIARY|PRINCE AT THE MALL|MWANA MBUZI|NYAMA IFICHWE|KIKI GOES|ALONE IN THE STORM|FAYO IS LOST|KIDDLE LIBRARY|KASUKU NA SOFIA|KAJUJU|MJI WA|HIDAYA|TEARS OF JOY|BRIDGES WITHOUT RIVERS|LAST LAUGH|MSHALE WA|WEMA HAUOZI|HIDDEN PACKAGE|SWEET POTATO|VANISHING POTATOES|STRANGERS IN THE TOILET|JIMMY THE JEEP|NDOTO YA AMERICA|BEAUTIFUL NYAKIO|FAYO GOES|HODI HODI|STRANGE HAPPENINGS|MELODIES FROM AFRICA|BEKAS|JKF READERS|DAUGHTERS OF NATURE|SUN AND THE WIND|JANE AND PETER|MAISHA MAPYA|BENDI YA MUZIKI|LOST PHONE|BURDEN OF GUILT|GLASS HOUSE|MLEMAVU|A LOG IN THE EYE|WE COME IN PEACE|SILENT SONG|NPPE GR|SOUND AND READ|SOUND & READ|MASTERING SOUNDS|GOOD NEWS|A SILENT SONG/)

  # Dictionaries / reference
  return "Storybooks" if t.match?(/DICTIONARY|KAMUSI|KAMUSI YA|FANI YA FASIHI|FANI ZA KISWAHILI|BETTER ENGLISH|BETTER COMPOSITION|KEY WORDS/)

  # Bibles / religious
  return "Storybooks" if t.match?(/BIBLE|KIROHO|ROHO MUTHERU|KUINIRA NGAI|NYIMBO|GOLDEN BELLS|KUGUNA|IBUKU RIA|THARA|KIKUYU BIBLE|KISII BIBLE|KISWAHILI BIBLE|NIV|NKJIV|RSV|GOOD NEWS/)

  "Stationery"
end

# ── Product data ─────────────────────────────────────────────────────────────
# Format: [raw_name_from_xls, sale_price, stock, badge]
# Prices marked * were in the XLS (purchase price * 1.25 markup)
# Others use standard Kenyan market rates for these items

products_data = [

  # ════════════════════════════════════════════════════════════════════════
  # CBC GRADE 1 TEXTBOOKS
  # ════════════════════════════════════════════════════════════════════════
  ["1-PROGRESSIVE ENGLISH",           330, 50, nil],
  ["1-EARLY GRADE ENGLISH",           310, 50, nil],
  ["1-SKILLS IN ENGLISH",             320, 50, nil],
  ["1-HIGH FLYER",                    320, 45, nil],
  ["1-MENTOR ENGLISH",                330, 50, nil],
  ["1-SPOTLIGHT ENGLISH",             330, 50, nil],
  ["1-MENTOR KISWAHILI",              320, 50, nil],
  ["1-KISWAHILI DADISI",              310, 50, nil],
  ["1-STADI ZA KISWAHILI",            310, 50, nil],
  ["1-VISIONARY MAZOEZI YA KISWAHILI",310, 45, nil],
  ["1-KUSOMA NA KUANDIKA",            290, 50, nil],
  ["1-SOMA NASI",                     290, 40, nil],
  ["1-KURUNZI",                       300, 50, nil],
  ["1-LETS DO MATHS",                 330, 50, nil],
  ["1-SPOTLIGHT MATH",                330, 50, nil],
  ["1-SPOTLIGHT CRE",                 300, 45, nil],
  ["1-VISIONARY CRE",                 300, 45, nil],
  ["1-OUR LIVES TODAY",               310, 50, nil],
  ["1-READ WITH US",                  290, 40, nil],
  ["1-MENTOR CREATIVE ARTS",          310, 45, nil],
  ["1-TARGETER TRACKER",              350, 40, nil],
  ["1-WIRUTE GUTHOMA GIKUYU KIEGE",   290, 30, nil],

  # ════════════════════════════════════════════════════════════════════════
  # CBC GRADE 2 TEXTBOOKS
  # ════════════════════════════════════════════════════════════════════════
  ["2-L/HORN ENGLISH",                340, 50, nil],
  ["2-EARLY GRADE ENGLISH",           320, 50, nil],
  ["2-VISIONARY ENGLISH",             330, 50, nil],
  ["2-SPOTLIGHT ENGLISH",             330, 50, nil],
  ["2-VISIONARY MAZOEI YA KISWAHILI", 320, 45, nil],
  ["2-KUSOMA KISWAHILI",              310, 45, nil],
  ["2-KISWAHILI DADISI",              320, 50, nil],
  ["2-STANDI ZA KISWAHILI",           310, 50, nil],
  ["2-KURUNZI",                       310, 50, nil],
  ["2-LETS DO MATHS",                 340, 50, nil],
  ["2-SPOTLIGHT MATH",                340, 50, nil],
  ["2-VISIONARY MATHEMATICS",         340, 50, nil],
  ["2-SPOTLIGHT CRE",                 310, 45, nil],
  ["2-VISIONARY CRE",                 310, 45, nil],
  ["2-OUR LIVES TODAY",               320, 50, nil],
  ["2-HIGH FLYER",                    330, 45, nil],
  ["2-TARGETER ENCYCLOPEDIA",         360, 40, nil],
  ["2-MENTOR CREATIVE ARTS",          320, 45, nil],

  # ════════════════════════════════════════════════════════════════════════
  # CBC GRADE 3 TEXTBOOKS
  # ════════════════════════════════════════════════════════════════════════
  ["3-PROG ENG",                      340, 50, nil],
  ["3-SKILLS IN ENGLISH",             340, 50, nil],
  ["3-EARLY GRADE ENGLISH",           330, 50, nil],
  ["3-MENTOR ENGLISH",                345, 50, nil],
  ["3-SPOTLIGHT ENGLISH",             345, 50, nil],
  ["3-VISIONARY KISWAHILI",           330, 50, nil],
  ["3-KISWAHILI DADISI",              330, 50, nil],
  ["3-STADI ZA KISWAHILI",            330, 50, nil],
  ["3-CHECHE KISWAHILI",              320, 45, nil],
  ["3-L/HORN KUSOMA NA KUANDIKA",     310, 45, nil],
  ["3-KURUNZI",                       320, 50, nil],
  ["3-LETS DO MATH",                  350, 50, nil],
  ["3-SPOTLIGHT MATH",                350, 50, nil],
  ["3-PMATH",                         340, 45, nil],
  ["3-VISIONARY MATHEMATICS",         350, 50, nil],
  ["3-SPOTLIGHT CRE",                 320, 45, nil],
  ["3-VISIONARY CRE",                 320, 45, nil],
  ["3-GROWING IN CHRIST",             320, 45, nil],
  ["3-OUR WORLD ENVIRONMENT",         330, 50, nil],
  ["3-OURLIVES TODAY",                330, 50, nil],
  ["3-HIGH FLYER",                    340, 45, nil],
  ["3-TARGETER ENCYCLOPEDIA",         370, 40, nil],
  ["3-QUENEX PREMIER ENCYCLOPEDIA",   370, 35, nil],
  ["3-MENTOR CREATIVE ARTS",          330, 45, nil],
  ["3-READ WITH US",                  310, 40, nil],

  # ════════════════════════════════════════════════════════════════════════
  # CBC GRADE 4 TEXTBOOKS
  # ════════════════════════════════════════════════════════════════════════
  ["4-MENTOR ENGLISH",                355, 60, nil],
  ["4-L/HORN ENGLISH",                355, 55, nil],
  ["4-SPOTLIGHT ENGLISH",             355, 60, nil],
  ["4-PROG ENG",                      345, 55, nil],
  ["4-ENGLISH AID",                   340, 50, nil],
  ["4-KISWAHILI DADISI",              340, 55, nil],
  ["4-STADI ZA KISWAHILI",            340, 55, nil],
  ["4-KURUNZI",                       330, 55, nil],
  ["4-MENTOR MATHS",                  360, 60, "Best Seller"],
  ["4-LETS DO MATH",                  355, 60, nil],
  ["4-VISIONARY MATHEMATICS",         360, 60, nil],
  ["4-MENTOR SCIENCE AND TECH",       370, 55, nil],
  ["4-VISIONARY SCIENCE AND TECHNOLOGY",370,55, nil],
  ["4-EVERDAY SCIENCE AND TECH",      365, 55, nil],
  ["4-MENTOR SOCIAL STUDIES",         345, 55, nil],
  ["4-VISIONARY SOCIAL SCIENCE",      345, 55, nil],
  ["4-OUR LIVES",                     340, 55, nil],
  ["4-MENTOR CRE",                    330, 50, nil],
  ["4-GROWING IN CHRIST",             330, 50, nil],
  ["4-KNOWING GOD",                   325, 45, nil],
  ["4-SUPERMINDS CRE",                330, 50, nil],
  ["4-MENTOR AGRICULTURE",            345, 50, nil],
  ["4-MTP AGRICULTURE",               340, 50, nil],
  ["4-QUENNEX AGRICULTURE",           340, 45, nil],
  ["4-MENTOR CREATIVE ARTS",          335, 50, nil],
  ["4-LHORN CREATIVE ARTS",           335, 50, nil],
  ["4-HIGH FLYER",                    350, 50, nil],
  ["4-TARGETER ENCYCLOPEDIA",         380, 40, nil],

  # ════════════════════════════════════════════════════════════════════════
  # CBC GRADE 5 TEXTBOOKS
  # ════════════════════════════════════════════════════════════════════════
  ["5-MENTOR ENGLISH",                360, 55, nil],
  ["5-SKILLS IN ENGLISH",             355, 55, nil],
  ["5-SUPER MINDS ENGLISH",           360, 55, nil],
  ["5-VISIONARY KISWAHILI",           345, 55, nil],
  ["5-KISWAHILI DADISI",              345, 55, nil],
  ["5-STADI ZA KISWAHILI",            345, 55, nil],
  ["5-KURUNZI",                       335, 55, nil],
  ["5-MENTOR MATH",                   365, 60, "Best Seller"],
  ["5-MENTOR MATH - GUIDE",           280, 40, nil],
  ["5-LETS DO MATH",                  360, 60, nil],
  ["5-VISIONARY MATHEMATICS",         365, 60, nil],
  ["5-SUPER MINDS SCIENCE",           375, 55, nil],
  ["5-MASTER SCIENCE AND TECHNOLOGY", 375, 55, nil],
  ["5-EVERDAY SCIENCE AND TECHNOLOGY565",365,50, nil],
  ["5-SUPER MINDS SOCIAL STUDIES",    350, 55, nil],
  ["5-SPOTLIGHT SOCIAL STUDIES",      350, 55, nil],
  ["5-MENTOR SOCIAL STUDIES",         350, 55, nil],
  ["5-MENTOR CRE",                    335, 50, nil],
  ["5-L/HORN CRE",                    330, 50, nil],
  ["5-GROW IN CHRIST",                330, 50, nil],
  ["5-KNOWING GOD",                   330, 45, nil],
  ["5-MENTOR AGRICULTURE",            350, 50, nil],
  ["5-MTP AGRICULTURE",               345, 50, nil],
  ["5-SUPER MINDS AGRICULTURE",       350, 50, nil],
  ["5-HIGH FLYER",                    355, 50, nil],
  ["5-TARGETER ENCYCLOPEDIA",         385, 40, nil],

  # ════════════════════════════════════════════════════════════════════════
  # CBC GRADE 6 TEXTBOOKS
  # ════════════════════════════════════════════════════════════════════════
  ["6-MENTOR MATH",                   370, 55, "Best Seller"],
  ["6-SPOTLIGHT MATH",                370, 55, nil],
  ["6-L/HORN ENGLISH",                360, 55, nil],
  ["6-SPOTLIGHT ENGLISH",             360, 55, nil],
  ["6-MENTOR ENGLISH",                360, 55, nil],
  ["6-KISWAHILI SAHIHI",              350, 55, nil],
  ["6-STADI ZA KISWAHILI",            350, 55, nil],
  ["6-KURUNZI",                       340, 55, nil],
  ["6-SPOTLIGHT SCIENCE",             375, 55, nil],
  ["6-visionary science and technology",370,50, nil],
  ["6-SPOTLIGHT SOCIAL STUDIES",      355, 55, nil],
  ["6-VISIONARY SOCIAL STUDIES",      355, 55, nil],
  ["6-OUR LIVES TODAY",               345, 55, nil],
  ["6-SPOTLIGHT CRE",                 340, 50, nil],
  ["6-L/HORN CRE",                    335, 50, nil],
  ["6-GROW IN CHRIST",                335, 50, nil],
  ["6-SPOTLIGHT AGRICULTURE",         355, 50, nil],
  ["6-MTP AGRICLUTURE",               350, 50, nil],
  ["6-MENTOR AGRICULTURE",            355, 50, nil],
  ["6-MENTOR CRE",                    335, 50, nil],
  ["6-HIGH FLYER",                    360, 50, nil],
  ["6-TARGETER ENCYCLOPEDIA",         390, 40, nil],
  ["6-SMARTWAY BOOSTER",              380, 35, "Exam Prep"],

  # ════════════════════════════════════════════════════════════════════════
  # CBC GRADE 7 TEXTBOOKS (Junior Secondary)
  # ════════════════════════════════════════════════════════════════════════
  ["7-MENTOR ENGLISH",                390, 50, nil],
  ["7-SKILLS IN ENGLISH",             385, 50, nil],
  ["7-SPOTLIGHT ENGLISH",             390, 50, nil],
  ["7-TOP SCHOLAR ENGLISH",           385, 50, nil],
  ["7-HEAD START ENGLISH",            380, 50, nil],
  ["7-MENTOR KISWAHILI",              380, 50, nil],
  ["7-STADI ZA KISWAHILI",            375, 50, nil],
  ["7-MWANGAZA WA KISWAHILI",         375, 45, nil],
  ["7-TOP SCHOLAR KISWAHILI",         375, 45, nil],
  ["7-MENTOR MATHS",                  400, 55, "Best Seller"],
  ["7-MENTOR MATHS - GUIDE",          290, 35, nil],
  ["7-FOUNDATION MATHS",              395, 55, nil],
  ["7-SPOTLIGHT MATHS",               400, 55, nil],
  ["7-SMARTMINDS MATH",               395, 50, nil],
  ["7-ACTIVE MATHEMATICS",            395, 50, nil],
  ["7-ACTIVE INTEGRATED SCIENCES",    410, 55, nil],
  ["7-AXTIVE INTEGRATED SCIENCES",    410, 45, nil],
  ["7-SPOTLIGHT SCIENCE",             410, 55, nil],
  ["7-MORAN SOCIAL STUDIES",          390, 50, nil],
  ["7-TOP SCHOLAR SOCIAL STUDIES",    385, 50, nil],
  ["7-MENTOR SOCIAL STUDIES",         390, 50, nil],
  ["7-MENTOR CRE",                    375, 45, nil],
  ["7-TOP SCHOLAR CRE",               370, 45, nil],
  ["7-SPOTLIGHT AGRICULTURE",         390, 50, nil],
  ["7-TOP SCHOLAR TECHNICAL EDU",     390, 50, nil],
  ["7-PRETECHNICAL TODAY",            385, 50, nil],
  ["7-SPOTLIGHT PRETECHNICAL",        390, 50, nil],
  ["7-HIGH FLYER VOL1",               370, 45, nil],
  ["7-HIGH FLYER VOL2",               370, 45, nil],
  ["7-HIGH FLYER VOL 2",              370, 40, nil],
  ["7-TARGETER TRACKER",              400, 40, "Exam Prep"],

  # ════════════════════════════════════════════════════════════════════════
  # CBC GRADE 8 TEXTBOOKS (Junior Secondary)
  # ════════════════════════════════════════════════════════════════════════
  ["8-MENTOR ENGLISH",                395, 45, nil],
  ["8-SPOTLIGHT ENGLISH",             395, 45, nil],
  ["8-KISWAHILI FASAHA",              380, 45, nil],
  ["8-STADI ZA KISWAHILI",            380, 45, nil],
  ["8-KIELEKEZI CHA KISWAHILI",       380, 45, nil],
  ["8-MENTOR MATH",                   410, 50, "Best Seller"],
  ["8-ACTIVE MATH",                   405, 50, nil],
  ["8-SMART MINDS MATH",              405, 50, nil],
  ["8-MASTER MATHEMATICS",            405, 50, nil],
  ["8-MENTOR INTEGRATED SCIENCE",     420, 50, nil],
  ["8-ACTIVE INTEGRATED SCIENCES",    420, 50, nil],
  ["8-SPOTLIGHT INTEGRATED SCIENCE",  420, 50, nil],
  ["8-LONGHORN SOCIAL STUDIES",       390, 45, nil],
  ["8-EVOLVING WORLD SS",             390, 45, nil],
  ["8-SUPERMINDS SS GUIDE",           385, 40, nil],
  ["8-MENTOR CRE",                    380, 40, nil],
  ["8-TOP SCHOLAR CRE",               375, 40, nil],
  ["8-MENTOR AGRICULTURE",            395, 45, nil],
  ["8-MORAN AGRICULTURE",             390, 45, nil],
  ["8-SPOTLIGHT PRE-TECHNICAL",       395, 45, nil],
  ["8-MENTOR PRE TECHINICAL",         390, 45, nil],
  ["8-TOPSCHOLAR PRETECHNICAL",       390, 45, nil],
  ["8-TARGETER TRACKER VOL 1 & 2",    420, 35, "Exam Prep"],
  ["8-TARGETER TRACKER VOL 2",        370, 35, nil],

  # ════════════════════════════════════════════════════════════════════════
  # CBC GRADE 9 TEXTBOOKS (Junior Secondary)
  # ════════════════════════════════════════════════════════════════════════
  ["9-HEADSTART ENGLISH",             400, 40, nil],
  ["9-KISWAHILI FASAHA",              385, 40, nil],
  ["9-STADI ZA KISWAHILI",            385, 40, nil],
  ["9-KURUNZI",                       385, 40, nil],
  ["9-CHOICE MATHEMATICS",            415, 45, nil],
  ["9-MENTOR MATHS",                  415, 45, "Best Seller"],
  ["9-ACTIVE INTEGRATED SCIENCES",    425, 45, nil],
  ["9-SPARK INTEGRATED SCIENCES",     425, 45, nil],
  ["9-EVOLVING WORLD SS",             395, 40, nil],
  ["9-OURWORLD ENVIRONMENT",          395, 40, nil],
  ["9-MENTOR CRE",                    385, 35, nil],
  ["9-TOP SCHOLAR CRE",               380, 35, nil],
  ["9-AGRICULTURE TODAY",             400, 40, nil],
  ["9-SPARK AGRICULTURE",             400, 40, nil],
  ["9-SPOTLIGHT AGRICULTURE",         400, 40, nil],
  ["9-PRETECHNICAL OXFORD",           400, 40, nil],
  ["9-TOP SCOLAR PRETECHNICAL",       395, 40, nil],
  ["9-MENTOR CREATIVE ARTS",          390, 35, nil],
  ["9-MORAN CREATIVE ARTS",           390, 35, nil],
  ["9-HIGH FLYER",                    395, 35, nil],
  ["9-SMARTWAY BOOSTER",              400, 30, "Exam Prep"],
  ["9-PIONEER REVISION",              400, 30, "Exam Prep"],
  ["9-TARGETER TRACKER",              410, 30, "Exam Prep"],

  # ════════════════════════════════════════════════════════════════════════
  # CBC GRADE 10 TEXTBOOKS
  # ════════════════════════════════════════════════════════════════════════
  ["10-EVOLVING WORLD HISTORY",       420, 30, nil],
  ["10-FANI YA KISWAHILI SIMULIZI",   400, 30, nil],
  ["10-ESSENTIAL COMMUNITY CSL",      410, 30, nil],
  ["10-BOOKLIST MASTER B/STUDIES",    415, 25, nil],
  ["10-BOOKLIST MASTER CORE MATHS",   420, 30, nil],
  ["10-KAULI YA MWISHO",              400, 25, nil],
  ["10-KIELEKEI CHA KISWAHILI",       400, 30, nil],
  ["10-FANI YA FASIHI SIMULIZI",      400, 25, nil],

  # ════════════════════════════════════════════════════════════════════════
  # PRE-PRIMARY BOOKS (PP1 & PP2)
  # ════════════════════════════════════════════════════════════════════════
  ["PP1-FIRST STEP MATHEMATICS",      280, 40, nil],
  ["PP1-FIRST STEP ENVIRONMENT",      270, 40, nil],
  ["PP1-FIRST STEP LANGUAGE",         270, 40, nil],
  ["PP1 JIFUNZE KISWAHILI BK 1",      260, 35, nil],
  ["MASTERING SOUNDS AND READING",    270, 35, nil],
  ["CHANZO CHA KISWAHILI",            260, 35, nil],
  ["SOUND AND READ BK2",              270, 35, nil],
  ["SOUND & READ BK 1",               270, 35, nil],
  ["PP2-FIRST STEP MATHEMATICS",      280, 40, nil],
  ["PP2-FIRST STEP ENVIRONMENT",      270, 40, nil],
  ["PP2-FIRST STEP LANGUAGE",         270, 40, nil],
  ["MASTERING SOUND AND READING BK2", 270, 35, nil],
  ["JIFUNZE KIS BK2",                 260, 35, nil],
  ["NPPE GR 2",                       280, 35, nil],
  ["NPPE GR 3",                       290, 35, nil],

  # ════════════════════════════════════════════════════════════════════════
  # SECONDARY / KCSE TEXTBOOKS & REVISION BOOKS
  # ════════════════════════════════════════════════════════════════════════
  ["HIGH FLYER PHYSICS",              550, 30, "Exam Prep"],
  ["HOW TO PASS BUSINESS STUDIES",    480, 25, "Exam Prep"],
  ["KCSE MADE FAMILIAR AGRICULTURE",  520, 30, "Exam Prep"],
  ["KCSE MADE FAMILIAR PHYSICS",      520, 30, "Exam Prep"],
  ["KCSE MADE FAMILIAR CHEM",         520, 30, "Exam Prep"],
  ["KCSE MADE FAMILIAR MATH",         550, 35, "Exam Prep"],
  ["KCSE MADE FAMILIAR BIOLOGY",      520, 30, "Exam Prep"],
  ["KMF HISTORY",                     500, 25, "Exam Prep"],
  ["KMF GEOGRAPHY",                   500, 25, "Exam Prep"],
  ["KMF PHYSICS",                     520, 30, "Exam Prep"],
  ["TOP NOTCH CHEMISTRY F3",          480, 25, nil],
  ["TOP NOTCH CHEMISTRY",             500, 25, nil],
  ["F3 BIO KLB",                      520, 30, nil],
  ["F3 CHEM KLB",                     520, 30, nil],
  ["F3 AGRI",                         480, 25, nil],
  ["F3 GEO KLB",                      500, 30, nil],
  ["F3 GEO MAC",                      490, 25, nil],
  ["F3 COMPRE GEO",                   480, 25, nil],
  ["F3 MASTER PIECE CHEMISTRY",       490, 25, nil],
  ["F4 BIO KLB",                      530, 30, nil],
  ["F4 GEO KLB",                      510, 25, nil],
  ["MASTERPIECE BIO",                 490, 25, nil],
  ["SPOTLIGHT BIOLOGY F3 & 4",        520, 25, nil],
  ["MIRROR BIOLOGY",                  490, 25, nil],
  ["MIRROR PHYSICS",                  490, 25, nil],
  ["MIRROR HISTORY",                  470, 25, nil],
  ["MIRROR CRE",                      460, 20, nil],
  ["MIRROR KISWAHILI",                460, 25, nil],
  ["TARGETER CHEMISTRY F3&4",         500, 25, nil],
  ["A PLUS BIO",                      490, 25, nil],
  ["BETTER COMPOSITION",              350, 30, nil],
  ["BETTER ENGLISH P1",               360, 30, nil],
  ["BETTER ENGLISH P2",               360, 30, nil],
  ["MASTERING CHEMISTRY PRACTICALS",  420, 25, nil],
  ["MASTERING BIO PRACTICAL MANUAL",  420, 25, nil],
  ["GET IT RIGHT AGRICULTURE",        450, 25, nil],
  ["SOLVING PROBLEMS",                380, 25, nil],
  ["KNEC TABLES",                     150, 40, nil],
  ["L/HORN JUNIOR SEC MATH TABLES",   120, 40, nil],
  ["FANI ZA KISWAHILI BK1",           380, 25, nil],
  ["FANI YA FASIHI SIMULIZI",         390, 25, nil],
  ["KAMUSI SANIFU",                   350, 30, nil],
  ["KAMUSI YA KARNE 21",              380, 25, nil],

  # ════════════════════════════════════════════════════════════════════════
  # ATLASES & MAPS
  # ════════════════════════════════════════════════════════════════════════
  ["OUR WORLD ATLAS PRIMARY",         480, 25, nil],
  ["OUR WORLD ATLAS JSS",             520, 20, nil],
  ["360 SEC ATLAS",                   580, 20, nil],
  ["36O SEC ATLAS",                   580, 15, nil],
  ["360 JUNIOR SEC ATLAS",            550, 20, nil],
  ["ACTIVE LEARNER ATLAS",            500, 20, nil],
  ["MORAN JUNIOR SECONDARY ATLAS",    530, 20, nil],
  ["MAP OF KENYA",                    250, 30, nil],

  # ════════════════════════════════════════════════════════════════════════
  # DICTIONARIES
  # ════════════════════════════════════════════════════════════════════════
  ["OXFORD STUDENT DICTIONARY",       650, 20, nil],
  ["OXF PRIMARY DICTIONARY",          480, 25, nil],
  ["OXF ADVANCED DICTIONARY",         750, 15, nil],
  ["KEY WORDS",                       280, 30, nil],

  # ════════════════════════════════════════════════════════════════════════
  # BIBLES & RELIGIOUS BOOKS
  # ════════════════════════════════════════════════════════════════════════
  ["KISWAHILI BIBLE",                 550, 20, nil],
  ["KIKUYU BIBLE",                    600, 15, nil],
  ["ZIPPED KIKUYU BIBLE",             750, 10, nil],
  ["KISII BIBLE",                     600, 10, nil],
  ["NIV BIBLE",                       650, 15, nil],
  ["GOOD NEWS",                       500, 15, nil],
  ["NKJIV",                           700, 10, nil],
  ["RSV",                             650, 10, nil],
  ["KIROHO",                          400, 15, nil],
  ["KIROHO ZIPPED",                   550, 10, nil],
  ["ROHO MUTHERU",                    450, 10, nil],
  ["ROHO MUTHERU ZIPPED",             600, 8,  nil],
  ["KUINIRA NGAI",                    350, 15, nil],
  ["KUINIRA NGAI ZIPPED",             500, 10, nil],
  ["NYIMBO CIA KUINIRA NGAI ORDINARY",300, 15, nil],
  ["THARA",                           350, 10, nil],
  ["GOLDEN BELLS",                    380, 10, nil],
  ["KUGUNA MAROHO",                   350, 10, nil],
  ["IBUKU RIA MAHOYA",                320, 10, nil],

  # ════════════════════════════════════════════════════════════════════════
  # KCSE SET BOOKS (NOVELS & PLAYS)
  # ════════════════════════════════════════════════════════════════════════
  ["MEMORIES WE LOST",                380, 35, "Set Book"],
  ["MASKINI MILIONEA",                320, 30, "Set Book"],
  ["MASHETANI WAMERUDI",              310, 30, "Set Book"],
  ["MSTAHIKI MEYA",                   310, 30, "Set Book"],
  ["WHALERIDER",                      350, 25, "Set Book"],
  ["A SILIENT SONG",                  310, 25, "Set Book"],
  ["PARLIAMENT OF OWLS",              320, 25, "Set Book"],
  ["MAPAMBAZUKO YA MACHWEO",          310, 30, "Set Book"],
  ["GOVERNMENT INSPECTOR",            350, 25, "Set Book"],
  ["KOSA LA BWANA MSA",               310, 30, "Set Book"],
  ["THE FATHER OF NATION",            320, 30, "Set Book"],
  ["NGUU ZA JADI",                    310, 25, "Set Book"],
  ["BEMBEA YA MAISHA",                310, 25, "Set Book"],
  ["MASHIMO YA MFALME SULEIMANI",     300, 25, "Set Book"],
  ["THE SAMARITAN",                   310, 25, "Set Book"],
  ["THE PEARL",                       310, 25, "Set Book"],
  ["KIGOGO",                          310, 25, "Set Book"],
  ["CHOZI LA HERI",                   310, 25, "Set Book"],
  ["INHERITANCE",                     340, 25, "Set Book"],
  ["DIARY OF A WIMPY KID",            380, 20, nil],
  ["THE AMBASSANDORS",                310, 20, nil],
  ["KABURI BILA MSALABA",             310, 25, "Set Book"],
  ["KIJANA ALIYEUZA HEKIMA",          300, 25, nil],
  ["KALULU AND THE ANIMALS",          280, 30, nil],
  ["THE RAIN MAKER",                  290, 25, nil],
  ["TOUGH CHOICES",                   290, 25, nil],
  ["UTEUZI WA CHALE",                 290, 25, nil],
  ["TOBYS DIARY",                     280, 25, nil],
  ["THE PRINCE AT THE MALL",          280, 25, nil],

  # ════════════════════════════════════════════════════════════════════════
  # GUIDED READERS / JUNIOR STORYBOOKS
  # ════════════════════════════════════════════════════════════════════════
  ["MWANA MBUZI MEE",                 180, 30, nil],
  ["NYAMA IFICHWE WAPI",              180, 30, nil],
  ["KIKI GOES SHOPPING",              180, 30, nil],
  ["ALONE IN THE STORM",              180, 30, nil],
  ["FAYO IS LOST",                    180, 30, nil],
  ["KASUKU NA SOFIA",                 180, 30, nil],
  ["KAJUJU AND THE BIG CATERPILLAR",  190, 30, nil],
  ["MJI WA MATARAJIO",                180, 30, nil],
  ["HIDAYA",                          200, 25, nil],
  ["TEARS OF JOY",                    200, 25, nil],
  ["THE LAST LAUGH",                  200, 25, nil],
  ["MSHALE WA MATUMAINI",             200, 25, nil],
  ["WEMA HAUOZI",                     200, 25, nil],
  ["HIDDEN PACKAGE",                  200, 25, nil],
  ["THE HIDDEN PACKAGE",              200, 20, nil],
  ["THE SWEET POTATO GIRL",           180, 30, nil],
  ["THE VANISHING POTATOES",          180, 30, nil],
  ["STRANGERS IN THE TOILET",         180, 30, nil],
  ["JIMMY THE JEEP",                  180, 30, nil],
  ["NDOTO YA AMERICA",                200, 25, nil],
  ["BEAUTIFUL NYAKIO",                200, 25, nil],
  ["FAYO GOES TO SCHOOL",             180, 30, nil],
  ["HODI HODI",                       180, 30, nil],
  ["STRANGE HAPPENINGS",              200, 25, nil],
  ["MELODIES FROM AFRICA",            200, 25, nil],
  ["BEKAS MISFORTUNE",                200, 25, nil],
  ["JKF READERS",                     220, 30, nil],
  ["DAUGHTERS OF NATURE",             200, 25, nil],
  ["SUN AND THE WIND",                180, 30, nil],
  ["JANE AND PETER",                  180, 30, nil],
  ["MAISHA MAPYA",                    200, 25, nil],
  ["BENDI YA MUZIKI",                 200, 25, nil],
  ["THE LOST PHONE",                  200, 25, nil],
  ["BURDEN OF GUILT",                 210, 25, nil],
  ["GLASS HOUSE",                     210, 25, nil],
  ["MLEMAVU SIO MIMI",                200, 25, nil],
  ["A LOG IN THE EYE",                200, 25, nil],
  ["WE COME IN PEACE",                200, 25, nil],
  ["BRIDGES WITHOUT RIVERS",          210, 25, nil],
  ["KIDDLE LIBRARY",                  250, 20, nil],

  # Study Guides for Set Books
  ["GUIDE - MSHALE",                  180, 20, nil],
  ["GUIDE - WEMA",                    180, 20, nil],
  ["GUIDE - FATHER OF NATION",        180, 20, nil],
  ["GUIDE LAST LAUGH",                180, 20, nil],
  ["GUIDE STRANGE HAPPENINGS",        180, 20, nil],
  ["GUIDE BRIDGES",                   180, 20, nil],

  # ════════════════════════════════════════════════════════════════════════
  # EXERCISE BOOKS
  # ════════════════════════════════════════════════════════════════════════
  ["48PGS SUPERIOR",                  25,  150, nil],
  ["64 SUPERIOR",                     30,  150, nil],
  ["80PGS SUPERIOR",                  35,  200, "Best Seller"],
  ["120PGS SUPERIOR",                 50,  120, nil],
  ["200 SUPERIOR",                    70,  100, nil],
  ["64 PGS KASUKU",                   30,  100, nil],
  ["200PGS KASUKU",                   75,  80,  nil],
  ["48 PGS 1/2 INCH",                 30,  100, nil],
  ["96 PGS 1/2 INCH",                 45,  80,  nil],
  ["48PGS MUSIC",                     35,  60,  nil],
  ["A5 48PGS HAND WRITTING",          30,  80,  nil],
  ["HAND WRITING 48PGS",              30,  80,  nil],
  ["80PGS A4",                        50,  100, nil],
  ["120PGS A4",                       55,  80,  nil],
  ["200A4 PGS",                       80,  60,  nil],
  ["64PGS A4",                        45,  100, nil],
  ["A4 96 PGS GRAPH BOOKS",           50,  70,  nil],
  ["GRAPH BOOKS 48PGS",               35,  80,  nil],
  ["PLAIN EX A5 48PGS",               25,  80,  nil],
  ["A4 PLAIN BOOK",                   45,  60,  nil],
  ["FLIP CHART",                      350, 20,  nil],
  ["SCRAP BOOK",                      80,  40,  nil],

  # Counter / Cash Books
  ["2QUIRE",                          175, 30,  nil],
  ["3QUIRE",                          175, 25,  nil],
  ["4QUIRE",                          205, 20,  nil],
  ["CASH BOOK 1QUIRE",                120, 30,  nil],
  ["CASH BOOK 2QUIRE",                175, 25,  nil],
  ["LEDGER 1 QUIRE",                  150, 25,  nil],
  ["LEDGER 2 QUIRE",                  220, 20,  nil],
  ["FULLSCAPS",                       60,  40,  nil],
  ["LOOSE LEAF",                      50,  50,  nil],
  ["SHORTHAND NOTE BOOK A5",          80,  25,  nil],
  ["A6 SPIRAL NBOOK",                 80,  30,  nil],
  ["A6 EXECUTIVE NOTE BOOK",          120, 20,  nil],
  ["A6 EXECUTIVE DIARY",              150, 20,  nil],
  ["A5 DIARY",                        120, 25,  nil],
  ["A5 HCOVER",                       80,  30,  nil],
  ["A6 HCOVER",                       70,  30,  nil],
  ["A7 HCOVER",                       60,  30,  nil],

  # Registers / Official Books
  ["ADMISSION REGISTER",              350, 15,  nil],
  ["STAFF REGISTER",                  280, 15,  nil],
  ["SCHOOL DIARIES",                  150, 30,  nil],
  ["VISITORS BOOK",                   180, 15,  nil],
  ["NUMBERED RECEIPTS",               45,  50,  nil],
  ["INVOICE A5",                      60,  30,  nil],
  ["LESSON PLAN CBC",                 150, 20,  nil],
  ["SCHEME OF WORK",                  120, 20,  nil],
  ["SCHEME OF WORK CBC",              120, 20,  nil],
  ["CONSUMABLE STORE LEDGER",         250, 10,  nil],
  ["DELIVER BOOK",                    120, 15,  nil],
  ["ORDER BOOK",                      100, 20,  nil],
  ["REGISTERS",                       200, 15,  nil],
  ["QUILL",                           80,  15,  nil],

  # ════════════════════════════════════════════════════════════════════════
  # PENS
  # ════════════════════════════════════════════════════════════════════════
  ["BIC",                             15,  500, "Best Seller"],
  ["FINE BIC",                        20,  300, nil],
  ["OBAMA",                           5,   500, nil],
  ["0BAMA",                           5,   300, nil],
  ["CHAMPION PEN",                    10,  400, nil],
  ["YOUTH PEN",                       10,  400, nil],
  ["PENTONIC BALLPEN",                12,  300, nil],
  ["3 IN 1 PEN",                      20,  200, nil],
  ["ROLLER PEN",                      30,  150, nil],
  ["GELX PEN",                        25,  200, nil],
  ["EXECUTIVE PEN",                   50,  80,  nil],
  ["DOLLAR PEN",                      80,  50,  nil],
  ["DOLLAR FOUTAIN PEN INK",          30,  40,  nil],
  ["MARKER PEN PERMANENT",            50,  100, nil],
  ["MARKER PEN HAIJAR",               45,  80,  nil],
  ["MARKER PEN INK",                  30,  60,  nil],
  ["WHITE BOARD MARKER",              60,  80,  nil],
  ["HIGHLIGHTER",                     40,  100, nil],
  ["CORRECTION FLUID",                45,  80,  nil],
  ["CORRECTION PEN",                  50,  80,  nil],
  ["CARBON",                          30,  40,  nil],

  # ════════════════════════════════════════════════════════════════════════
  # PENCILS
  # ════════════════════════════════════════════════════════════════════════
  ["NATARAJ PENCIL",                  10,  400, "Best Seller"],
  ["PLATINUM PENCILS",                5,   400, nil],
  ["PELICAN PENCILS",                 10,  300, nil],
  ["STAEDLER HB PENCIL",              15,  200, nil],
  ["HJ PENCILS",                      10,  300, nil],
  ["GYLENE 3B",                       10,  200, nil],
  ["GYLENE HB",                       10,  200, nil],
  ["DAMBASA PENCIL",                  8,   300, nil],
  ["OFFICE PENCILS",                  10,  200, nil],
  ["OFFICE POINT PENCIL",             10,  200, nil],
  ["HB 4,3,2,5BS",                    15,  150, nil],
  ["CLUTCH NON SHARPEN PENCIL",       80,  50,  nil],

  # ════════════════════════════════════════════════════════════════════════
  # CRAYONS & ART SUPPLIES
  # ════════════════════════════════════════════════════════════════════════
  ["CLAYONS 8 COLOURS",               50,  120, nil],
  ["12 COLORS CLAYONS",               80,  100, nil],
  ["CHEAP CLAYONS 12 COLORS",         60,  120, nil],
  ["JUMBO CLAYONS",                   100, 80,  nil],
  ["NATARAJ COLOURED PENCIL",         120, 80,  nil],
  ["WATER COLOURS 8COLOURS",          80,  60,  nil],
  ["WATER COLOURS 12COLOURS",         120, 50,  nil],
  ["WATER COLOURS 16",                150, 40,  nil],
  ["WATER COLOR TUBES CLASSY",        180, 30,  nil],
  ["WATER COLOUR PALLETS",            80,  50,  nil],
  ["PAINTING BRUSHES",                60,  50,  nil],
  ["POWDER COLORS",                   150, 30,  nil],
  ["MOLDING CLAY",                    60,  40,  nil],
  ["MOLDING CLAY BAR",                80,  40,  nil],
  ["FOIL",                            10,  100, nil],
  ["LUMINOUS PAPER",                  15,  80,  nil],
  ["EMBOSSED BOARD",                  30,  50,  nil],
  ["SUGAR PAPER",                     8,   200, nil],
  ["MANILA",                          10,  150, nil],

  # ════════════════════════════════════════════════════════════════════════
  # ERASERS & SHARPENERS
  # ════════════════════════════════════════════════════════════════════════
  ["ERASER NEO LINE",                 5,   500, nil],
  ["BR 80",                           15,  200, nil],
  ["BR 80 BLACK EXAM ERASER",         20,  200, nil],
  ["SHARPENER CHEAP",                 10,  200, nil],
  ["SHARPENER NATARAJ",               15,  200, nil],
  ["SHARPENING FILE",                 30,  50,  nil],

  # ════════════════════════════════════════════════════════════════════════
  # GEOMETRY SETS & RULERS
  # ════════════════════════════════════════════════════════════════════════
  ["NATARAJ MATH SETS",               250, 100, "Best Seller"],
  ["K-MAY MATH SETS",                 220, 80,  nil],
  ["CLASSMATES SETS",                 200, 100, "Popular"],
  ["OXFORD MATH SETS",                320, 60,  nil],
  ["KOFA",                            200, 60,  nil],
  ["BB COMPASS",                      80,  60,  nil],
  ["BB DIVIDER",                      60,  50,  nil],
  ["SET SQUARE",                      40,  80,  nil],
  ["STENCIL LETTERING",               80,  40,  nil],
  ["TRICIRCLE 102",                   180, 40,  nil],
  ["TRI CIRCLE 103",                  180, 40,  nil],
  ["TRI CIRCLE 265",                  200, 35,  nil],
  ["TRICYCLE B",                      180, 35,  nil],
  ["GELX RULERS",                     10,  200, nil],
  ["BB RULERS",                       40,  150, nil],
  ["BB RULERS PLASTIC",               35,  150, nil],
  ["STEEL RULER",                     80,  80,  nil],
  ["FLEX RULERS",                     30,  100, nil],
  ["HACO RULER",                      45,  150, nil],
  ["ALPHABET RULER",                  30,  80,  nil],

  # ════════════════════════════════════════════════════════════════════════
  # CALCULATORS
  # ════════════════════════════════════════════════════════════════════════
  ["CASIO SCIENTIFIC CALCULATOR",     1200,30, "Best Seller"],
  ["GAVOO SCIENTIFIC",                800, 40,  nil],
  ["SCIENT CALCULATOR",               900, 30,  nil],
  ["KKY CALCULATOR",                  350, 40,  nil],
  ["KADIO ORDINARY CALCULATOR",       300, 40,  nil],
  ["CALCULATOR BATTERIES",            50,  80,  nil],
  ["CALCULATOR BATTERIES 2032/2035",  80,  50,  nil],
  ["ORDINARY CALCULATOR BATTERY",     40,  80,  nil],

  # ════════════════════════════════════════════════════════════════════════
  # ADHESIVES & TAPES
  # ════════════════════════════════════════════════════════════════════════
  ["GLUE",                            25,  150, nil],
  ["1 KG GLUE",                       200, 20,  nil],
  ["GLUE STICK",                      40,  120, nil],
  ["GLUE STICK PELICAN",              45,  100, nil],
  ["SUPER GLUE",                      50,  80,  nil],
  ["CELLOTAPE",                       40,  150, nil],
  ["2 CELLOTAPE",                     70,  80,  nil],
  ["MASKING TAPE",                    60,  60,  nil],
  ["BLACK TAPE",                      80,  50,  nil],
  ["BIDDING TAPE",                    60,  50,  nil],
  ["PVC TWINE",                       40,  60,  nil],

  # ════════════════════════════════════════════════════════════════════════
  # CHALK & BOARD SUPPLIES
  # ════════════════════════════════════════════════════════════════════════
  ["DUSTLESS CHALK",                  50,  80,  nil],
  ["DUSTLESS CHALK COLOURED",         70,  60,  nil],
  ["DUSTLESS CHAK COLOURED",          70,  50,  nil],
  ["WOODEN DUSTERS",                  80,  25,  nil],
  ["PLASTIC DUSTERS",                 60,  30,  nil],

  # ════════════════════════════════════════════════════════════════════════
  # ENVELOPES & PAPER
  # ════════════════════════════════════════════════════════════════════════
  ["A4 ENVELOP",                      5,   300, nil],
  ["A5 ENVELOP",                      4,   300, nil],
  ["A6ENVELOP",                       3,   200, nil],
  ["A7ENVELOP",                       3,   200, nil],
  ["DL WHITE",                        3,   200, nil],
  ["MEDICAL ENVELOP",                 5,   100, nil],
  ["PHOTOCOPY PAPERS",                550, 30,  nil],
  ["TRANSPARENCY PAPERS",             30,  30,  nil],
  ["AFRILABELS",                      20,  100, nil],

  # ════════════════════════════════════════════════════════════════════════
  # BOOK COVERS
  # ════════════════════════════════════════════════════════════════════════
  ["TEEPEE",                          60,  100, "Popular"],
  ["A4 TEEPEE COVERS",                70,  80,  nil],
  ["A5 TEEPEE READY CLEAR COVER",     60,  80,  nil],
  ["TEEPEE LAMINATED COVERS",         80,  60,  nil],
  ["A4 READY COVERS BROWN",           40,  100, nil],
  ["A5 READY COVER BROWN",            30,  100, nil],
  ["BROWN COVERS",                    35,  100, nil],
  ["A4 ADHESIVE COVERS",              80,  80,  nil],
  ["A5 ADHESIVE COVERS",              60,  80,  nil],

  # ════════════════════════════════════════════════════════════════════════
  # FILING & OFFICE SUPPLIES
  # ════════════════════════════════════════════════════════════════════════
  ["BOX FILE",                        200, 30,  nil],
  ["SPRING FILE",                     60,  50,  nil],
  ["DOCUMENT WALLETS MANILA",         30,  80,  nil],
  ["PORTIFOLIO",                      150, 20,  nil],
  ["STAMP PAD",                       80,  20,  nil],
  ["STAMP PAD INK",                   50,  30,  nil],
  ["STAPLER M & G",                   250, 25,  nil],
  ["STAPLER MG",                      250, 25,  nil],
  ["STAPLER NO 10",                   150, 30,  nil],
  ["STAPLER NO 207",                  250, 25,  nil],
  ["STAPLER NO 2819",                 280, 20,  nil],
  ["STAPLES",                         30,  100, nil],
  ["STAPLES MG",                      35,  80,  nil],
  ["NO 10 STAPLES",                   30,  100, nil],
  ["STAPLES 23/24",                   50,  80,  nil],
  ["STAPLES BIG PACKET",              80,  50,  nil],
  ["STAPLE REMOVER",                  40,  60,  nil],
  ["PUNCH",                           250, 25,  nil],
  ["PUNCH SMALL",                     80,  40,  nil],
  ["SMALL PUNCH",                     80,  40,  nil],
  ["PAPER CLIPS",                     30,  100, nil],
  ["RUBBER BANDS",                    20,  100, nil],
  ["OFFICE PIN",                      20,  100, nil],
  ["MAP PINS",                        30,  80,  nil],
  ["THUMB TAC",                       25,  100, nil],
  ["STICKY NOTES",                    80,  80,  nil],
  ["COLOR STICKY NOTES",              100, 60,  nil],
  ["ID SEALING",                      30,  50,  nil],
  ["CASHSALE",                        50,  30,  nil],

  # ════════════════════════════════════════════════════════════════════════
  # NEEDLES, SEWING & HOME SCIENCE
  # ════════════════════════════════════════════════════════════════════════
  ["NEEDLES",                         20,  50,  nil],
  ["CLOCHET PIN",                     15,  50,  nil],
  ["CLOCHET",                         30,  30,  nil],
  ["THIMBLE",                         20,  50,  nil],
  ["THREAD",                          10,  100, nil],
  ["KNITTING THREAD",                 15,  80,  nil],
  ["KNITTING NEEDLES MIKUHA",         60,  30,  nil],
  ["HOME SCIENCE KIT",                500, 20,  nil],
  ["WOOVEN NO 22",                    50,  30,  nil],
  ["WOOVEN NO 25",                    60,  30,  nil],
  ["POACH MOSAIC",                    150, 20,  nil],

  # ════════════════════════════════════════════════════════════════════════
  # SPORTS & PE EQUIPMENT
  # ════════════════════════════════════════════════════════════════════════
  ["STOP WATCH",                      800, 10,  nil],
  ["METALIC WHITLE WITH STRING",      80,  20,  nil],
  ["JAVELIN 600GMS",                  800, 5,   nil],
  ["JAVELIN 700 GMS",                 900, 5,   nil],
  ["DISCUSS",                         700, 5,   nil],
  ["SHOTPUT",                         600, 5,   nil],
  ["HAND PUMP",                       300, 8,   nil],

  # ════════════════════════════════════════════════════════════════════════
  # PADLOCKS & HARDWARE
  # ════════════════════════════════════════════════════════════════════════
  ["PADLOCK",                         180, 30,  nil],
  ["MINDAY 40MM PADLOCK",             200, 25,  nil],
  ["MINDAY 50MM PADLOCK",             280, 20,  nil],
  ["BAGLOCK PADLOCK",                 150, 30,  nil],
  ["YONGLI PADLOCK",                  200, 25,  nil],
  ["KEY HOLDER QUALITY",              50,  40,  nil],
  ["SPIRAL KEYHOLDERS",               30,  60,  nil],
  ["NECK KEY HOLDER",                 30,  50,  nil],
  ["NECK STRAPS",                     30,  80,  nil],

  # ════════════════════════════════════════════════════════════════════════
  # MUSIC & ELECTRONICS
  # ════════════════════════════════════════════════════════════════════════
  ["FLUTE/DISCANT RECORDER",          600, 15,  nil],
  ["SHUER BASS HEADPHONE",            1200,10,  nil],

  # ════════════════════════════════════════════════════════════════════════
  # BATTERIES & ELECTRONICS
  # ════════════════════════════════════════════════════════════════════════
  ["EVEREADY AA",                     80,  40,  nil],
  ["EVEREADY AAA",                    80,  40,  nil],
  ["EPSON INK 6/K",                   800, 10,  nil],

  # ════════════════════════════════════════════════════════════════════════
  # CLOCKS & WATCHES
  # ════════════════════════════════════════════════════════════════════════
  ["DIGITAL WALL CLOCK",              800, 10,  nil],
  ["ALARM WRIST WATCH",               600, 10,  nil],

  # ════════════════════════════════════════════════════════════════════════
  # SCHOOL EQUIPMENT & TOOLS
  # ════════════════════════════════════════════════════════════════════════
  ["SCHOOL BELL",                     500, 5,   nil],
  ["GLOBE 20CM",                      1200,5,   nil],
  ["HACKSAW WITH BLADE",              250, 10,  nil],
  ["HAND SAW 16 METALIC",             400, 8,   nil],
  ["METALIC SPADE",                   350, 8,   nil],
  ["HAMMERS",                         250, 10,  nil],
  ["SCISSORS SMALL",                  80,  30,  nil],
  ["NAIL CUTTER",                     40,  30,  nil],
  ["POLYTHENE ROLL",                  200, 15,  nil],
  ["GRANT IN AID",                    0,   0,   nil],

  # ════════════════════════════════════════════════════════════════════════
  # TELECOM (recharge cards sold in store)
  # ════════════════════════════════════════════════════════════════════════
  ["AIRTEL",                          50,  0,   nil],
  ["SAFARICOM",                       50,  0,   nil],
]

# ── Build and save products ───────────────────────────────────────────────────
puts "\nSeeding #{products_data.length} products..."
created = 0; updated = 0; skipped = 0

SKIP_NAMES = %w[GRANT\ IN\ AID AIRTEL SAFARICOM CASHSALE PETTY\ CASH RAFFLE].freeze

products_data.each_with_index do |(raw_name, price, stock, badge), sort_idx|
  raw_name = raw_name.to_s.strip

  # Skip internal/non-product entries
  next if SKIP_NAMES.include?(raw_name)
  next if price == 0 && stock == 0

  # Parse grade prefix (e.g. "7-MENTOR MATHS" → grade 7, clean name)
  prefix_match = raw_name.match(/\A(\d{1,2}|PP\d)-(.+)\z/)
  grade_str    = prefix_match ? prefix_match[1] : nil
  clean_title  = prefix_match ? prefix_match[2].strip : raw_name.strip
  clean_title  = clean_title.split.map(&:capitalize).join(" ")
  clean_title  = clean_title.gsub("L/horn", "Longhorn").gsub("L/Horn", "Longhorn")
                             .gsub("Mtp", "MTP").gsub("Klb", "KLB")
                             .gsub("Cre", "CRE").gsub("Cre", "CRE")
                             .gsub("Pp1", "PP1").gsub("Pp2", "PP2")
                             .gsub("Jsss", "JSS").gsub("Jss", "JSS")
                             .gsub("Lhorn", "Longhorn").gsub("Kcse", "KCSE")
                             .gsub("Knec", "KNEC").gsub("F3", "F3").gsub("F4", "F4")

  full_name = grade_str ? "Grade #{grade_str} — #{clean_title}" : clean_title
  full_name = full_name.gsub("Grade PP1", "PP1").gsub("Grade PP2", "PP2")

  class_level = parse_grade(grade_str)
  category    = guess_category(raw_name, grade_str)
  subject     = guess_subject(raw_name)

  # Build description
  desc_parts = []
  desc_parts << "#{category.delete_suffix('s')} for #{class_level}." if class_level
  desc_parts << "Subject: #{subject}." if subject && category == "Textbooks"
  desc_parts << "Available at Them Bookshop, Nairobi."
  description = desc_parts.join(" ")

  product = Product.find_or_initialize_by(name: full_name)
  is_new  = product.new_record?

  product.assign_attributes(
    category:       category,
    description:    description,
    price:          price,
    stock_quantity: stock,
    badge:          badge,
    active:         price > 0,
    class_level:    class_level,
    subject:        subject,
    sort_order:     sort_idx,
  )

  if product.save
    is_new ? created += 1 : updated += 1
    print "."
  else
    skipped += 1
    puts "\n❌ #{full_name}: #{product.errors.full_messages.join(', ')}"
  end
end

puts "\n\n✅ #{created} created, #{updated} updated, #{skipped} skipped"
puts "📦 Total active products: #{Product.active.count}"
puts "\n🎉 Them Bookshop seeded!"
puts "\n📋 Admin:"
puts "   Email:    #{admin.email}"
puts "   Password: #{ENV.fetch('ADMIN_PASSWORD', 'Admin@2025!')}"