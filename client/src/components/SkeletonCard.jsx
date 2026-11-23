export default function SkeletonCard() {
  return (
    <div className="overflow-hidden border border-line bg-surface">
      <div className="skeleton aspect-[2/3] w-full" />
      <div className="space-y-2.5 p-4">
        <div className="skeleton h-4 w-4/5 rounded-sm" />
        <div className="skeleton h-3 w-1/2 rounded-sm" />
        <div className="flex items-center justify-between pt-2">
          <div className="skeleton h-5 w-20 rounded-sm" />
          <div className="skeleton h-8 w-16 rounded-md" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 8, className = '' }) {
  return (
    <div className={`grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}
