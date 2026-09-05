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

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    active: true,
  },
  {
    label: "Tables",
    icon: Table2,
  },
  {
    label: "Kitchen",
    icon: ChefHat,
  },
  {
    label: "Payments",
    icon: CreditCard,
  },
  {
    label: "Inventory",
    icon: Package,
  },
  {
    label: "Reports",
    icon: BarChart3,
  },
]

type SidebarProps = {
  onOpenOrders?: () => void
  onOpenTables?: () => void
}

export function Sidebar({ onOpenOrders, onOpenTables }: SidebarProps) {
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
          {menuItems.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (item.label === "Orders") {
                    onOpenOrders?.()
                  } else if (item.label === "Tables") {
                    onOpenTables?.()
                  }
                }}
                className={
                  item.active
                    ? "flex h-10 w-full items-center gap-3 rounded-md bg-blue-600 px-3 text-left text-xs font-bold text-white cursor-pointer"
                    : "flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950 cursor-pointer"
                }
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-slate-200 p-2">
        <button
          type="button"
          className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
        >
          <Users size={17} />
          Employees
        </button>

        <button
          type="button"
          className="mt-1 flex h-10 w-full items-center gap-3 rounded-md px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
        >
          <Settings size={17} />
          Settings
        </button>
      </div>
    </aside>
  )
}