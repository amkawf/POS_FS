import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Badge, Button, Modal } from "@mantine/core"
import { AlertTriangle, Clock, RefreshCw, ShoppingBag, Trash2, Utensils } from "lucide-react"
import {
  deleteOrder,
  fetchOrderById,
  fetchOrders,
  type OrderResponse,
} from "../../api/client"
import { DEV_COMPANY_ID, DEV_STORE_ID } from "../../config"
import type { OrderItem } from "../../types/pos"

type SavedOrdersModalProps = {
  opened: boolean
  onClose: () => void
  onSelectOrder: (order: OrderResponse, items: OrderItem[]) => void
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
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
          <ShoppingBag size={18} className="text-blue-600" />
          <span className="font-extrabold text-sm uppercase tracking-wide">
            Saved Orders (Hold & Recall)
          </span>
        </div>
      }
      size="lg"
      centered
      styles={{
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
        <div className="mb-3 flex items-center justify-between rounded border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
          <span>{deleteSuccessMsg}</span>
          <button
            type="button"
            onClick={() => setDeleteSuccessMsg(null)}
            className="text-sm font-bold text-green-800 hover:opacity-75"
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
              className={`rounded px-3 py-1 text-xs font-bold transition-colors ${
                statusFilter === status
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <Button
          variant="subtle"
          size="xs"
          leftSection={
            <RefreshCw
              size={13}
              className={isFetching ? "animate-spin text-blue-600" : "text-slate-500"}
            />
          }
          onClick={() => refetch()}
          styles={{ root: { fontSize: 11 } }}
        >
          Refresh
        </Button>
      </div>

      {/* CONTENT LIST */}
      {isLoading && (
        <div className="py-12 text-center text-xs font-semibold text-slate-400">
          Loading saved orders...
        </div>
      )}

      {isError && (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600">
          Failed to fetch orders: {(error as Error).message}
        </div>
      )}

      {!isLoading && !isError && orders.length === 0 && (
        <div className="py-12 text-center text-slate-400">
          <Utensils size={32} className="mx-auto mb-2 opacity-40" />
          <div className="text-xs font-bold">No {statusFilter.toLowerCase()} orders found</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Orders saved from the POS terminal will appear here.
          </div>
        </div>
      )}

      {!isLoading && !isError && orders.length > 0 && (
        <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-xs hover:border-blue-400 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-slate-900">
                    {order.order_number}
                  </span>

                  <Badge
                    size="xs"
                    color={order.status === "OPEN" ? "green" : "blue"}
                    variant="light"
                  >
                    {order.status}
                  </Badge>

                  <Badge size="xs" variant="outline" color="gray">
                    {order.order_type}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatTime(order.opened_at)}
                  </span>

                  {order.customer_name && (
                    <span>Customer: {order.customer_name}</span>
                  )}
                </div>

                <div className="text-xs font-extrabold text-blue-700">
                  Rp {formatPrice(order.total_amount)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  color="blue"
                  loading={loadingOrderId === order.id}
                  onClick={() => handleLoadOrder(order)}
                  styles={{
                    root: {
                      fontWeight: 700,
                      fontSize: 11,
                    },
                  }}
                >
                  Load to Checkout
                </Button>

                {order.status !== "COMPLETED" && (
                  <Button
                    size="xs"
                    variant="subtle"
                    color="red"
                    title="Hapus Pesanan"
                    onClick={() => setOrderToDelete(order)}
                    styles={{
                      root: {
                        padding: "0 6px",
                      },
                    }}
                  >
                    <Trash2 size={15} />
                  </Button>
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
          <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
            <AlertTriangle size={18} />
            <span>Konfirmasi Hapus Pesanan</span>
          </div>
        }
        size="sm"
        centered
        styles={{
          header: { borderBottom: "1px solid #fee2e2", paddingBottom: 10 },
        }}
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin menghapus pesanan{" "}
            <span className="font-extrabold text-slate-900">
              {orderToDelete?.order_number}
            </span>
            ? Seluruh data pesanan dan item terkait akan dihapus secara permanen dari sistem.
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="default"
              size="xs"
              onClick={() => setOrderToDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Batal
            </Button>
            <Button
              color="red"
              size="xs"
              loading={deleteMutation.isPending}
              onClick={() => {
                if (orderToDelete) {
                  deleteMutation.mutate(orderToDelete.id)
                }
              }}
              styles={{
                root: {
                  fontWeight: 700,
                },
              }}
            >
              Ya, Hapus Pesanan
            </Button>
          </div>
        </div>
      </Modal>
    </Modal>
  )
}

