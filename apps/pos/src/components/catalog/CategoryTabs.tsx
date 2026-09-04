type CategoryTabsProps = {
  categories: string[]
  activeCategory: string
  onSelectCategory: (category: string) => void
}

export function CategoryTabs({
  categories,
  activeCategory,
  onSelectCategory,
}: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {categories.map((category) => {
        const isActive = category === activeCategory
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelectCategory(category)}
            className={
              isActive
                ? "h-9 rounded border border-neutral-900 bg-neutral-900 px-3 text-xs font-bold text-white transition-colors"
                : "h-9 rounded border border-neutral-300 bg-white px-3 text-xs font-bold text-neutral-700 transition-colors hover:border-neutral-900"
              }
          >
            {category}
          </button>
        )
      })}
    </div>
  )
}