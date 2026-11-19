import { X, SlidersHorizontal } from 'lucide-react'
import { TAXONOMY, DEPARTMENTS, STAGES, SUBJECTS, SUBJECT_COMPONENTS } from '../utils/catalogue'

const ALL = 'all'

function Option({ active, onClick, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
        active
          ? 'bg-green-600 text-white font-semibold'
          : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
      }`}
    >
      <span className="truncate text-left">{label}</span>
      {count > 0 && (
        <span className={`text-xs font-semibold flex-shrink-0 ${active ? 'text-white/80' : 'text-gray-400'}`}>
          {count}
        </span>
      )}
    </button>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h4 className="font-bold text-gray-700 text-sm mb-2" style={{ fontFamily: 'Nunito,sans-serif' }}>
        {title}
      </h4>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function countMaps(facets) {
  const category = {}
  const subcategory = {}
  const subject = {}
  const component = {}
  const level = {}

  ;(facets?.categories || []).forEach((entry) => {
    category[entry.name] = entry.count
    ;(entry.subcategories || []).forEach((sub) => {
      subcategory[`${entry.name}::${sub.name}`] = sub.count
    })
  })
  ;(facets?.subjects || []).forEach((entry) => {
    subject[entry.name] = entry.count
    ;(entry.components || []).forEach((comp) => {
      component[`${entry.name}::${comp.name}`] = comp.count
    })
  })
  ;(facets?.levels || []).forEach((entry) => { level[entry.name] = entry.count })

  return { category, subcategory, subject, component, level }
}

export default function FilterSidebar({
  category, setCategory,
  subcategory, setSubcategory,
  stage, setStage,
  classLevel, setClassLevel,
  subject, setSubject,
  subsubject, setSubsubject,
  facets,
  hasFilters, reset,
  mobileOpen, setMobileOpen,
}) {
  const counts = countMaps(facets)
  const hasFacets = Boolean(facets)

  // When the API reports counts, hide shelves with no stock so every option
  // in the sidebar leads to a non-empty result page.
  const departments = hasFacets
    ? DEPARTMENTS.filter((name) => (counts.category[name] || 0) > 0)
    : DEPARTMENTS

  const subcategories = (TAXONOMY[category] || []).filter((name) => {
    if (!hasFacets) return true
    return (counts.subcategory[`${category}::${name}`] || 0) > 0
  })

  const stages = STAGES
  const stageGroups = Object.entries(stages)
    .map(([stageName, levels]) => [
      stageName,
      hasFacets ? levels.filter((level) => (counts.level[level] || 0) > 0) : levels,
    ])
    .filter(([, levels]) => levels.length > 0)

  const subjectList = hasFacets
    ? SUBJECTS.filter((name) => (counts.subject[name] || 0) > 0)
    : SUBJECTS

  const Content = (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-green-600" />
          <h3 className="font-bold text-gray-800" style={{ fontFamily: 'Nunito,sans-serif' }}>Filters</h3>
        </div>
        {hasFilters && (
          <button
            onClick={reset}
            className="text-xs text-green-600 hover:text-green-800 font-semibold underline"
          >
            Clear all
          </button>
        )}
      </div>

      <Section title="Department">
        <Option
          active={category === ALL}
          onClick={() => setCategory(ALL)}
          label="All Products"
        />
        {departments.map((name) => (
          <div key={name}>
            <Option
              active={category === name && subcategory === ALL}
              onClick={() => setCategory(name)}
              label={name}
              count={counts.category[name]}
            />
            {category === name && subcategories.length > 0 && (
              <div className="mt-1 ml-2 pl-2 border-l border-gray-100 space-y-1">
                <Option
                  active={subcategory === ALL}
                  onClick={() => setSubcategory(ALL)}
                  label={`All ${name}`}
                />
                {subcategories.map((sub) => (
                  <Option
                    key={sub}
                    active={subcategory === sub}
                    onClick={() => setSubcategory(sub)}
                    label={sub}
                    count={counts.subcategory[`${name}::${sub}`]}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </Section>

      <Section title="School Level">
        <Option
          active={classLevel === ALL && stage === ALL}
          onClick={() => setClassLevel(ALL)}
          label="All Levels"
        />
        {stageGroups.map(([stageName, levels]) => (
          <div key={stageName} className="pt-2">
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
              {stageName}
            </p>
            <div className="grid grid-cols-2 gap-1">
              {levels.map((level) => (
                <Option
                  key={level}
                  active={classLevel === level}
                  onClick={() => setClassLevel(level)}
                  label={level}
                  count={counts.level[level]}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Stage-wide reference books (atlases, tables) carry a stage but no
            single class level, so they get their own control. */}
        {hasFacets && (facets?.stages || []).length > 0 && (
          <div className="pt-3 mt-2 border-t border-gray-100">
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
              Stage-wide references
            </p>
            {facets.stages.map((entry) => (
              <Option
                key={entry.name}
                active={stage === entry.name}
                onClick={() => setStage(stage === entry.name ? ALL : entry.name)}
                label={entry.name}
                count={entry.count}
              />
            ))}
          </div>
        )}
      </Section>

      <Section title="Subject">
        <Option
          active={subject === ALL}
          onClick={() => setSubject(ALL)}
          label="All Subjects"
        />
        {subjectList.map((name) => (
          <div key={name}>
            <Option
              active={subject === name && subsubject === ALL}
              onClick={() => setSubject(name)}
              label={name}
              count={counts.subject[name]}
            />
            {subject === name && (SUBJECT_COMPONENTS[name] || []).length > 0 && (
              <div className="mt-1 ml-2 pl-2 border-l border-gray-100 space-y-1">
                {(SUBJECT_COMPONENTS[name] || [])
                  .filter((comp) => !hasFacets || (counts.component[`${name}::${comp}`] || 0) > 0)
                  .map((comp) => (
                    <Option
                      key={comp}
                      active={subsubject === comp}
                      onClick={() => setSubsubject(comp)}
                      label={comp}
                      count={counts.component[`${name}::${comp}`]}
                    />
                  ))}
              </div>
            )}
          </div>
        ))}
      </Section>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <div className="sticky top-24 bg-white rounded-2xl shadow-sm p-5 max-h-[calc(100vh-7rem)] overflow-y-auto">
          {Content}
        </div>
      </aside>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative bg-white w-72 h-full overflow-y-auto p-5 shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            {Content}
          </div>
        </div>
      )}
    </>
  )
}
