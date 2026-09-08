import { Button } from "@mantine/core"
import { BarChart3, Printer } from "lucide-react"
import type { OrderResponse } from "../../../api"
import { formatRupiah } from "../../../utils/currency"

type ReportsViewProps = {
  completedOrders: OrderResponse[]
}

export function ReportsView({ completedOrders }: ReportsViewProps) {
  const totalGross = completedOrders.reduce(
    (sum, o) => sum + (o.total_amount || 0),
    0,
  )
  const totalSubtotal = completedOrders.reduce(
    (sum, o) => sum + (o.subtotal || 0),
    0,
  )
  const totalTax = completedOrders.reduce(
    (sum, o) => sum + (o.tax_amount || 0),
    0,
  )

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

      {/* DETAILED BREAKDOWN */}
      <div className="mt-6 sm:mt-8 max-w-2xl rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <h2 className="border-b border-slate-100 pb-3 text-sm font-extrabold text-slate-900">
          Rincian Finansial Shift
        </h2>

        <div className="mt-2 divide-y divide-slate-100 text-xs">
          <div className="flex justify-between py-2.5">
            <span className="text-slate-600">Modal Kas Awal (Float)</span>
            <span className="font-bold text-slate-900">Rp 500.000</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-slate-600">Total Penerimaan Penjualan</span>
            <span className="font-bold text-slate-900">{formatRupiah(totalGross)}</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-slate-600">Total Kas di Drawer (Estimasi)</span>
            <span className="font-mono text-sm font-extrabold text-blue-600">
              {formatRupiah(500000 + totalGross)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

