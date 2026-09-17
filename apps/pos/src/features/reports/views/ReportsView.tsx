import { Button } from "@mantine/core"
import { BarChart3, Printer } from "lucide-react"
import type { OrderResponse } from "../../../api"
import { formatRupiah } from "../../../utils/currency"
import type { CashierShift } from "../../../types/pos"

type ReportsViewProps = {
  completedOrders: OrderResponse[]
  activeShift?: CashierShift | null             
  getCashierName: (userId?: string) => string  
}

// Helper: Ekstrak nama metode bayar dari catatan order secara dinamis
function getPaymentMethod(notes?: string): string {
  if (!notes) return "LAINNYA"
  if (notes.includes("Payment: ")) {
    return notes.split("Payment: ")[1].split(" |")[0].trim().toUpperCase()
  }
  return "LAINNYA"
}

export function ReportsView({ completedOrders, activeShift, getCashierName }: ReportsViewProps) {
  // 1. Total Penjualan Kotor (Gross) & Pajak
  const totalGross = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
  const totalSubtotal = completedOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0)
  const totalTax = completedOrders.reduce((sum, o) => sum + (o.tax_amount || 0), 0)

    // 2. Rekap DINAMIS Semua Metode Pembayaran yang Digunakan
  const paymentStats = completedOrders.reduce<
    Record<string, { method: string; count: number; total: number }>
  >((acc, ord) => {
    const method = getPaymentMethod(ord.notes)
    if (!acc[method]) {
      acc[method] = { method, count: 0, total: 0 }
    }
    acc[method].count += 1
    acc[method].total += ord.total_amount || 0
    return acc
  }, {})

  const paymentMethodList = Object.values(paymentStats)

  // Uang kas fisik laci (HANYA mengambil yang metodenya 'CASH')
  const totalCash = paymentStats["CASH"]?.total ?? 0

  // Total uang non-tunai (semua metode selain CASH dijumlahkan otomatis!)
  const totalNonCash = paymentMethodList
    .filter((p) => p.method !== "CASH")
    .reduce((sum, p) => sum + p.total, 0)

    // 3. Rekonsiliasi Laci Nyata (Rumus Pilihan B!)
  const startingCash = activeShift?.starting_cash ?? 0
  const expectedDrawerCash = startingCash + totalCash

    // 4. REKAP PERFORMA PER KASIR (Memanfaatkan Audit Trail)
  const cashierStats = completedOrders.reduce<
    Record<string, { name: string; count: number; total: number }>
  >((acc, ord) => {
    const cashierId = ord.created_by || "UNKNOWN"
    const cashierName = getCashierName(ord.created_by)
    if (!acc[cashierId]) {
      acc[cashierId] = { name: cashierName, count: 0, total: 0 }
    }
    acc[cashierId].count += 1
    acc[cashierId].total += ord.total_amount || 0
    return acc
  }, {})
  
  const cashierPerformanceList = Object.values(cashierStats).sort((a, b) => b.total - a.total)

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
            <BarChart3 className="text-blue-600" size={24} />
            <span>Laporan Shift Kasir</span>
          </h1>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Rekapitulasi penjualan shift aktif dan perhitungan kas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="outline"
            color="gray"
            leftSection={<Printer size={14} />}
            onClick={() => window.print()}
          >
            Cetak Rekap Shift
          </Button>
        </div>
      </div>

      {/* SHIFT SUMMARY */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-500">Total Penjualan Kotor (Gross)</div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900">
            {formatRupiah(totalGross)}
          </div>
          <div className="mt-1 text-[11px] font-semibold text-slate-400">
            {completedOrders.length} struk tercetak
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-500">Dasar Pengenaan Pajak (Subtotal)</div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900">
            {formatRupiah(totalSubtotal)}
          </div>
          <div className="mt-1 text-[11px] font-semibold text-slate-400">
            Penjualan bersih sebelum PB1
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-500">Pajak Resto (PB1 10%)</div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900">
            {formatRupiah(totalTax)}
          </div>
          <div className="mt-1 text-[11px] font-semibold text-slate-400">
            Kewajiban pajak daerah
          </div>
        </div>
      </div>

            {/* KARTU RINCIAN PEMBAYARAN & KAS LACI */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* KIRI: REKONSILIASI KAS LACI (CASH DRAWER) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="border-b border-slate-100 pb-3 text-sm font-extrabold text-slate-900">
            Perhitungan Kas Laci Fisik (Cash Drawer)
          </h2>
          <div className="mt-3 divide-y divide-slate-100 text-xs">
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Modal Kas Awal:</span>
              <span className="font-mono font-bold text-slate-700">{formatRupiah(startingCash)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Penerimaan Tunai (CASH):</span>
              <span className="font-mono font-bold text-emerald-600">+{formatRupiah(totalCash)}</span>
            </div>
            <div className="flex justify-between py-2.5 font-extrabold text-slate-900 border-t border-slate-200">
              <span>Uang Fisik Seharusnya di Laci:</span>
              <span className="font-mono text-sm text-blue-600">{formatRupiah(expectedDrawerCash)}</span>
            </div>
            <div className="flex justify-between py-2 text-slate-500">
              <span>Total Non-Tunai (QRIS / Bank):</span>
              <span className="font-mono font-semibold text-slate-600">{formatRupiah(totalNonCash)}</span>
            </div>
          </div>
        </div>

        {/* KANAN: REKAP PER METODE BAYAR */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="border-b border-slate-100 pb-3 text-sm font-extrabold text-slate-900">
            Rincian Metode Pembayaran
          </h2>
          <div className="mt-3 divide-y divide-slate-100 text-xs">
            {paymentMethodList.map((item) => (
              <div key={item.method} className="flex justify-between py-2">
                <span className="font-bold text-slate-700">{item.method}</span>
                <span className="font-mono font-semibold text-slate-900">
                  {formatRupiah(item.total)} ({item.count} nota)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABEL REKAP PERFORMA KASIR (AUDIT TRAIL) */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-extrabold text-slate-900">
            Performa Penjualan Staf Kasir (Shift Ini)
          </h2>
          <p className="text-[11px] font-medium text-slate-400">
            Daftar transaksi yang diproses oleh masing-masing staf kasir.
          </p>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3">Nama Kasir</th>
              <th className="px-5 py-3 text-center">Jumlah Transaksi</th>
              <th className="px-5 py-3 text-right">Kontribusi Omset</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cashierPerformanceList.map((cashier) => (
              <tr key={cashier.name} className="hover:bg-slate-50/50">
                <td className="px-5 py-3.5 font-bold text-slate-800">{cashier.name}</td>
                <td className="px-5 py-3.5 text-center font-semibold text-slate-600">
                  {cashier.count} transaksi
                </td>
                <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900">
                  {formatRupiah(cashier.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

