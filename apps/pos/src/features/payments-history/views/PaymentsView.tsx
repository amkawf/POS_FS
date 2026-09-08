import { Badge, Button } from "@mantine/core"
import { CheckCircle2, CreditCard, Printer } from "lucide-react"
import type { OrderResponse } from "../../../api"
import type { Table } from "../../../types/pos"
import { formatRupiah } from "../../../utils/currency"

type PaymentsViewProps = {
  completedOrders: OrderResponse[]
  tables: Table[]
  onOpenReceipt: (order: OrderResponse) => void
}

export function PaymentsView({
  completedOrders,
  tables,
  onOpenReceipt,
}: PaymentsViewProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
            <CreditCard className="text-blue-600" size={24} />
            <span>Riwayat Pembayaran & Transaksi</span>
          </h1>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Daftar transaksi yang telah lunas dibayar di terminal kasir ini.
          </p>
        </div>

        <Badge size="md" color="green" variant="light">
          {completedOrders.length} Transaksi Selesai
        </Badge>
      </div>

      {/* ORDERS LIST */}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {completedOrders.length === 0 ? (
          <div className="py-16 text-center text-xs font-semibold text-slate-400">
            Belum ada transaksi pembayaran yang selesai hari ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">No. Order</th>
                  <th className="px-5 py-3">Waktu</th>
                  <th className="px-5 py-3">Tipe / Meja</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Total Pembayaran</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedOrders.map((ord) => {
                  const tableName = ord.table_id
                    ? tables.find((t) => t.id === ord.table_id)?.table_number ?? "Meja ?"
                    : "Takeaway"

                  return (
                    <tr key={ord.id} className="transition-all hover:bg-slate-50/70">
                      <td className="px-5 py-3.5 font-extrabold text-slate-900">
                        #{ord.order_number}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-500">
                        {new Date(ord.opened_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-800">{ord.order_type}</div>
                        <div className="text-[10px] font-semibold text-blue-600">
                          {tableName}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge size="xs" color="green" leftSection={<CheckCircle2 size={10} />}>
                          LUNAS
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right font-extrabold text-slate-900">
                        {formatRupiah(ord.total_amount)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          size="compact-xs"
                          variant="light"
                          color="blue"
                          leftSection={<Printer size={13} />}
                          onClick={() => onOpenReceipt(ord)}
                          styles={{ root: { fontWeight: 700 } }}
                        >
                          Lihat Struk
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

