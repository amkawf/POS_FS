import {
  Bell,
  ChevronDown,
  Lock,
  LogOut,
  Menu,
  Monitor,
  ReceiptText,
  Search,
  ShoppingBag,
  ShoppingCart,
  Store,
} from "lucide-react"
import { Menu as MantineMenu, TextInput } from "@mantine/core"
import type { PosView } from "../../types/navigation"
import { useAuth } from "../../context/AuthContext"

type TopBarProps = {
  searchQuery?: string
  onSearchChange?: (value: string) => void
  onOpenSavedOrders?: () => void
  openOrdersCount?: number
  onToggleMobileNav?: () => void
  cartItemCount?: number
  onOpenMobileCart?: () => void
  currentView?: PosView
  onOpenCloseShift?: () => void 
}

export function TopBar({
  searchQuery = "",
  onSearchChange,
  onOpenSavedOrders,
  openOrdersCount,
  onToggleMobileNav,
  cartItemCount = 0,
  onOpenMobileCart,
  currentView = "ORDERS",
  onOpenCloseShift,
}: TopBarProps) {
  const { currentUser, activeShift, quickLock, logout } = useAuth()
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-4">
      {/* LEFT: HAMBURGER (MOBILE) + BRAND */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95 lg:hidden cursor-pointer"
          title="Buka Menu"
        >
          <Menu size={20} strokeWidth={2} />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-extrabold text-white shadow-sm shadow-blue-500/25">
            P
          </div>

          <div className="hidden sm:block">
            <div className="text-sm font-extrabold tracking-tight text-slate-900">
              POS TERMINAL
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
              <Store size={12} strokeWidth={2} />
              <span>STORE-001</span>
            </div>
          </div>
        </div>
      </div>

      {/* CENTER: SEARCH INPUT */}
      <div className="flex flex-1 items-center justify-center px-2 sm:px-6">
        <TextInput
          className="w-full max-w-xs sm:max-w-md md:max-w-lg"
          placeholder="Cari menu / SKU..."
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.currentTarget.value)}
          leftSection={<Search size={15} strokeWidth={2} className="text-slate-400" />}
          rightSection={
            <span className="hidden sm:inline rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-400 shadow-2xs">
              /
            </span>
          }
          styles={{
            input: {
              height: 38,
              borderRadius: 8,
              borderColor: "#e2e8f0",
              backgroundColor: "#f8fafc",
              fontSize: 12,
              fontWeight: 500,
              color: "#0f172a",
            },
          }}
        />
      </div>

      {/* RIGHT: ACTIONS & STATUS */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Mobile Cart Shortcut Button */}
        {currentView === "ORDERS" && (
          <button
            type="button"
            onClick={onOpenMobileCart}
            className="relative flex h-9 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 text-xs font-bold text-blue-600 transition-all active:scale-95 lg:hidden cursor-pointer"
            title="Buka Keranjang"
          >
            <ShoppingCart size={16} strokeWidth={2} />
            <span className="hidden sm:inline">Cart</span>
            {cartItemCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 font-mono text-[10px] font-extrabold text-white">
                {cartItemCount}
              </span>
            )}
          </button>
        )}

        {/* Saved Orders Button */}
        <button
          type="button"
          onClick={onOpenSavedOrders}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] cursor-pointer shadow-2xs"
          title="Saved Orders"
        >
          <ShoppingBag size={15} strokeWidth={2} className="text-blue-600" />
          <span className="hidden md:inline">Saved</span>
          {openOrdersCount !== undefined && openOrdersCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 font-mono text-[10px] font-bold text-white shadow-xs">
              {openOrdersCount}
            </span>
          )}
        </button>

        {/* Online Indicator (Desktop & Tablet) */}
        <div className="hidden sm:flex items-center gap-2 border-r border-slate-200 pr-3">
          <div className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40" />
          </div>

          <div className="hidden md:block">
            <div className="text-[10px] font-extrabold tracking-wider text-slate-900">
              ONLINE
            </div>
            <div className="flex items-center gap-1 text-[9px] font-medium text-slate-400">
              <Monitor size={10} strokeWidth={2} />
              <span>POS-01</span>
            </div>
          </div>
        </div>

        {/* Notification Bell (Hidden on small mobile) */}
        <button
          type="button"
          className="relative hidden sm:flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95 cursor-pointer"
        >
          <Bell size={17} strokeWidth={2} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>

        {/* Tombol Cepat Kunci Layar */}
        <button
          type="button"
          onClick={quickLock}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95 cursor-pointer shadow-2xs"
          title="Kunci Layar (Quick Lock)"
        >
          <Lock size={15} strokeWidth={2} className="text-slate-600" />
          <span className="hidden md:inline">Kunci</span>
        </button>
        {/* User Profile Dropdown Menu */}
        <MantineMenu shadow="md" width={200} position="bottom-end">
          <MantineMenu.Target>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-slate-100 cursor-pointer"
            >
              <div className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-blue-200/80 bg-blue-50 text-xs font-bold text-blue-600 uppercase">
                {currentUser?.name ? currentUser.name.slice(0, 2) : "ST"}
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-bold text-slate-900">
                  {currentUser?.name || "Staf"}
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-blue-600">
                  {currentUser?.role || "GUEST"}
                </div>
              </div>
              <ChevronDown size={14} strokeWidth={2} className="hidden xl:block text-slate-400" />
            </button>
          </MantineMenu.Target>
                    <MantineMenu.Dropdown>
            <MantineMenu.Label>Sesi Staf Aktif</MantineMenu.Label>
            <MantineMenu.Item
              leftSection={<Lock size={14} />}
              onClick={quickLock}
            >
              Kunci Layar
            </MantineMenu.Item>
            {/* 💵 Opsi Tutup Kasir Khusus Kasir yang sedang punya Shift Aktif */}
            {currentUser?.role === "CASHIER" && activeShift && (
              <MantineMenu.Item
                color="orange"
                leftSection={<ReceiptText size={14} />}
                onClick={onOpenCloseShift}
              >
                Tutup Kasir (End Shift)
              </MantineMenu.Item>
            )}
            <MantineMenu.Divider />
            <MantineMenu.Item
              color="red"
              leftSection={<LogOut size={14} />}
              onClick={logout}
            >
              Keluar (Logout)
            </MantineMenu.Item>
          </MantineMenu.Dropdown>
        </MantineMenu>
      </div>
    </header>
  )
}

