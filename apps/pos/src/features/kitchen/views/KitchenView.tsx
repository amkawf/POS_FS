import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Badge, Button } from "@mantine/core"
import {
  AlertCircle,
  CheckCircle2,
  ChefHat,
  Clock,
  Flame,
  RefreshCw,
  Utensils,
  Volume2,
} from "lucide-react"
import {
  fetchKitchenTickets,
  updateKitchenTicketStatus,
  type KitchenTicketResponse,
  type OrderResponse,
} from "../../../api"
import { DEV_COMPANY_ID, DEV_STORE_ID } from "../../../config/env"
import type { Table } from "../../../types/pos"
import { formatElapsed } from "../../../utils/date"

type KitchenViewProps = {
  orders?: OrderResponse[]
  tables?: Table[]
}

export function KitchenView({ tables = [] }: KitchenViewProps) {
  const queryClient = useQueryClient()
  const [filterStatus, setFilterStatus] = useState<string>("ALL")

  const {
    data: tickets = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["kitchen-tickets", DEV_COMPANY_ID, DEV_STORE_ID, filterStatus],
    queryFn: () =>
      fetchKitchenTickets(
        DEV_COMPANY_ID,
        DEV_STORE_ID,
        filterStatus === "ALL" ? undefined : filterStatus,
      ),
    refetchInterval: 5000,
  })

  const updateMutation = useMutation({
    mutationFn: ({
      ticketId,
      status,
    }: {
      ticketId: string
      status: "PENDING" | "PREPARING" | "READY" | "SERVED" | "CANCELLED"
    }) =>
      updateKitchenTicketStatus(ticketId, {
        company_id: DEV_COMPANY_ID,
        store_id: DEV_STORE_ID,
        status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-tickets"] })
    },
    onError: (err: Error) => {
      alert(`Gagal memperbarui status tiket dapur: ${err.message}`)
    },
  })

  const handleAdvanceStatus = (ticket: KitchenTicketResponse) => {
    let nextStatus: "PREPARING" | "READY" | "SERVED" = "PREPARING"
    if (ticket.status === "PENDING") {
      nextStatus = "PREPARING"
    } else if (ticket.status === "PREPARING") {
      nextStatus = "READY"
    } else if (ticket.status === "READY") {
      nextStatus = "SERVED"
    } else {
      return
    }

    updateMutation.mutate({
      ticketId: ticket.id,
      status: nextStatus,
    })
  }

  const pendingCount = tickets.filter((t) => t.status === "PENDING").length
  const preparingCount = tickets.filter((t) => t.status === "PREPARING").length
  const readyCount = tickets.filter((t) => t.status === "READY").length

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="flex items-center gap-2 text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
              <ChefHat className="text-blue-600" size={24} />
              <span>Kitchen Display System (KDS)</span>
            </h1>
            <Badge size="xs" color="blue" variant="dot">
              Live Sync (5s)
            </Badge>
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Layar kontrol stasiun dapur real-time. Pesanan dari kasir otomatis masuk ke tiket koki.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="default"
            onClick={() => refetch()}
            loading={isFetching}
            leftSection={<RefreshCw size={12} className={isFetching ? "animate-spin" : ""} />}
          >
            Refresh
          </Button>

          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
            <Volume2 size={15} className="text-emerald-600" />
            <span className="text-xs font-bold text-slate-700">Audio Alert</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>

      {/* STATUS TABS */}
      <div className="mt-5 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setFilterStatus("ALL")}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
            filterStatus === "ALL"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Semua Tiket ({tickets.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus("PENDING")}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
            filterStatus === "PENDING"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <span>Pesanan Masuk</span>
          {pendingCount > 0 && (
            <span className="rounded-full bg-blue-100 px-1.5 py-0.2 text-[10px] font-black text-blue-900">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus("PREPARING")}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
            filterStatus === "PREPARING"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <span>Sedang Dimasak</span>
          {preparingCount > 0 && (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[10px] font-black text-amber-900">
              {preparingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus("READY")}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
            filterStatus === "READY"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <span>Siap Disajikan</span>
          {readyCount > 0 && (
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] font-black text-emerald-900">
              {readyCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus("SERVED")}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
            filterStatus === "SERVED"
              ? "bg-slate-700 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Selesai (Served)
        </button>
      </div>

      {/* ERROR OR LOADING */}
      {isLoading && (
        <div className="py-20 text-center text-sm font-semibold text-slate-400">
          Memuat antrean tiket dapur...
        </div>
      )}

      {isError && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
          <AlertCircle size={16} />
          <span>Gagal memuat tiket dapur: {(error as Error).message}</span>
        </div>
      )}

      {/* TICKETS BOARD */}
      {!isLoading && !isError && tickets.length === 0 && (
        <div className="py-20 text-center">
          <Utensils size={44} className="mx-auto mb-3 text-slate-300" />
          <div className="text-base font-extrabold text-slate-700">
            Dapur Bersih! Tidak Ada Antrean Tiket Aktif.
          </div>
          <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">
            Setiap pesanan baru yang disimpan atau dibayar dari kasir akan langsung muncul otomatis di layar ini.
          </p>
        </div>
      )}

      {!isLoading && !isError && tickets.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tickets.map((ticket) => {
            const isProcessing = updateMutation.isPending && updateMutation.variables?.ticketId === ticket.id
            const tableDisplay =
              ticket.table_number ??
              (ticket.table_id ? tables.find((t) => t.id === ticket.table_id)?.table_number : undefined) ??
              (ticket.order_type === "DINE_IN" ? "Dine In" : "Takeaway")

            return (
              <div
                key={ticket.id}
                className={`flex flex-col justify-between overflow-hidden rounded-xl border bg-white shadow-xs transition-all ${
                  ticket.status === "READY"
                    ? "border-emerald-400 ring-2 ring-emerald-500/20"
                    : ticket.status === "PREPARING"
                    ? "border-amber-400 ring-2 ring-amber-500/20"
                    : ticket.status === "SERVED"
                    ? "border-slate-200 opacity-60"
                    : "border-blue-300 ring-1 ring-blue-400/20"
                }`}
              >
                {/* TICKET HEADER */}
                <div
                  className={`flex items-center justify-between px-4 py-3 text-white ${
                    ticket.status === "READY"
                      ? "bg-emerald-700"
                      : ticket.status === "PREPARING"
                      ? "bg-amber-600"
                      : ticket.status === "SERVED"
                      ? "bg-slate-700"
                      : "bg-slate-900"
                  }`}
                >
                  <div>
                    <div className="text-xs font-black tracking-wide">
                      #{ticket.order_number}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-[10px] text-white/80">
                      <Clock size={11} />
                      <span>{formatElapsed(ticket.created_at)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-black uppercase tracking-wide">
                      {tableDisplay}
                    </span>
                    <div className="mt-1 text-[10px] font-semibold text-white/80">
                      {ticket.order_type}
                    </div>
                  </div>
                </div>

                {/* TICKET ITEMS */}
                <div className="flex-1 p-4">
                  <div className="space-y-2.5">
                    {ticket.items && ticket.items.length > 0 ? (
                      ticket.items.map((it) => (
                        <div
                          key={it.id}
                          className="flex items-start justify-between border-b border-dashed border-slate-100 pb-2 text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-800">
                              {it.item_name}
                            </div>
                            <div className="font-mono text-[10px] text-slate-400">
                              SKU: {it.sku}
                            </div>
                            {it.notes && (
                              <div className="mt-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
                                Catatan: {it.notes}
                              </div>
                            )}
                          </div>
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-black text-slate-800">
                            x{it.quantity}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs italic text-slate-400">Menu pesanan tersimpan</div>
                    )}
                  </div>
                </div>

                {/* STATUS & ACTIONS */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 p-3">
                  <Badge
                    size="sm"
                    color={
                      ticket.status === "READY"
                        ? "green"
                        : ticket.status === "PREPARING"
                        ? "orange"
                        : ticket.status === "SERVED"
                        ? "gray"
                        : "blue"
                    }
                  >
                    {ticket.status}
                  </Badge>

                  {ticket.status !== "SERVED" && ticket.status !== "CANCELLED" ? (
                    <Button
                      size="xs"
                      color={
                        ticket.status === "PENDING"
                          ? "blue"
                          : ticket.status === "PREPARING"
                          ? "green"
                          : "violet"
                      }
                      leftSection={
                        ticket.status === "PREPARING" ? (
                          <CheckCircle2 size={13} />
                        ) : ticket.status === "READY" ? (
                          <Utensils size={13} />
                        ) : (
                          <Flame size={13} />
                        )
                      }
                      loading={isProcessing}
                      onClick={() => handleAdvanceStatus(ticket)}
                      styles={{ root: { fontWeight: 800 } }}
                    >
                      {ticket.status === "PENDING"
                        ? "Mulai Masak"
                        : ticket.status === "PREPARING"
                        ? "Pesanan Siap"
                        : "Sajikan ke Meja"}
                    </Button>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400">
                      {ticket.status === "SERVED" ? "Sudah Disajikan" : "Dibatalkan"}
                    </span>
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

