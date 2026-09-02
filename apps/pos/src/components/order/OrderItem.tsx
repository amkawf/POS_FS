import { Minus, Plus, Trash2 } from "lucide-react"
import type { OrderItem as OrderItemType } from "../../types/pos"

type OrderItemProps = {
  item: OrderItemType
  onIncrease: () => void
  onDecrease: () => void
  onRemove: () => void
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
}

export function OrderItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: OrderItemProps) {
  const itemTotal = item.price * item.qty

  return (
    <div className="border-b border-slate-200 p-3 hover:bg-slate-50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-extrabold text-slate-900">
            {item.name}
          </div>

          <div className="mt-1 text-[10px] font-semibold text-slate-400">
            Rp {formatPrice(item.price)} / UNIT
          </div>
        </div>

        <div className="shrink-0 text-sm font-extrabold text-slate-900">
          Rp {formatPrice(itemTotal)}
        </div>
      </div>

      <div className="mt-3 flex items-center">
        <div className="flex items-center">
          <button
            type="button"
            onClick={onDecrease}
            disabled={item.qty <= 1}
            className="flex h-8 w-8 items-center justify-center border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus size={14} strokeWidth={2.5} />
          </button>

          <div className="flex h-8 w-10 items-center justify-center border-y border-slate-200 bg-slate-50 text-xs font-extrabold text-slate-900">
            {item.qty}
          </div>

          <button
            type="button"
            onClick={onIncrease}
            className="flex h-8 w-8 items-center justify-center border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="ml-auto flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase text-slate-400 hover:text-red-600"
        >
          <Trash2 size={13} />
          Remove
        </button>
      </div>
    </div>
  )
}