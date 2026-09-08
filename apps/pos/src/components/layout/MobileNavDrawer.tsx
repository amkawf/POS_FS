import { Drawer } from "@mantine/core"
import { Store, UserCheck } from "lucide-react"
import { ALL_NAV_ITEMS } from "../../config/navigation"
import type { PosView } from "../../types/navigation"

type MobileNavDrawerProps = {
  opened: boolean
  onClose: () => void
  activeView: PosView
  onViewChange: (view: PosView) => void
}

export function MobileNavDrawer({
  opened,
  onClose,
  activeView,
  onViewChange,
}: MobileNavDrawerProps) {
  const handleItemClick = (view: PosView) => {
    onViewChange(view)
    onClose()
  }

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="left"
      size="280px"
      title={
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-extrabold text-white shadow-sm shadow-blue-500/25">
            P
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-tight text-slate-900">
              POS TERMINAL
            </div>
            <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
              <Store size={11} />
              <span>STORE-001</span>
            </div>
          </div>
        </div>
      }
      styles={{
        header: {
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: 12,
        },
        body: {
          padding: 0,
          height: "calc(100% - 57px)",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <div className="flex flex-1 flex-col justify-between p-3">
        <nav className="space-y-1">
          {ALL_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.view

            return (
              <button
                key={item.view}
                type="button"
                onClick={() => handleItemClick(item.view)}
                className={
                  isActive
                    ? "flex h-11 w-full items-center gap-3 rounded-xl border border-blue-200/80 bg-blue-50 px-3.5 text-left text-xs font-bold text-blue-600 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
                    : "flex h-11 w-full items-center gap-3 rounded-xl px-3.5 text-left text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-[0.98] cursor-pointer"
                }
              >
                <Icon size={18} strokeWidth={2} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* User Footer */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 mt-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              AM
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Cashier</div>
              <div className="text-[10px] text-slate-400 font-medium">Shift Pagi • Online</div>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 border-t border-slate-200/70 pt-2 text-[10px] font-semibold text-emerald-600">
            <UserCheck size={12} />
            <span>Shift Aktif (Online Ready)</span>
          </div>
        </div>
      </div>
    </Drawer>
  )
}

