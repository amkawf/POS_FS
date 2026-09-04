import { useEffect, useState } from "react"
import { Badge, Button, Modal, NumberInput } from "@mantine/core"
import { Banknote, CheckCircle2, CreditCard, QrCode } from "lucide-react"

type PaymentModalProps = {
  opened: boolean
  onClose: () => void
  totalAmount: number
  orderNumber?: string
  itemsCount: number
  onConfirmPayment: (
    paymentMethod: "CASH" | "QRIS",
    amountPaid: number,
  ) => Promise<void>
  isProcessing: boolean
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
}

export function PaymentModal({
  opened,
  onClose,
  totalAmount,
  orderNumber,
  itemsCount,
  onConfirmPayment,
  isProcessing,
}: PaymentModalProps) {
  const [method, setMethod] = useState<"CASH" | "QRIS">("CASH")
  const [cashTendered, setCashTendered] = useState<number>(totalAmount)

  // Sync cash tendered when modal opens or totalAmount changes
  useEffect(() => {
    if (opened) {
      setCashTendered(totalAmount)
      setMethod("CASH")
    }
  }, [opened, totalAmount])

  const change = (cashTendered || 0) - totalAmount
  const isCashValid = (cashTendered || 0) >= totalAmount

  // Quick suggestion amounts
  const getQuickAmounts = (total: number) => {
    const list: number[] = [total]

    const thresholds = [10000, 20000, 50000, 100000, 200000, 500000]
    for (const t of thresholds) {
      if (t > total && !list.includes(t) && list.length < 5) {
        list.push(t)
      }
    }

    return list
  }

  const quickAmounts = getQuickAmounts(totalAmount)

  const handlePay = async () => {
    if (method === "CASH") {
      if (!isCashValid) return
      await onConfirmPayment("CASH", cashTendered)
    } else {
      await onConfirmPayment("QRIS", totalAmount)
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <CreditCard size={18} className="text-blue-600" />
          <span className="font-extrabold text-sm uppercase tracking-wide">
            Checkout & Pembayaran
          </span>
        </div>
      }
      size="md"
      centered
      styles={{
        header: {
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: 12,
        },
        body: {
          paddingTop: 16,
        },
      }}
    >
      {/* ORDER SUMMARY BANNER */}
      <div className="mb-4 rounded-lg bg-slate-900 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-300">
            {orderNumber ? (
              <span>Order: <span className="font-bold text-white">{orderNumber}</span></span>
            ) : (
              <span>New Order ({itemsCount} items)</span>
            )}
          </div>
          <Badge size="xs" color="blue" variant="filled">
            Ready to Pay
          </Badge>
        </div>

        <div className="mt-2 text-2xl font-black tracking-tight text-white">
          Rp {formatPrice(totalAmount)}
        </div>
        <div className="text-[11px] text-slate-400">Total tagihan termasuk pajak & service</div>
      </div>

      {/* METHOD TABS */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMethod("CASH")}
          className={`flex items-center justify-center gap-2 rounded-lg border p-3 font-bold text-xs transition-all ${
            method === "CASH"
              ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-xs"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Banknote size={16} />
          TUNAI (CASH)
        </button>

        <button
          type="button"
          onClick={() => setMethod("QRIS")}
          className={`flex items-center justify-center gap-2 rounded-lg border p-3 font-bold text-xs transition-all ${
            method === "QRIS"
              ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-xs"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <QrCode size={16} />
          QRIS
        </button>
      </div>

      {/* CASH PAYMENT CONTENT */}
      {method === "CASH" && (
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
              Uang Diterima (Rp)
            </label>
            <NumberInput
              value={cashTendered}
              onChange={(val) => setCashTendered(typeof val === "number" ? val : 0)}
              thousandSeparator="."
              decimalSeparator=","
              min={0}
              size="md"
              styles={{
                input: {
                  fontWeight: 800,
                  fontSize: 18,
                  color: "#0f172a",
                },
              }}
            />
          </div>

          {/* QUICK CHIPS */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Pecahan Cepat
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setCashTendered(amt)}
                  className={`rounded border px-2.5 py-1 text-xs font-bold transition-all ${
                    cashTendered === amt
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {amt === totalAmount ? "Uang Pas" : `Rp ${formatPrice(amt)}`}
                </button>
              ))}
            </div>
          </div>

          {/* CHANGE CALCULATION */}
          <div
            className={`rounded-lg border p-3 transition-colors ${
              isCashValid
                ? "border-emerald-200 bg-emerald-50/60"
                : "border-amber-200 bg-amber-50/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold ${
                  isCashValid ? "text-emerald-800" : "text-amber-800"
                }`}
              >
                {isCashValid ? "Uang Kembalian:" : "Uang Kurang:"}
              </span>
              <span
                className={`text-lg font-black ${
                  isCashValid ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                Rp {formatPrice(Math.abs(change))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* QRIS PAYMENT CONTENT */}
      {method === "QRIS" && (
        <div className="space-y-3 py-2 text-center">
          <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-xl border-2 border-dashed border-blue-400 bg-blue-50/30 p-4">
            <div className="space-y-2">
              <QrCode size={90} className="mx-auto text-slate-800 opacity-90" />
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                Scan QRIS Dinamis
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Mendukung GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, dan semua aplikasi QRIS.
          </div>
        </div>
      )}

      {/* ACTIONS */}
      <div className="mt-5 flex gap-2 border-t border-slate-100 pt-3">
        <Button
          variant="default"
          onClick={onClose}
          disabled={isProcessing}
          styles={{ root: { fontWeight: 700 } }}
        >
          Batal
        </Button>

        <Button
          fullWidth
          color="blue"
          disabled={method === "CASH" && !isCashValid}
          loading={isProcessing}
          onClick={handlePay}
          leftSection={<CheckCircle2 size={16} />}
          styles={{
            root: {
              fontWeight: 800,
              letterSpacing: "0.02em",
            },
          }}
        >
          {method === "CASH"
            ? `Bayar Tunai (Rp ${formatPrice(cashTendered)})`
            : "Simulasi Bayar QRIS Sukses"}
        </Button>
      </div>
    </Modal>
  )
}
