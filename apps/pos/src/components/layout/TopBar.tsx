import {
  Bell,
  ChevronDown,
  Menu,
  Monitor,
  Search,
  ShoppingBag,
  ShoppingCart,
  Store,
} from "lucide-react"
import { TextInput } from "@mantine/core"
import type { PosView } from "../../types/navigation"

type TopBarProps = {
  searchQuery?: string
  onSearchChange?: (value: string) => void
  onOpenSavedOrders?: () => void
  openOrdersCount?: number
  onToggleMobileNav?: () => void
  cartItemCount?: number
  onOpenMobileCart?: () => void
  currentView?: PosView
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
}: TopBarProps) {
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

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2">
          <div className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-blue-200/80 bg-blue-50 text-xs font-bold text-blue-600">
            AM
          </div>

          <div className="hidden xl:block">
            <div className="text-xs font-bold text-slate-900">Cashier</div>
            <div className="text-[9px] font-medium text-slate-400">USER-001</div>
          </div>

          <ChevronDown size={14} strokeWidth={2} className="hidden xl:block text-slate-400" />
        </div>
      </div>
    </header>
  )
}

