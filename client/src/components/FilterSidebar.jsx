import { useEffect } from 'react'
import { X } from 'lucide-react'
import { TAXONOMY, DEPARTMENTS, STAGES, SUBJECTS, SUBJECT_COMPONENTS } from '../utils/catalogue'

const ALL = 'all'

function Option({ active, onClick, label, count, depth = 0 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-[13px] transition-colors ${
        depth ? 'pl-4' : ''
      } ${
        active
          ? 'bg-brand-50 font-medium text-brand-800'
          : 'text-body hover:bg-muted-surface hover:text-ink'
      }`}
      aria-pressed={active}
    >
      <span className="truncate">{label}</span>
      {count > 0 && <span className="flex-shrink-0 text-[11px] tabular-nums text-muted">{count}</span>}
    </button>
  )
}

function Section({ title, children }) {
  return (
    <section className="border-b border-line py-5 first:pt-0 last:border-b-0">
      <h4 className="eyebrow mb-2">{title}</h4>
      <div className="space-y-0.5">{children}</div>
    </section>
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

  useEffect(() => {
    if (!mobileOpen) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event) => { if (event.key === 'Escape') setMobileOpen(false) }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [mobileOpen, setMobileOpen])

  // When the API reports counts, hide shelves with no stock so every option
  // in the sidebar leads to a non-empty result page.
  const departments = hasFacets
    ? DEPARTMENTS.filter((name) => (counts.category[name] || 0) > 0)
    : DEPARTMENTS

  const subcategories = (TAXONOMY[category] || []).filter((name) => {
    if (!hasFacets) return true
    return (counts.subcategory[`${category}::${name}`] || 0) > 0
  })

  const stageGroups = Object.entries(STAGES)
    .map(([stageName, levels]) => [
      stageName,
      hasFacets ? levels.filter((level) => (counts.level[level] || 0) > 0) : levels,
    ])
    .filter(([, levels]) => levels.length > 0)

  const subjectList = hasFacets
    ? SUBJECTS.filter((name) => (counts.subject[name] || 0) > 0)
    : SUBJECTS

  const content = (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Filter</h3>
        {hasFilters && (
          <button
            type="button"
            onClick={reset}
            className="text-xs text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <Section title="Department">
        <Option active={category === ALL} onClick={() => setCategory(ALL)} label="All products" />
        {departments.map((name) => (
          <div key={name}>
            <Option
              active={category === name && subcategory === ALL}
              onClick={() => setCategory(name)}
              label={name}
              count={counts.category[name]}
            />
            {category === name && subcategories.length > 0 && (
              <div className="mt-0.5 space-y-0.5">
                <Option
                  active={subcategory === ALL}
                  onClick={() => setSubcategory(ALL)}
                  label={`All ${name}`}
                  depth={1}
                />
                {subcategories.map((sub) => (
                  <Option
                    key={sub}
                    active={subcategory === sub}
                    onClick={() => setSubcategory(sub)}
                    label={sub}
                    count={counts.subcategory[`${name}::${sub}`]}
                    depth={1}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </Section>

      <Section title="School level">
        <Option
          active={classLevel === ALL && stage === ALL}
          onClick={() => setClassLevel(ALL)}
          label="All levels"
        />
        {stageGroups.map(([stageName, levels]) => (
          <div key={stageName} className="pt-3">
            <p className="px-2 pb-1 text-[11px] font-medium text-muted">{stageName}</p>
            <div className="grid grid-cols-2 gap-x-1">
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
          <div className="mt-3 border-t border-line pt-3">
            <p className="px-2 pb-1 text-[11px] font-medium text-muted">Stage-wide</p>
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
          label="All subjects"
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
              <div className="mt-0.5 space-y-0.5">
                {(SUBJECT_COMPONENTS[name] || [])
                  .filter((comp) => !hasFacets || (counts.component[`${name}::${comp}`] || 0) > 0)
                  .map((comp) => (
                    <Option
                      key={comp}
                      active={subsubject === comp}
                      onClick={() => setSubsubject(comp)}
                      label={comp}
                      count={counts.component[`${name}::${comp}`]}
                      depth={1}
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
      <aside className="hidden w-60 flex-shrink-0 lg:block">
        <div className="sticky top-[88px] max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
          {content}
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-ink/40"
            onClick={() => setMobileOpen(false)}
            aria-label="Close filters"
          />
          <div className="relative flex h-full w-[86%] max-w-sm flex-col bg-surface">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <p className="text-sm font-semibold text-ink">Filters</p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="-m-1.5 rounded-md p-1.5 text-muted hover:bg-muted-surface hover:text-ink"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">{content}</div>
            <div className="border-t border-line p-4">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="h-11 w-full rounded-md bg-brand-700 text-sm font-medium text-white"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
