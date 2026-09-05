import { Button } from "@mantine/core"
import { BarChart3, Printer } from "lucide-react"
import type { OrderResponse } from "../api/client"

type ReportsViewProps = {
  completedOrders: OrderResponse[]
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID").format(amount)
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
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart3 className="text-blue-600" size={24} />
            <span>Laporan Shift Kasir</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-500">Total Penjualan Kotor (Gross)</div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            Rp {formatRupiah(totalGross)}
          </div>
          <div className="mt-1 text-[11px] font-semibold text-slate-400">
            {completedOrders.length} struk tercetak
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-500">Dasar Pengenaan Pajak (Subtotal)</div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            Rp {formatRupiah(totalSubtotal)}
          </div>
          <div className="mt-1 text-[11px] font-semibold text-slate-400">
            Penjualan bersih sebelum PB1
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-500">Pajak Resto (PB1 10%)</div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            Rp {formatRupiah(totalTax)}
          </div>
          <div className="mt-1 text-[11px] font-semibold text-slate-400">
            Kewajiban pajak daerah
          </div>
        </div>
      </div>

      {/* DETAILED BREAKDOWN */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-xs max-w-2xl">
        <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
          Rincian Finansial Shift
        </h2>

        <div className="divide-y divide-slate-100 text-xs mt-2">
          <div className="flex justify-between py-2.5">
            <span className="text-slate-600">Modal Kas Awal (Float)</span>
            <span className="font-bold text-slate-900">Rp 500.000</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-slate-600">Total Penerimaan Penjualan</span>
            <span className="font-bold text-slate-900">Rp {formatRupiah(totalGross)}</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-slate-600">Total Pajak PB1 (10%)</span>
            <span className="font-bold text-slate-900">Rp {formatRupiah(totalTax)}</span>
          </div>
          <div className="flex justify-between py-3 font-extrabold text-sm border-t border-slate-200">
            <span className="text-slate-900">Estimasi Uang Fisik Kasir</span>
            <span className="text-blue-600">Rp {formatRupiah(500000 + totalGross)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
