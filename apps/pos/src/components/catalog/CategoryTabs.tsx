type CategoryTabsProps = {
  categories: string[]
}

export function CategoryTabs({
  categories,
}: CategoryTabsProps) {
  return (
    <div className="flex gap-2">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          className={
            category === "ALL"
              ? "h-9 border border-neutral-950 bg-neutral-950 px-3 text-xs font-bold text-white"
              : "h-9 border border-neutral-300 bg-white px-3 text-xs font-bold text-neutral-700 hover:border-neutral-950"
          }
        >
          {category}
        </button>
      ))}
    </div>
  )
}