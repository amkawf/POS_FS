export type CategoryTabItem = {
  id: string
  name: string
}

type CategoryTabsProps = {
  categories: CategoryTabItem[]
  activeCategoryId: string
  onSelectCategory: (categoryId: string) => void
}

export function CategoryTabs({
  categories,
  activeCategoryId,
  onSelectCategory,
}: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {categories.map((category) => {
        const isActive = category.id === activeCategoryId
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelectCategory(category.id)}
            className={
              isActive
                ? "h-9 rounded border border-neutral-900 bg-neutral-900 px-3 text-xs font-bold text-white transition-colors cursor-pointer"
                : "h-9 rounded border border-neutral-300 bg-white px-3 text-xs font-bold text-neutral-700 transition-colors hover:border-neutral-900 cursor-pointer"
            }
          >
            {category.name}
          </button>
        )
      })}
    </div>
  )
}