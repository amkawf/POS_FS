import { Modal } from "@mantine/core"
import { CheckCircle, Printer, ShoppingBag } from "lucide-react"
import type { OrderItem } from "../../../types/pos"
import { formatPrice } from "../../../utils/currency"

type ReceiptModalProps = {
  opened: boolean
  onClose: () => void
  orderNumber: string
  orderType: string
  tableNumber?: string
  items: OrderItem[]
  subtotal: number
  totalAmount: number
  paymentMethod: string
  amountPaid: number
  change: number
  dateStr?: string
}

export function ReceiptModal({
  opened,
  onClose,
  orderNumber,
  orderType,
  tableNumber,
  items,
  subtotal,
  totalAmount,
  paymentMethod,
  amountPaid,
  change,
  dateStr = new Date().toLocaleString("id-ID"),
}: ReceiptModalProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 font-extrabold text-sm text-emerald-600">
          <CheckCircle size={18} strokeWidth={2} />
          <span>Transaksi Selesai</span>
        </div>
      }
      size="sm"
      centered
      radius="lg"
      styles={{
        content: {
          borderRadius: 12,
        },
        header: {
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: 10,
        },
      }}
    >
      {/* THERMAL RECEIPT PREVIEW */}
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4 font-mono text-xs tabular-nums text-slate-800">
        <div className="border-b border-dashed border-slate-300 pb-3 text-center">
          <div className="text-sm font-bold uppercase tracking-wider text-slate-900">
            POS RESTAURANT & CAFE
          </div>
          <div className="text-[10px] text-slate-500">
            Jl. Kopi Harapan No. 12, Malang
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            {dateStr}
          </div>
        </div>

        <div className="space-y-0.5 border-b border-dashed border-slate-300 py-2 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-500">Order:</span>
            <span className="font-bold text-slate-900">{orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Type:</span>
            <span className="font-bold text-slate-900">{orderType}</span>
          </div>
          {tableNumber && (
            <div className="flex justify-between">
              <span className="text-slate-500">Table:</span>
              <span className="font-bold text-blue-600">{tableNumber}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Cashier:</span>
            <span>POS Terminal 01</span>
          </div>
        </div>

        {/* ITEMS LIST */}
        <div className="space-y-1.5 border-b border-dashed border-slate-300 py-2 text-[11px]">
          {items.map((it, idx) => (
            <div key={idx}>
              <div className="font-bold text-slate-900">{it.name}</div>
              {it.notes && (
                <div className="text-[10px] italic text-slate-500">
                  * {it.notes}
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>
                  {it.qty} x Rp {formatPrice(it.price)}
                </span>
                <span className="font-bold text-slate-900">
                  Rp {formatPrice(it.qty * it.price)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* TOTALS */}
        <div className="space-y-1 border-b border-dashed border-slate-300 py-2 text-[11px]">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span>Rp {formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between pt-0.5 text-xs font-black text-slate-900">
            <span>TOTAL:</span>
            <span>Rp {formatPrice(totalAmount)}</span>
          </div>
        </div>

        {/* PAYMENT INFO */}
        <div className="space-y-1 pt-2 text-[11px]">
          <div className="flex justify-between text-slate-600">
            <span>Metode:</span>
            <span className="font-bold uppercase text-slate-900">{paymentMethod}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Bayar:</span>
            <span>Rp {formatPrice(amountPaid)}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-900">
            <span>Kembalian:</span>
            <span>Rp {formatPrice(change)}</span>
          </div>
        </div>

        <div className="pt-4 text-center text-[10px] text-slate-400">
          *** Terima Kasih Atas Kunjungan Anda ***
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={handlePrint}
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 transition-all duration-200 hover:bg-slate-50 active:scale-[0.98] cursor-pointer"
        >
          <Printer size={15} strokeWidth={2} />
          <span>Cetak Struk</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 text-xs font-extrabold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:bg-blue-700 active:scale-[0.98] cursor-pointer"
        >
          <ShoppingBag size={15} strokeWidth={2} />
          <span>Pesanan Baru</span>
        </button>
      </div>
    </Modal>
  )
}

