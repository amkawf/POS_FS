import {
  BarChart3,
  ChefHat,
  CreditCard,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Table2,
  Users,
} from "lucide-react"
import type { PosView } from "../types/navigation"

type NavMenuItem = {
  view: PosView
  label: string
  icon: typeof LayoutDashboard
}

const mainMenuItems: NavMenuItem[] = [
  {
    view: "DASHBOARD",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    view: "ORDERS",
    label: "Orders",
    icon: ShoppingCart,
  },
  {
    view: "TABLES",
    label: "Tables",
    icon: Table2,
  },
  {
    view: "KITCHEN",
    label: "Kitchen",
    icon: ChefHat,
  },
  {
    view: "PAYMENTS",
    label: "Payments",
    icon: CreditCard,
  },
  {
    view: "INVENTORY",
    label: "Inventory",
    icon: Package,
  },
  {
    view: "REPORTS",
    label: "Reports",
    icon: BarChart3,
  },
]

type SidebarProps = {
  activeView: PosView
  onViewChange: (view: PosView) => void
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="flex w-56 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-12 items-center border-b border-slate-200 px-3">
        <div className="flex items-center gap-2">
          <Store size={17} className="text-blue-600" />

          <span className="text-xs font-extrabold uppercase tracking-wide">
            Main Menu
          </span>
        </div>
      </div>

      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {mainMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.view

            return (
              <button
                key={item.view}
                type="button"
                onClick={() => onViewChange(item.view)}
                className={
                  isActive
                    ? "flex h-10 w-full items-center gap-3 rounded-md bg-blue-600 px-3 text-left text-xs font-bold text-white cursor-pointer shadow-sm transition-all"
                    : "flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950 cursor-pointer transition-all"
                }
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-slate-200 p-2 space-y-1">
        <button
          type="button"
          onClick={() => onViewChange("EMPLOYEES")}
          className={
            activeView === "EMPLOYEES"
              ? "flex h-10 w-full items-center gap-3 rounded-md bg-blue-600 px-3 text-left text-xs font-bold text-white cursor-pointer shadow-sm transition-all"
              : "flex h-10 w-full items-center gap-3 rounded-md px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950 cursor-pointer transition-all"
          }
        >
          <Users size={17} />
          <span>Employees</span>
        </button>

        <button
          type="button"
          onClick={() => onViewChange("SETTINGS")}
          className={
            activeView === "SETTINGS"
              ? "flex h-10 w-full items-center gap-3 rounded-md bg-blue-600 px-3 text-left text-xs font-bold text-white cursor-pointer shadow-sm transition-all"
              : "flex h-10 w-full items-center gap-3 rounded-md px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950 cursor-pointer transition-all"
          }
        >
          <Settings size={17} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  )
}