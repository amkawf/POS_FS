import { ChevronRight, ShoppingBag } from "lucide-react"
import { formatPrice } from "../../../utils/currency"

type CartFloatingBarProps = {
  itemCount: number
  total: number
  onOpenCart: () => void
}

export function CartFloatingBar({
  itemCount,
  total,
  onOpenCart,
}: CartFloatingBarProps) {
  if (itemCount === 0) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
      <button
        type="button"
        onClick={onOpenCart}
        className="flex h-14 w-full items-center justify-between rounded-xl bg-blue-600 px-4 text-white shadow-xl shadow-blue-500/30 transition-all duration-200 active:scale-[0.98] cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-white">
            <ShoppingBag size={18} strokeWidth={2} />
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 font-mono text-[10px] font-black text-slate-900 shadow-xs">
              {itemCount}
            </span>
          </div>

          <div className="text-left">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-100">
              Pesanan Anda
            </div>
            <div className="font-mono text-sm font-extrabold tabular-nums">
              Rp {formatPrice(total)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-extrabold tracking-wide">
          <span>Lihat Keranjang</span>
          <ChevronRight size={16} strokeWidth={2.5} />
        </div>
      </button>
    </div>
  )
}

