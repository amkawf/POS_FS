import { ReceiptText } from "lucide-react"
import { formatPrice } from "../../../utils/currency"

type OrderSummaryProps = {
  subtotal: number
  tax: number
  total: number
}

export function OrderSummary({
  subtotal,
  tax,
  total,
}: OrderSummaryProps) {
  return (
    <div className="border-t border-slate-200 bg-slate-50/70 p-3.5">
      <div className="mb-2.5 flex items-center gap-2">
        <ReceiptText
          size={15}
          strokeWidth={2}
          className="text-blue-600"
        />

        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
          Order Summary
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500">Subtotal</span>
          <span className="font-mono font-bold tabular-nums text-slate-900">
            Rp {formatPrice(subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500">Tax (10%)</span>
          <span className="font-mono font-bold tabular-nums text-slate-900">
            Rp {formatPrice(tax)}
          </span>
        </div>
      </div>

      <div className="my-2.5 border-t border-slate-200/80" />

      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            Total Due
          </div>
          <div className="text-[10px] font-medium text-slate-400">
            Termasuk PPN 10%
          </div>
        </div>

        <div className="font-mono text-base font-black tabular-nums text-slate-900">
          Rp {formatPrice(total)}
        </div>
      </div>
    </div>
  )
}

