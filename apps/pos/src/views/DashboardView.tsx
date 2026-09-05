import { Badge, Button } from "@mantine/core"
import {
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  Plus,
  ShoppingCart,
  Table2,
} from "lucide-react"
import type { OrderResponse } from "../api/client"
import type { Table } from "../types/pos"

type DashboardViewProps = {
  openOrders: OrderResponse[]
  completedOrders: OrderResponse[]
  tables: Table[]
  menuItemsCount: number
  onNavigateToOrders: () => void
  onSelectOrder: (order: OrderResponse) => void
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID").format(amount)
}

export function DashboardView({
  openOrders,
  completedOrders,
  tables,
  menuItemsCount,
  onNavigateToOrders,
  onSelectOrder,
}: DashboardViewProps) {
  const totalRevenue = completedOrders.reduce(
    (sum, ord) => sum + (ord.total_amount || 0),
    0,
  )

  const occupiedTablesCount = tables.filter((t) => t.status === "OCCUPIED").length

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
            Store Dashboard
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Ringkasan operasional dan performa kasir hari ini.
          </p>
        </div>

        <Button
          leftSection={<Plus size={16} />}
          color="blue"
          onClick={onNavigateToOrders}
          styles={{ root: { fontWeight: 700 } }}
        >
          Buat Pesanan Baru
        </Button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pendapatan Hari Ini</span>
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <DollarSign size={18} />
            </span>
          </div>
          <div className="mt-2 text-xl font-extrabold text-slate-900">
            Rp {formatRupiah(totalRevenue)}
          </div>
          <div className="mt-1 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <CheckCircle size={12} />
            <span>{completedOrders.length} transaksi selesai</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pesanan Aktif (Hold)</span>
            <span className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <ShoppingCart size={18} />
            </span>
          </div>
          <div className="mt-2 text-xl font-extrabold text-slate-900">
            {openOrders.length} Pesanan
          </div>
          <div className="mt-1 text-[11px] font-semibold text-slate-400">
            Menunggu pembayaran
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Status Meja</span>
            <span className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Table2 size={18} />
            </span>
          </div>
          <div className="mt-2 text-xl font-extrabold text-slate-900">
            {occupiedTablesCount} / {tables.length} Terisi
          </div>
          <div className="mt-1 text-[11px] font-semibold text-slate-400">
            {tables.length - occupiedTablesCount} meja tersedia
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Menu Aktif</span>
            <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <Package size={18} />
            </span>
          </div>
          <div className="mt-2 text-xl font-extrabold text-slate-900">
            {menuItemsCount} Produk
          </div>
          <div className="mt-1 text-[11px] font-semibold text-slate-400">
            Siap dijual di katalog
          </div>
        </div>
      </div>

      {/* RECENT ACTIVE ORDERS */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-blue-600" />
            <h2 className="text-sm font-extrabold text-slate-900">
              Antrean Pesanan Berjalan
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {openOrders.length} antrean
          </span>
        </div>

        {openOrders.length === 0 ? (
          <div className="py-8 text-center text-xs font-semibold text-slate-400">
            Tidak ada pesanan yang sedang di-hold.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 mt-2">
            {openOrders.map((ord) => (
              <div
                key={ord.id}
                className="flex items-center justify-between py-3 hover:bg-slate-50/70 px-2 rounded-lg transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-900">
                      #{ord.order_number}
                    </span>
                    <Badge size="xs" color="blue" variant="light">
                      {ord.order_type}
                    </Badge>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                    Subtotal: Rp {formatRupiah(ord.total_amount)}
                  </div>
                </div>

                <Button
                  size="compact-xs"
                  variant="light"
                  color="blue"
                  rightSection={<ArrowRight size={12} />}
                  onClick={() => onSelectOrder(ord)}
                >
                  Buka Kasir
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
