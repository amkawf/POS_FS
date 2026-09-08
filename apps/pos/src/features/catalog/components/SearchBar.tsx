import { Search } from "lucide-react"

type SearchBarProps = {
  placeholder?: string
  value?: string
  onChange?: (val: string) => void
}

export function SearchBar({
  placeholder = "Search product, SKU...",
  value = "",
  onChange,
}: SearchBarProps) {
  return (
    <div className="relative flex-1">
      <Search size={16} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-10 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-400 shadow-2xs">
        /
      </span>
    </div>
  )
}

