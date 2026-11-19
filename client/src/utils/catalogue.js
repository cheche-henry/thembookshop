// Mirror of Product::TAXONOMY on the Rails side. The API /products/meta
// endpoint is authoritative for the admin form; these constants keep the
// storefront filter usable before that request resolves and provide labels.
export const TAXONOMY = {
  Books: [
    'Textbooks',
    'Revision & Exam Prep',
    'Set Books & Literature',
    'Readers & Storybooks',
    'Reference & Dictionaries',
    'Bibles & Religious',
  ],
  Stationery: [
    'Exercise Books & Notebooks',
    'Writing & Correction',
    'Paper, Envelopes & Book Covers',
    'Files & Filing',
    'Office Essentials',
    'Accounting & Cash Books',
    'Registers & Admin Books',
    'Diaries & Planners',
    'Adhesives & Tapes',
    'Calculators',
    'Math Sets & Technical Drawing',
    'Chalk & Whiteboard',
  ],
  'Art & Craft': ['Colouring', 'Paints & Brushes', 'Craft & Modelling'],
  'School Equipment': [
    'Classroom & Teaching Aids',
    'Sports & PE',
    'Home Science & Sewing',
    'Tools & Hardware',
    'Music & Electronics',
  ],
}

export const DEPARTMENTS = Object.keys(TAXONOMY)
export const SUBCATEGORIES = Object.values(TAXONOMY).flat()

export const SUBJECT_COMPONENTS = {
  Kiswahili: ['Lugha', 'Fasihi', 'Insha'],
  English: ['Language', 'Literature', 'Composition'],
}

export const SUBJECTS = [
  'Mathematics', 'English', 'Kiswahili', 'Science', 'Biology', 'Chemistry',
  'Physics', 'Geography', 'History', 'Social Studies', 'Creative Arts', 'CRE',
  'Agriculture', 'Pre-Technical', 'Business',
]

export const STAGES = {
  'Pre-Primary': ['PP1', 'PP2'],
  'Lower Primary': ['Grade 1', 'Grade 2', 'Grade 3'],
  'Upper Primary': ['Grade 4', 'Grade 5', 'Grade 6'],
  'Junior Secondary': ['Grade 7', 'Grade 8', 'Grade 9'],
  'Senior Secondary': ['Grade 10', 'Grade 11', 'Grade 12'],
  'Secondary (8-4-4)': ['Form 1', 'Form 2', 'Form 3', 'Form 4'],
}

export const CLASS_LEVELS = Object.values(STAGES).flat()

export const BADGES = [
  'Best Seller', 'New', 'New Edition', 'Popular', 'Exam Prep',
  'Bundle Deal', 'Value Pack', 'Kids Favorite', 'Set Book',
]

export function levelLabel(levels = []) {
  const list = (levels || []).filter(Boolean)
  if (!list.length) return null
  if (list.length === 1) return list[0]

  const first = list[0]
  const last = list[list.length - 1]
  const firstMatch = first.match(/^(.*?)\s+(\d+)$/)
  const lastMatch = last.match(/^(.*?)\s+(\d+)$/)

  if (
    firstMatch && lastMatch &&
    firstMatch[1] === lastMatch[1] &&
    Number(lastMatch[2]) === Number(firstMatch[2]) + list.length - 1
  ) {
    return `${firstMatch[1]} ${firstMatch[2]}–${lastMatch[2]}`
  }

  return list.join(' & ')
}

export function productLevel(product) {
  return product?.level_label || levelLabel(product?.class_levels) || product?.class_level || null
}

export function productSubject(product) {
  if (product?.subject_label) return product.subject_label
  return [product?.subject, product?.subsubject].filter(Boolean).join(' · ') || null
}

export function subcategoriesFor(category) {
  return TAXONOMY[category] || []
}
