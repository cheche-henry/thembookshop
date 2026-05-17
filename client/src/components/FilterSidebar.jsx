import { X, SlidersHorizontal } from 'lucide-react'

const categories = [
  { id:'all', label:'All Products' }, { id:'Textbooks', label:'Textbooks' },
  { id:'Revision Books', label:'Revision Books' }, { id:'Storybooks', label:'Storybooks' },
  { id:'Exercise Books', label:'Exercise Books' }, { id:'Pens & Pencils', label:'Pens & Pencils' },
  { id:'Geometry Sets', label:'Geometry Sets' }, { id:'Rulers', label:'Rulers' },
  { id:'School Bags', label:'School Bags' }, { id:'Stationery', label:'Stationery' },
]
const classLevels = [
  { id:'all', label:'All Levels' },
  { id:'PP1', label:'PP1' }, { id:'PP2', label:'PP2' },
  { id:'Grade 1', label:'Grade 1' }, { id:'Grade 2', label:'Grade 2' },
  { id:'Grade 3', label:'Grade 3' }, { id:'Grade 4', label:'Grade 4' },
  { id:'Grade 5', label:'Grade 5' }, { id:'Grade 6', label:'Grade 6' },
  { id:'Grade 7', label:'Grade 7' }, { id:'Grade 8', label:'Grade 8' },
  { id:'Grade 9', label:'Grade 9' }, { id:'Grade 10', label:'Grade 10' },
  { id:'Form 1', label:'Form 1' }, { id:'Form 2', label:'Form 2' },
  { id:'Form 3', label:'Form 3' }, { id:'Form 4', label:'Form 4' },
]
const subjects = [
  { id:'all', label:'All Subjects' }, { id:'Mathematics', label:'Mathematics' },
  { id:'English', label:'English' }, { id:'Kiswahili', label:'Kiswahili' },
  { id:'Science', label:'Science' }, { id:'Biology', label:'Biology' },
  { id:'Chemistry', label:'Chemistry' }, { id:'Physics', label:'Physics' },
  { id:'Geography', label:'Geography' }, { id:'History', label:'History' },
  { id:'Social Studies', label:'Social Studies' }, { id:'Creative Arts', label:'Creative Arts' },
  { id:'CRE', label:'CRE' }, { id:'Agriculture', label:'Agriculture' },
  { id:'Pre-Technical', label:'Pre-Technical' }, { id:'Business', label:'Business' },
]

function FilterGroup({ title, options, value, onChange }) {
  return (
    <div className="mb-6">
      <h4 className="font-bold text-gray-700 text-sm mb-3" style={{fontFamily:'Nunito,sans-serif'}}>{title}</h4>
      <div className="space-y-1.5">
        {options.map((opt) => (
          <button key={opt.id} onClick={() => onChange(opt.id)} className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${value===opt.id ? 'bg-green-600 text-white font-semibold' : 'text-gray-600 hover:bg-green-50 hover:text-green-700'}`}>{opt.label}</button>
        ))}
      </div>
    </div>
  )
}

export default function FilterSidebar({ category, setCategory, classLevel, setClassLevel, subject, setSubject, hasFilters, reset, mobileOpen, setMobileOpen }) {
  const Content = (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2"><SlidersHorizontal className="w-4 h-4 text-green-600"/><h3 className="font-bold text-gray-800" style={{fontFamily:'Nunito,sans-serif'}}>Filters</h3></div>
        {hasFilters && <button onClick={reset} className="text-xs text-green-600 hover:text-green-800 font-semibold underline">Clear all</button>}
      </div>
      <FilterGroup title="Category" options={categories} value={category} onChange={setCategory}/>
      <FilterGroup title="Class Level" options={classLevels} value={classLevel} onChange={setClassLevel}/>
      <FilterGroup title="Subject" options={subjects} value={subject} onChange={setSubject}/>
    </div>
  )
  return (
    <>
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <div className="sticky top-24 bg-white rounded-2xl shadow-sm p-5">{Content}</div>
      </aside>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)}/>
          <div className="relative bg-white w-72 h-full overflow-y-auto p-5 shadow-xl">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-500"/></button>
            {Content}
          </div>
        </div>
      )}
    </>
  )
}
