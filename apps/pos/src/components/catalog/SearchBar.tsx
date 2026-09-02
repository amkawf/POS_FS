type SearchBarProps = {
  placeholder?: string
}

export function SearchBar({
  placeholder = "Search product, SKU...",
}: SearchBarProps) {
  return (
    <div className="relative flex-1">
      <input
        type="text"
        placeholder={placeholder}
        className="h-9 w-full border border-neutral-300 bg-neutral-50 px-3 pr-12 text-sm outline-none focus:border-neutral-950"
      />

      <span className="absolute right-2 top-1/2 -translate-y-1/2 border border-neutral-300 bg-white px-2 py-0.5 text-[10px] font-bold text-neutral-500">
        /
      </span>
    </div>
  )
}