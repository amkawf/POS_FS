import { CreditCard, Percent, Save, Trash2 } from "lucide-react"
import { formatPrice } from "../../../utils/currency"

type OrderActionsProps = {
  total: number
  disabled?: boolean
  isSaving?: boolean
  saveLabel?: string
  onSaveOrder: () => void
  onClearOrder: () => void
  onPayOrder?: () => void
}

export function OrderActions({
  total,
  disabled = false,
  isSaving = false,
  saveLabel,
  onSaveOrder,
  onClearOrder,
  onPayOrder,
}: OrderActionsProps) {
  return (
    <div className="border-t border-slate-200 bg-white p-3.5">
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onSaveOrder}
          disabled={disabled || isSaving}
          className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-blue-600 shadow-2xs transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <Save size={14} strokeWidth={2} />
          <span className="truncate">{isSaving ? "Saving..." : (saveLabel || "Save")}</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 shadow-2xs transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <Percent size={14} strokeWidth={2} />
          <span>Discount</span>
        </button>

        <button
          type="button"
          onClick={onClearOrder}
          disabled={disabled}
          className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-200/70 bg-red-50/50 text-xs font-bold text-red-600 shadow-2xs transition-all duration-200 hover:bg-red-100/70 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <Trash2 size={14} strokeWidth={2} />
          <span>Clear</span>
        </button>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onPayOrder}
        className="mt-2.5 flex h-13 w-full items-center justify-between rounded-lg bg-blue-600 px-4 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-500/30 active:scale-[0.98] active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <CreditCard size={18} strokeWidth={2} />
          <span className="tracking-wide">PAY ORDER</span>
        </div>

        <div className="rounded-md bg-blue-700/50 px-2.5 py-1 font-mono text-xs font-bold tabular-nums text-white">
          Rp {formatPrice(total)}
        </div>
      </button>
    </div>
  )
}

