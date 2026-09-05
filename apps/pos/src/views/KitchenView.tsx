import { useState } from "react"
import { Badge, Button } from "@mantine/core"
import { CheckCircle2, ChefHat, Clock, Flame, Utensils } from "lucide-react"
import type { OrderResponse } from "../api/client"
import type { Table } from "../types/pos"

type KitchenViewProps = {
  orders: OrderResponse[]
  tables: Table[]
}

type TicketStatus = "PENDING" | "PREPARING" | "READY" | "SERVED"

export function KitchenView({ orders, tables }: KitchenViewProps) {
  const [ticketStatuses, setTicketStatuses] = useState<Record<string, TicketStatus>>({})

  // Active kitchen tickets from open and recent orders
  const activeOrders = orders.filter((o) => o.status === "OPEN" || o.status === "COMPLETED")

  const getStatus = (orderId: string): TicketStatus => {
    return ticketStatuses[orderId] || "PENDING"
  }

  const handleAdvanceStatus = (orderId: string) => {
    setTicketStatuses((prev) => {
      const current = prev[orderId] || "PENDING"
      let next: TicketStatus = "PREPARING"
      if (current === "PENDING") next = "PREPARING"
      else if (current === "PREPARING") next = "READY"
      else if (current === "READY") next = "SERVED"
      else next = "SERVED"
      return { ...prev, [orderId]: next }
    })
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <ChefHat className="text-blue-600" size={24} />
            <span>Kitchen Display System (KDS)</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Antrean pesanan dapur secara langsung. Pantau proses masak hingga siap saji.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge size="md" color="blue" variant="light">
            {activeOrders.length} Antrean Dapur
          </Badge>
        </div>
      </div>

      {/* TICKETS BOARD */}
      {activeOrders.length === 0 ? (
        <div className="py-20 text-center">
          <Utensils size={40} className="mx-auto text-slate-300 mb-3" />
          <div className="text-sm font-bold text-slate-500">
            Dapur Bersih! Tidak Ada Antrean Pesanan.
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pesanan baru dari kasir akan otomatis muncul di sini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {activeOrders.map((ord) => {
            const currentStatus = getStatus(ord.id)
            const tableName = ord.table_id
              ? tables.find((t) => t.id === ord.table_id)?.table_number ?? "Meja ?"
              : "Takeaway"

            return (
              <div
                key={ord.id}
                className={`flex flex-col justify-between rounded-xl border bg-white shadow-xs overflow-hidden transition-all ${
                  currentStatus === "READY"
                    ? "border-emerald-300 ring-2 ring-emerald-500/10"
                    : currentStatus === "PREPARING"
                    ? "border-amber-300 ring-2 ring-amber-500/10"
                    : "border-slate-200"
                }`}
              >
                {/* TICKET HEADER */}
                <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black tracking-wide">
                      #{ord.order_number}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock size={11} />
                      <span>{new Date(ord.opened_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-blue-400">
                      {tableName}
                    </span>
                    <div className="text-[10px] text-slate-400">{ord.order_type}</div>
                  </div>
                </div>

                {/* TICKET ITEMS */}
                <div className="p-4 flex-1">
                  <div className="space-y-2">
                    {ord.items && ord.items.length > 0 ? (
                      ord.items.map((it) => (
                        <div key={it.id} className="flex items-center justify-between border-b border-dashed border-slate-100 pb-1.5 text-xs">
                          <span className="font-bold text-slate-800">
                            {it.item_name}
                          </span>
                          <span className="rounded bg-slate-100 px-2 py-0.5 font-extrabold text-slate-700">
                            x{it.quantity}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400 italic">Item pesanan tersimpan</div>
                    )}
                  </div>
                </div>

                {/* STATUS & ACTIONS */}
                <div className="border-t border-slate-100 p-3 bg-slate-50/70 flex items-center justify-between">
                  <Badge
                    size="sm"
                    color={
                      currentStatus === "READY"
                        ? "green"
                        : currentStatus === "PREPARING"
                        ? "orange"
                        : currentStatus === "SERVED"
                        ? "gray"
                        : "blue"
                    }
                  >
                    {currentStatus}
                  </Badge>

                  {currentStatus !== "SERVED" ? (
                    <Button
                      size="xs"
                      color={currentStatus === "PREPARING" ? "green" : "blue"}
                      leftSection={
                        currentStatus === "PREPARING" ? <CheckCircle2 size={13} /> : <Flame size={13} />
                      }
                      onClick={() => handleAdvanceStatus(ord.id)}
                      styles={{ root: { fontWeight: 700 } }}
                    >
                      {currentStatus === "PENDING"
                        ? "Mulai Masak"
                        : currentStatus === "PREPARING"
                        ? "Siap Disajikan"
                        : "Selesai (Served)"}
                    </Button>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400">Sudah Disajikan</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
