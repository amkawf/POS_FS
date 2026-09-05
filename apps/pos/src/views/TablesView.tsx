import { useState } from "react"
import { Badge, Button } from "@mantine/core"
import { Check, PlusCircle, Table2, Users } from "lucide-react"
import type { Table } from "../types/pos"

type TablesViewProps = {
  tables: Table[]
  selectedTableId: string | null
  onSelectTableForOrder: (table: Table) => void
}

export function TablesView({
  tables,
  selectedTableId,
  onSelectTableForOrder,
}: TablesViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>("ALL")

  const filteredTables = tables.filter((t) => {
    if (filterStatus === "ALL") return true
    return t.status === filterStatus
  })

  const availableCount = tables.filter((t) => t.status === "AVAILABLE").length
  const occupiedCount = tables.filter((t) => t.status === "OCCUPIED").length

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Table2 className="text-blue-600" size={24} />
            <span>Manajemen Meja & Dine-In</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Pantau status ketersediaan meja resto, kapasitas, dan buka pesanan langsung ke kasir.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge size="md" color="green" variant="light">
            {availableCount} Tersedia
          </Badge>
          <Badge size="md" color="orange" variant="light">
            {occupiedCount} Terisi
          </Badge>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="mt-6 flex gap-2">
        {["ALL", "AVAILABLE", "OCCUPIED"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilterStatus(st)}
            className={`h-8 rounded-md px-3 text-xs font-bold transition-all cursor-pointer ${
              filterStatus === st
                ? "bg-blue-600 text-white shadow-xs"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {st === "ALL" ? "Semua Meja" : st === "AVAILABLE" ? "Tersedia" : "Terisi"}
          </button>
        ))}
      </div>

      {/* TABLES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
        {filteredTables.map((tbl) => {
          const isSelected = tbl.id === selectedTableId
          const isAvailable = tbl.status === "AVAILABLE"

          return (
            <div
              key={tbl.id}
              className={`flex flex-col justify-between rounded-xl border bg-white p-5 shadow-xs transition-all ${
                isSelected
                  ? "border-blue-600 ring-2 ring-blue-500/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-lg font-black tracking-tight text-slate-900">
                  {tbl.table_number}
                </span>

                <Badge
                  size="sm"
                  color={
                    tbl.status === "AVAILABLE"
                      ? "green"
                      : tbl.status === "OCCUPIED"
                      ? "orange"
                      : "gray"
                  }
                  variant="light"
                >
                  {tbl.status}
                </Badge>
              </div>

              <div className="my-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Users size={15} className="text-slate-400" />
                <span>Kapasitas: {tbl.capacity} Orang</span>
              </div>

              <Button
                color="blue"
                variant={isAvailable ? "filled" : "light"}
                size="xs"
                leftSection={isSelected ? <Check size={14} /> : <PlusCircle size={14} />}
                onClick={() => onSelectTableForOrder(tbl)}
                styles={{ root: { fontWeight: 700 } }}
              >
                {isSelected ? "Buka Kasir (Meja Ini)" : "Pilih & Buka Pesanan"}
              </Button>
            </div>
          )
        })}
      </div>

      {filteredTables.length === 0 && (
        <div className="py-16 text-center text-sm font-semibold text-slate-400">
          Tidak ada meja yang sesuai filter status.
        </div>
      )}
    </div>
  )
}
