import { Badge, Button, Modal } from "@mantine/core"
import { Check, Table2, Users } from "lucide-react"
import type { Table } from "../../types/pos"

type TableSelectModalProps = {
  opened: boolean
  onClose: () => void
  tables: Table[]
  selectedTableId: string | null
  onSelectTable: (table: Table) => void
  onClearTable: () => void
}

export function TableSelectModal({
  opened,
  onClose,
  tables,
  selectedTableId,
  onSelectTable,
  onClearTable,
}: TableSelectModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
          <Table2 size={18} className="text-blue-600" />
          <span>Pilih Meja Restoran</span>
        </div>
      }
      size="md"
      centered
      styles={{
        header: {
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: 12,
        },
      }}
    >
      <div className="py-2">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-semibold">
            {tables.length} meja terdaftar
          </div>

          {selectedTableId && (
            <Button
              size="compact-xs"
              variant="subtle"
              color="red"
              onClick={() => {
                onClearTable()
                onClose()
              }}
            >
              Hapus Pilihan Meja
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {tables.map((tbl) => {
            const isSelected = tbl.id === selectedTableId
            const isAvailable = tbl.status === "AVAILABLE"

            return (
              <button
                key={tbl.id}
                type="button"
                onClick={() => {
                  onSelectTable(tbl)
                  onClose()
                }}
                className={`flex flex-col items-center justify-between rounded-lg border p-3 text-center transition-all cursor-pointer ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20"
                    : isAvailable
                    ? "border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm"
                    : "border-slate-200 bg-slate-50/80 opacity-75 hover:border-slate-300"
                }`}
              >
                <div className="flex w-full justify-between items-start">
                  <Badge
                    size="xs"
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

                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Check size={12} />
                    </span>
                  )}
                </div>

                <div className="my-2">
                  <div className="text-sm font-extrabold text-slate-900">
                    {tbl.table_number}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500 mt-0.5">
                    <Users size={12} />
                    <span>{tbl.capacity} Kursi</span>
                  </div>
                </div>

                <div className="text-[10px] font-bold text-blue-600">
                  {isSelected ? "Terpilih" : isAvailable ? "Pilih Meja" : "Tersedia/Pakai"}
                </div>
              </button>
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
