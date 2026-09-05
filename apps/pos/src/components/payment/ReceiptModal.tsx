import { Button, Modal } from "@mantine/core"
import { CheckCircle, Printer, ShoppingBag } from "lucide-react"
import type { OrderItem } from "../../types/pos"

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

function formatPrice(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
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
        <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-sm">
          <CheckCircle size={18} />
          <span>Transaksi Selesai</span>
        </div>
      }
      size="sm"
      centered
      styles={{
        header: {
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: 10,
        },
      }}
    >
      {/* THERMAL RECEIPT PREVIEW */}
      <div className="rounded border border-dashed border-slate-300 bg-slate-50/50 p-4 font-mono text-xs text-slate-800">
        <div className="text-center pb-3 border-b border-dashed border-slate-300">
          <div className="font-bold text-sm uppercase tracking-wider">
            POS RESTAURANT & CAFE
          </div>
          <div className="text-[10px] text-slate-500">
            Jl. Kopi Harapan No. 12, Malang
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {dateStr}
          </div>
        </div>

        <div className="py-2 text-[11px] border-b border-dashed border-slate-300 space-y-0.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Order:</span>
            <span className="font-bold">{orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Type:</span>
            <span className="font-bold">{orderType}</span>
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
        <div className="py-2 border-b border-dashed border-slate-300 space-y-1.5 text-[11px]">
          {items.map((it, idx) => (
            <div key={idx}>
              <div className="font-bold">{it.name}</div>
              <div className="flex justify-between text-slate-600">
                <span>
                  {it.qty} x Rp {formatPrice(it.price)}
                </span>
                <span className="font-bold">
                  Rp {formatPrice(it.qty * it.price)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* TOTALS */}
        <div className="py-2 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span>Rp {formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between font-extrabold text-xs text-slate-900 pt-0.5">
            <span>TOTAL:</span>
            <span>Rp {formatPrice(totalAmount)}</span>
          </div>
        </div>

        {/* PAYMENT INFO */}
        <div className="pt-2 text-[11px] space-y-1">
          <div className="flex justify-between text-slate-600">
            <span>Metode:</span>
            <span className="font-bold uppercase">{paymentMethod}</span>
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

        <div className="text-center pt-4 text-[10px] text-slate-400">
          *** Terima Kasih Atas Kunjungan Anda ***
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-4 flex gap-2">
        <Button
          variant="default"
          fullWidth
          size="sm"
          leftSection={<Printer size={15} />}
          onClick={handlePrint}
          styles={{ root: { fontWeight: 700 } }}
        >
          Cetak Struk
        </Button>

        <Button
          fullWidth
          size="sm"
          color="blue"
          leftSection={<ShoppingBag size={15} />}
          onClick={onClose}
          styles={{ root: { fontWeight: 800 } }}
        >
          Pesanan Baru
        </Button>
      </div>
    </Modal>
  )
}

