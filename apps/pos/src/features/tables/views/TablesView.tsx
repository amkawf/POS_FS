import { useState } from "react"
import {
  Check,
  CreditCard,
  PlusCircle,
  RotateCcw,
  Search,
  Table2,
  Users,
} from "lucide-react"
import type { Table } from "../../../types/pos"
import type { OrderResponse } from "../../../api"
import { formatPrice } from "../../../utils/currency"

type TablesViewProps = {
  tables: Table[]
  openOrders?: OrderResponse[]
  selectedTableId: string | null
  onSelectTableForOrder: (table: Table) => void
  onSelectOrder?: (order: OrderResponse) => void
  onReleaseTable?: (tableId: string) => Promise<void>
}

export function TablesView({
  tables,
  openOrders = [],
  selectedTableId,
  onSelectTableForOrder,
  onSelectOrder,
  onReleaseTable,
}: TablesViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [releasingTableId, setReleasingTableId] = useState<string | null>(null)

  const availableCount = tables.filter((t) => t.status === "AVAILABLE").length
  const occupiedCount = tables.filter((t) => t.status === "OCCUPIED").length

  const filteredTables = tables.filter((t) => {
    if (filterStatus !== "ALL" && t.status !== filterStatus) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return t.table_number.toLowerCase().includes(q)
    }
    return true
  })

  const handleRelease = async (tableId: string, tableNumber: string) => {
    if (!onReleaseTable) return
    const confirmed = window.confirm(
      `Kosongkan status meja ${tableNumber} menjadi TERSEDIA?`,
    )
    if (!confirmed) return

    setReleasingTableId(tableId)
    try {
      await onReleaseTable(tableId)
    } finally {
      setReleasingTableId(null)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
            <Table2 className="text-blue-600" size={24} />
            <span>Manajemen Meja & Open Table</span>
          </h1>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Pantau status ketersediaan meja, buka pesanan baru (Open Table), atau muat pesanan meja ke kasir.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{availableCount} Tersedia</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{occupiedCount} Terisi</span>
          </div>
        </div>
      </div>

      {/* TOOLBAR: FILTER TABS & SEARCH */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: "ALL", label: `Semua (${tables.length})` },
            { id: "AVAILABLE", label: `Tersedia (${availableCount})` },
            { id: "OCCUPIED", label: `Terisi (${occupiedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`whitespace-nowrap h-8.5 rounded-lg px-3.5 text-xs font-bold transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari nomor meja..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8.5 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-2xs outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* TABLES GRID */}
      <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredTables.map((tbl) => {
          const isSelected = tbl.id === selectedTableId
          const isOccupied = tbl.status === "OCCUPIED"
          const isAvailable = tbl.status === "AVAILABLE"

          // Find active open order for this table
          const activeOrder = openOrders.find((o) => o.table_id === tbl.id)

          return (
            <div
              key={tbl.id}
              className={`group flex flex-col justify-between rounded-xl border bg-white p-4 sm:p-5 shadow-xs transition-all duration-200 ${
                isSelected
                  ? "border-blue-600 ring-2 ring-blue-500/20 shadow-blue-500/5"
                  : isOccupied
                  ? "border-amber-200/80 bg-linear-to-b from-white to-amber-50/20 hover:border-amber-300"
                  : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <div>
                {/* Top: Table Number & Status Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                      {tbl.table_number}
                    </span>
                    {isSelected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xs">
                        <Check size={12} strokeWidth={2.5} />
                      </span>
                    )}
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                      isAvailable
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                        : isOccupied
                        ? "border border-amber-200 bg-amber-50 text-amber-700"
                        : "border border-slate-200 bg-slate-100 text-slate-600"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isAvailable
                          ? "bg-emerald-500"
                          : isOccupied
                          ? "bg-amber-500 animate-pulse"
                          : "bg-slate-400"
                      }`}
                    />
                    {isAvailable ? "Tersedia" : isOccupied ? "Terisi" : tbl.status}
                  </span>
                </div>

                {/* Capacity */}
                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Users size={14} className="text-slate-400" />
                  <span>Kapasitas: {tbl.capacity} Orang</span>
                </div>

                {/* Active Order Card for Occupied Tables */}
                {isOccupied && (
                  <div className="mt-3.5 rounded-lg border border-amber-200/90 bg-amber-50/70 p-2.5">
                    {activeOrder ? (
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                          <span className="truncate">Order #{activeOrder.order_number}</span>
                          <span className="shrink-0 rounded bg-amber-200/70 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-amber-800">
                            Aktif
                          </span>
                        </div>

                        <div className="mt-2 flex items-baseline justify-between border-t border-amber-200/60 pt-1.5">
                          <span className="text-[10px] font-semibold text-amber-700">
                            Total Tagihan:
                          </span>
                          <span className="font-mono text-xs font-extrabold tabular-nums text-slate-900">
                            Rp {formatPrice(activeOrder.total_amount)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] font-semibold text-amber-800">
                        Meja ditandai terisi (menunggu pesanan).
                      </div>
                    )}
                  </div>
                )}

                {/* Available table indicator */}
                {isAvailable && (
                  <div className="mt-3.5 rounded-lg border border-slate-100 bg-slate-50/60 p-2 text-center text-[11px] font-medium text-slate-400">
                    Meja kosong, siap untuk pesanan baru.
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-4 flex flex-col gap-2 pt-2">
                {isOccupied ? (
                  <div className="flex items-center gap-2">
                    {activeOrder && onSelectOrder ? (
                      <button
                        type="button"
                        onClick={() => onSelectOrder(activeOrder)}
                        className="flex h-8.5 flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-extrabold text-white shadow-xs transition-all duration-200 hover:bg-blue-700 active:scale-[0.98] cursor-pointer"
                      >
                        <CreditCard size={14} />
                        <span>Buka Kasir (Bayar)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectTableForOrder(tbl)}
                        className="flex h-8.5 flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-extrabold text-white shadow-xs transition-all duration-200 hover:bg-blue-700 active:scale-[0.98] cursor-pointer"
                      >
                        <PlusCircle size={14} />
                        <span>Input Pesanan</span>
                      </button>
                    )}

                    {onReleaseTable && (
                      <button
                        type="button"
                        title="Kosongkan Meja"
                        disabled={releasingTableId === tbl.id}
                        onClick={() => handleRelease(tbl.id, tbl.table_number)}
                        className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                      >
                        <RotateCcw size={13} />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectTableForOrder(tbl)}
                    className="flex h-8.5 w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-extrabold text-white shadow-xs transition-all duration-200 hover:bg-blue-700 active:scale-[0.98] cursor-pointer"
                  >
                    <PlusCircle size={14} />
                    <span>Buka Meja Baru</span>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filteredTables.length === 0 && (
        <div className="py-16 text-center text-sm font-semibold text-slate-400">
          Tidak ada meja yang sesuai pencarian atau filter.
        </div>
      )}
    </div>
  )
}

