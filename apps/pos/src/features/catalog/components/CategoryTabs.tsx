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
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
      {categories.map((category) => {
        const isActive = category.id === activeCategoryId
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelectCategory(category.id)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs transition-all duration-200 ease-in-out active:scale-[0.98] cursor-pointer ${
              isActive
                ? "bg-blue-600 font-medium text-white shadow-sm shadow-blue-500/25"
                : "bg-slate-100 font-normal text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            {category.name}
          </button>
        )
      })}
    </div>
  )
}

