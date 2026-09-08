import { useState } from "react"
import { Minus, Plus, Trash2 } from "lucide-react"
import type { OrderItem as OrderItemType } from "../../../types/pos"
import { formatPrice } from "../../../utils/currency"


type OrderItemProps = {
  item: OrderItemType
  onIncrease: () => void
  onDecrease: () => void
  onRemove: () => void
  onUpdateNotes: (notes: string) => void
}

export function OrderItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  onUpdateNotes,
}: OrderItemProps) {
  const itemTotal = item.price * item.qty
  const [isEditingNote, setIsEditingNote] = useState(false)

  return (
    <div className="border-b border-slate-100 p-3 transition-colors hover:bg-slate-50/60">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-bold text-slate-900">
            {item.name}
          </div>

          <div className="mt-0.5 font-mono text-[10px] font-medium tabular-nums text-slate-400">
            Rp {formatPrice(item.price)} / unit
          </div>
        </div>

        <div className="shrink-0 font-mono text-xs font-bold tabular-nums text-slate-900">
          Rp {formatPrice(itemTotal)}
        </div>
      </div>

      {item.notes || isEditingNote ? (
      <div className="mt-1.5">
        <input
         type="text"
         value={item.notes || ""}
         onChange={(e) => onUpdateNotes(e.target.value)}
         placeholder="Catatan (i.e: pedas, sedang, dll"
         className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden"
         autoFocus={isEditingNote && !item.notes}
        />
      </div>
      ) : (
        <button
        type="button"
        onClick={() => setIsEditingNote(true)}
        className="mt-1 text-[10px] font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
        >
          + Tambah Catatan
        </button>
      )}


      <div className="mt-2.5 flex items-center">
        <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={onDecrease}
            disabled={item.qty <= 1}
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-600 transition-all duration-150 hover:bg-slate-100 hover:text-slate-900 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
          >
            <Minus size={12} strokeWidth={2} />
          </button>

          <span className="w-7 text-center font-mono text-xs font-bold tabular-nums text-slate-900">
            {item.qty}
          </span>

          <button
            type="button"
            onClick={onIncrease}
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-600 transition-all duration-150 hover:bg-slate-100 hover:text-slate-900 active:scale-90 cursor-pointer"
          >
            <Plus size={12} strokeWidth={2} />
          </button>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 transition-all duration-150 hover:bg-red-50 hover:text-red-500 active:scale-95 cursor-pointer"
        >
          <Trash2 size={12} strokeWidth={2} />
          <span>Remove</span>
        </button>
      </div>
    </div>
  )
}

