import { Store } from "lucide-react"
import { BOTTOM_NAV_ITEMS, MAIN_NAV_ITEMS } from "../../config/navigation"
import type { PosView } from "../../types/navigation"
import { useAuth } from "../../context/AuthContext"

type SidebarProps = {
  activeView: PosView
  onViewChange: (view: PosView) => void
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { currentUser } = useAuth()
  const role = currentUser?.role
  
  //  Saring menu berdasarkan hak akses peran (RBAC)
  const allowedMainMenu = MAIN_NAV_ITEMS.filter(
    (item) => !role || item.roles.includes(role)
  )
  const allowedBottomMenu = BOTTOM_NAV_ITEMS.filter(
    (item) => !role || item.roles.includes(role)
  )

  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white select-none">
      <div className="flex h-14 items-center border-b border-slate-200 px-4">
        <div className="flex items-center gap-2">
          <Store size={18} strokeWidth={2} className="text-blue-600" />
          <span className="text-xs font-extrabold uppercase tracking-wide text-slate-900">
            Main Menu
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2.5">
        <div className="space-y-1">
          {allowedMainMenu.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.view

            return (
              <button
                key={item.view}
                type="button"
                onClick={() => onViewChange(item.view)}
                className={
                  isActive
                    ? "flex h-10 w-full items-center gap-3 rounded-lg border border-blue-200/80 bg-blue-50 px-3 text-left text-xs font-bold text-blue-600 shadow-2xs transition-all duration-200 active:scale-[0.98] cursor-pointer"
                    : "flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 active:scale-[0.98] cursor-pointer"
                }
              >
                <Icon size={17} strokeWidth={2} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-slate-200 p-2.5 space-y-1">
        {allowedBottomMenu.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.view

          return (
            <button
              key={item.view}
              type="button"
              onClick={() => onViewChange(item.view)}
              className={
                isActive
                  ? "flex h-10 w-full items-center gap-3 rounded-lg border border-blue-200/80 bg-blue-50 px-3 text-left text-xs font-bold text-blue-600 shadow-2xs transition-all duration-200 active:scale-[0.98] cursor-pointer"
                  : "flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 active:scale-[0.98] cursor-pointer"
              }
            >
              <Icon size={17} strokeWidth={2} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}

