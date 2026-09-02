import {
  Bell,
  ChevronDown,
  Monitor,
  Search,
  Store,
} from "lucide-react"
import { Badge, TextInput } from "@mantine/core"

export function TopBar() {
  return (
    <header className="flex h-16 items-center border-b border-slate-200 bg-white px-4">
      {/* BRAND */}
      <div className="flex w-60 items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-600 text-sm font-extrabold text-white">
          P
        </div>

        <div>
          <div className="text-sm font-extrabold tracking-tight text-slate-900">
            POS TERMINAL
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
            <Store size={12} />
            STORE-001
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex flex-1 items-center px-4">
        <TextInput
          className="w-full max-w-xl"
          placeholder="Search product or SKU..."
          leftSection={<Search size={17} />}
          rightSection={
            <span className="border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
              /
            </span>
          }
          styles={{
            input: {
              height: 40,
              borderRadius: 6,
              borderColor: "#e2e8f0",
              backgroundColor: "#f8fafc",
              fontSize: 13,
              fontWeight: 500,
            },
          }}
        />
      </div>

      {/* STATUS */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />

          <div>
            <div className="text-[10px] font-bold text-slate-900">
              ONLINE
            </div>

            <div className="flex items-center gap-1 text-[9px] font-semibold text-slate-400">
              <Monitor size={10} />
              POS-01
            </div>
          </div>
        </div>

        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <Bell size={18} />

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-600" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
            AM
          </div>

          <div className="hidden xl:block">
            <div className="text-xs font-bold text-slate-900">
              Cashier
            </div>

            <div className="text-[9px] font-semibold text-slate-400">
              USER-001
            </div>
          </div>

          <ChevronDown size={15} className="text-slate-400" />
        </div>

        <Badge
          size="sm"
          variant="light"
          color="blue"
        >
          OPEN
        </Badge>
      </div>
    </header>
  )
}