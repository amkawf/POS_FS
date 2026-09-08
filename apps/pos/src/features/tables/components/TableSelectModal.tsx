import { Modal } from "@mantine/core"
import { Check, CreditCard, Table2, Users } from "lucide-react"
import type { Table } from "../../../types/pos"
import type { OrderResponse } from "../../../api"
import { formatPrice } from "../../../utils/currency"

type TableSelectModalProps = {
  opened: boolean
  onClose: () => void
  tables: Table[]
  openOrders?: OrderResponse[]
  selectedTableId: string | null
  onSelectTable: (table: Table) => void
  onSelectOrder?: (order: OrderResponse) => void
  onClearTable: () => void
}

export function TableSelectModal({
  opened,
  onClose,
  tables,
  openOrders = [],
  selectedTableId,
  onSelectTable,
  onSelectOrder,
  onClearTable,
}: TableSelectModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
          <Table2 size={18} strokeWidth={2} className="text-blue-600" />
          <span>Pilih Meja Restoran (Dine-In)</span>
        </div>
      }
      size="lg"
      centered
      radius="lg"
      styles={{
        content: { borderRadius: 12 },
        header: {
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: 12,
        },
      }}
    >
      <div className="py-2">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-medium text-slate-500">
            {tables.length} meja terdaftar • Pilih meja kosong atau muat pesanan aktif
          </div>

          {selectedTableId && (
            <button
              type="button"
              onClick={() => {
                onClearTable()
                onClose()
              }}
              className="rounded-lg px-2.5 py-1 text-xs font-bold text-red-600 transition-all duration-200 hover:bg-red-50 active:scale-[0.98] cursor-pointer"
            >
              Hapus Pilihan Meja
            </button>
          )}
        </div>

        <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
          {tables.map((tbl) => {
            const isSelected = tbl.id === selectedTableId
            const isAvailable = tbl.status === "AVAILABLE"
            const isOccupied = tbl.status === "OCCUPIED"
            const activeOrder = openOrders.find((o) => o.table_id === tbl.id)

            return (
              <div
                key={tbl.id}
                className={`flex flex-col justify-between rounded-xl border p-3.5 text-center transition-all duration-200 ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs"
                    : isOccupied
                    ? "border-amber-200 bg-amber-50/40"
                    : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs"
                }`}
              >
                <div className="flex w-full items-start justify-between">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      isAvailable
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                        : isOccupied
                        ? "border border-amber-200 bg-amber-50 text-amber-700"
                        : "border border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    {isAvailable ? "Tersedia" : isOccupied ? "Terisi" : tbl.status}
                  </span>

                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white shadow-xs">
                      <Check size={12} strokeWidth={2.5} />
                    </span>
                  )}
                </div>

                <div className="my-2">
                  <div className="text-base font-black text-slate-900">
                    {tbl.table_number}
                  </div>
                  <div className="mt-0.5 flex items-center justify-center gap-1 text-[11px] font-medium text-slate-400">
                    <Users size={12} strokeWidth={2} />
                    <span>{tbl.capacity} Kursi</span>
                  </div>

                  {isOccupied && activeOrder && (
                    <div className="mt-2 rounded-md bg-amber-100/70 p-1.5 text-left text-[10px]">
                      <div className="font-bold text-amber-900 truncate">
                        #{activeOrder.order_number}
                      </div>
                      <div className="font-mono font-extrabold text-slate-900">
                        Rp {formatPrice(activeOrder.total_amount)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 mt-1 flex flex-col gap-1.5">
                  {isOccupied && activeOrder && onSelectOrder ? (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectOrder(activeOrder)
                        onClose()
                      }}
                      className="flex h-7 w-full items-center justify-center gap-1 rounded-md bg-blue-600 px-2 text-[10px] font-bold text-white shadow-2xs transition-all hover:bg-blue-700 active:scale-[0.98] cursor-pointer"
                    >
                      <CreditCard size={12} />
                      <span>Muat Pesanan</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTable(tbl)
                        onClose()
                      }}
                      className={`h-7 w-full rounded-md px-2 text-[10px] font-bold transition-all active:scale-[0.98] cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "border border-slate-200 bg-white text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      {isSelected ? "Terpilih" : "Pilih Meja Ini"}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {tables.length === 0 && (
          <div className="py-8 text-center text-xs font-semibold text-slate-400">
            Belum ada data meja di toko ini.
          </div>
        )}
      </div>
    </Modal>
  )
}

