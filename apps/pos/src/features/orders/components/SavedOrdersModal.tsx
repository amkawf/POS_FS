 import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Modal } from "@mantine/core"
import { AlertTriangle, Clock, RefreshCw, ShoppingBag, Trash2, Utensils } from "lucide-react"
import {
  deleteOrder,
  fetchOrderById,
  fetchOrders,
  type OrderResponse,
} from "../../../api"
import { DEV_COMPANY_ID, DEV_STORE_ID } from "../../../config/env"
import type { OrderItem } from "../../../types/pos"
import { formatPrice } from "../../../utils/currency"

type SavedOrdersModalProps = {
  opened: boolean
  onClose: () => void
  onSelectOrder: (order: OrderResponse, items: OrderItem[]) => void
}

function formatTime(isoString: string) {
  try {
    const date = new Date(isoString)
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return isoString
  }
}

export function SavedOrdersModal({
  opened,
  onClose,
  onSelectOrder,
}: SavedOrdersModalProps) {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>("OPEN")
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null)
  const [orderToDelete, setOrderToDelete] = useState<OrderResponse | null>(null)
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (orderId: string) =>
      deleteOrder(orderId, DEV_COMPANY_ID, DEV_STORE_ID),
    onSuccess: () => {
      if (orderToDelete) {
        setDeleteSuccessMsg(`Pesanan ${orderToDelete.order_number} berhasil dihapus.`)
        setTimeout(() => setDeleteSuccessMsg(null), 4000)
      }
      setOrderToDelete(null)
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["tables"] })
    },
    onError: (err: Error) => {
      alert(`Gagal menghapus pesanan: ${err.message}`)
    },
  })

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["orders", DEV_COMPANY_ID, DEV_STORE_ID, statusFilter],
    queryFn: () =>
      fetchOrders(
        DEV_COMPANY_ID,
        DEV_STORE_ID,
        statusFilter === "ALL" ? undefined : statusFilter,
      ),
    enabled: opened,
  })

  const handleLoadOrder = async (order: OrderResponse) => {
    setLoadingOrderId(order.id)
    try {
      const fullOrder = await fetchOrderById(
        order.id,
        DEV_COMPANY_ID,
        DEV_STORE_ID,
      )

      const items: OrderItem[] = (fullOrder.items ?? []).map((item) => ({
        menuItemId: item.menu_item_id,
        sku: item.sku,
        name: item.item_name,
        price: item.unit_price,
        qty: item.quantity,
      }))

      onSelectOrder(fullOrder, items)
      onClose()
    } catch (err) {
      alert(`Failed to load order: ${(err as Error).message}`)
    } finally {
      setLoadingOrderId(null)
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <ShoppingBag size={18} strokeWidth={2} className="text-blue-600" />
          <span className="font-extrabold text-sm uppercase tracking-wide text-slate-900">
            Saved Orders (Hold & Recall)
          </span>
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
        body: {
          paddingTop: 16,
        },
      }}
    >
      {/* SUCCESS NOTIFICATION */}
      {deleteSuccessMsg && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 shadow-2xs">
          <span>{deleteSuccessMsg}</span>
          <button
            type="button"
            onClick={() => setDeleteSuccessMsg(null)}
            className="text-sm font-bold text-emerald-800 hover:opacity-75 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* FILTER TABS & REFRESH */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          {["OPEN", "ALL", "COMPLETED"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-3.5 py-1 text-xs transition-all duration-200 active:scale-[0.98] cursor-pointer ${
                statusFilter === status
                  ? "bg-blue-600 font-medium text-white shadow-sm shadow-blue-500/25"
                  : "bg-slate-100 font-normal text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98] cursor-pointer"
        >
          <RefreshCw
            size={13}
            strokeWidth={2}
            className={isFetching ? "animate-spin text-blue-600" : "text-slate-500"}
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* CONTENT LIST */}
      {isLoading && (
        <div className="py-12 text-center text-xs font-semibold text-slate-400">
          Loading saved orders...
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600">
          Failed to fetch orders: {(error as Error).message}
        </div>
      )}

      {!isLoading && !isError && orders.length === 0 && (
        <div className="py-12 text-center text-slate-400">
          <Utensils size={32} strokeWidth={1.75} className="mx-auto mb-2 opacity-40" />
          <div className="text-xs font-bold text-slate-700">No {statusFilter.toLowerCase()} orders found</div>
          <div className="mt-0.5 text-[10px] text-slate-400">
            Orders saved from the POS terminal will appear here.
          </div>
        </div>
      )}

      {!isLoading && !isError && orders.length > 0 && (
        <div className="max-h-[60vh] space-y-2.5 overflow-y-auto pr-1">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs transition-all duration-200 hover:border-blue-300 hover:shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {order.order_number}
                  </span>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      order.status === "OPEN"
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border border-blue-200 bg-blue-50 text-blue-700"
                    }`}
                  >
                    {order.status}
                  </span>

                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-semibold text-slate-600">
                    {order.order_type}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} strokeWidth={2} />
                    {formatTime(order.opened_at)}
                  </span>

                  {order.customer_name && (
                    <span>Customer: {order.customer_name}</span>
                  )}
                </div>

                <div className="font-mono text-xs font-bold tabular-nums text-slate-900">
                  Rp {formatPrice(order.total_amount)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={loadingOrderId === order.id}
                  onClick={() => handleLoadOrder(order)}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-all duration-200 hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {loadingOrderId === order.id ? "Loading..." : "Load to Checkout"}
                </button>

                {order.status !== "COMPLETED" && (
                  <button
                    type="button"
                    title="Hapus Pesanan"
                    onClick={() => setOrderToDelete(order)}
                    className="rounded-lg p-1.5 text-slate-400 transition-all duration-150 hover:bg-red-50 hover:text-red-500 active:scale-90 cursor-pointer"
                  >
                    <Trash2 size={15} strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONFIRMATION MODAL FOR DELETE */}
      <Modal
        opened={orderToDelete !== null}
        onClose={() => setOrderToDelete(null)}
        title={
          <div className="flex items-center gap-2 text-sm font-bold text-red-600">
            <AlertTriangle size={18} strokeWidth={2} />
            <span>Konfirmasi Hapus Pesanan</span>
          </div>
        }
        size="sm"
        centered
        radius="lg"
        styles={{
          content: { borderRadius: 12 },
          header: { borderBottom: "1px solid #fee2e2", paddingBottom: 10 },
        }}
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs leading-relaxed text-slate-600">
            Apakah Anda yakin ingin menghapus pesanan{" "}
            <span className="font-mono font-bold text-slate-900">
              {orderToDelete?.order_number}
            </span>
            ? Seluruh data pesanan dan item terkait akan dihapus secara permanen dari sistem.
          </p>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setOrderToDelete(null)}
              disabled={deleteMutation.isPending}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (orderToDelete) {
                  deleteMutation.mutate(orderToDelete.id)
                }
              }}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-all duration-200 hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus Pesanan"}
            </button>
          </div>
        </div>
      </Modal>
    </Modal>
  )
}

