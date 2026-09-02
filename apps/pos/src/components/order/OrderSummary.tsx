import { ReceiptText } from "lucide-react"
import { Divider } from "@mantine/core"

type OrderSummaryProps = {
  subtotal: number
  tax: number
  total: number
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
}

export function OrderSummary({
  subtotal,
  tax,
  total,
}: OrderSummaryProps) {
  return (
    <div className="border-t border-slate-200 bg-slate-50 p-3">
      <div className="mb-3 flex items-center gap-2">
        <ReceiptText
          size={15}
          className="text-blue-600"
        />

        <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
          Order Summary
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-500">
            Subtotal
          </span>

          <span className="font-bold text-slate-900">
            Rp {formatPrice(subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-500">
            Tax 10%
          </span>

          <span className="font-bold text-slate-900">
            Rp {formatPrice(tax)}
          </span>
        </div>
      </div>

      <Divider className="my-3" />

      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] font-extrabold uppercase text-slate-500">
            Total Due
          </div>

          <div className="mt-1 text-2xl font-extrabold tracking-tight text-blue-600">
            Rp {formatPrice(total)}
          </div>
        </div>

        <div className="text-right text-[9px] font-bold uppercase text-slate-400">
          IDR
          <br />
          Inclusive
        </div>
      </div>
    </div>
  )
}