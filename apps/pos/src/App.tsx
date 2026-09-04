import { Sidebar } from "./components/SideBar"
import { TopBar } from "./components/TopBar"
import { CategoryTabs } from "./components/catalog/CategoryTabs"
import { ProductGrid } from "./components/catalog/ProductGrid"
import { OrderActions } from "./components/order/OrderAction"
import { OrderPanel } from "./components/order/OrderPanel"
import { OrderSummary } from "./components/order/OrderSummary"
import { SavedOrdersModal } from "./components/order/SavedOrdersModal"
import { PaymentModal } from "./components/payment/PaymentModal"
import { ReceiptModal } from "./components/payment/ReceiptModal"
import { categories } from "./data/dummy"
import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createOrder,
  fetchMenuItems,
  fetchOrders,
  payOrder,
  type OrderResponse,
} from "./api/client"
import { DEV_COMPANY_ID, DEV_STORE_ID } from "./config"
import type { OrderItem, Product } from "./types/pos"


function App() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [lastOrderNumber, setLastOrderNumber] = useState<string | null>(null)
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
  const [savedOrdersModalOpen, setSavedOrdersModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("ALL")
  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKEAWAY">("DINE_IN")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [receiptData, setReceiptData] = useState<{
    orderNumber: string
    orderType: string
    items: OrderItem[]
    subtotal: number
    totalAmount: number
    paymentMethod: string
    amountPaid: number
    change: number
  } | null>(null)

  const queryClient = useQueryClient()

  const menuItemsQuery = useQuery({
    queryKey: ["menu-items", DEV_COMPANY_ID],
    queryFn: () => fetchMenuItems(DEV_COMPANY_ID),
  })

  const openOrdersQuery = useQuery({
    queryKey: ["orders", DEV_COMPANY_ID, DEV_STORE_ID, "OPEN"],
    queryFn: () => fetchOrders(DEV_COMPANY_ID, DEV_STORE_ID, "OPEN"),
    refetchInterval: 15000,
  })

  const openOrdersCount = openOrdersQuery.data?.length ?? 0

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (result) => {
      setOrderItems([])
      setActiveOrderId(null)
      setLastOrderNumber(result.order_number)
      setSuccessMessage(`Order #${result.order_number} saved successfully!`)
      queryClient.invalidateQueries({ queryKey: ["menu-items"] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })

  const handleSelectSavedOrder = (order: OrderResponse, items: OrderItem[]) => {
    setActiveOrderId(order.id)
    setLastOrderNumber(order.order_number)
    setOrderType(order.order_type as "DINE_IN" | "TAKEAWAY")
    setOrderItems(items)
    setSuccessMessage(`Order #${order.order_number} loaded into checkout. Ready to PAY!`)
  }

  const increaseItem = (index: number) => {
    setOrderItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, qty: item.qty + 1 }
          : item,
      ),
    )
  }

  const decreaseItem = (index: number) => {
    setOrderItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index && item.qty > 1
          ? { ...item, qty: item.qty - 1 }
          : item,
      ),
    )
  }

  const removeItem = (index: number) => {
    setOrderItems((currentItems) =>
      currentItems.filter((_, itemIndex) => itemIndex !== index),
    )
  }

  const addProduct = (product: Product) => {
    setSuccessMessage(null)
    setOrderItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.menuItemId === product.id,
      )

      if (existingItem) {
        return currentItems.map((item) =>
          item.menuItemId === product.id
            ? { ...item, qty: item.qty + 1 }
            : item,
        )
      }

      return [
        ...currentItems,
        {
          menuItemId: product.id,
          sku: product.sku,
          name: product.name,
          price: product.price,
          qty: 1,
        },
      ]
    })
  }

  const handleSaveOrder = () => {
    if (orderItems.length === 0) {
      return
    }

    createOrderMutation.mutate({
      company_id: DEV_COMPANY_ID,
      store_id: DEV_STORE_ID,
      order_type: orderType,
      order_source: "POS",
      items: orderItems.map((item) => ({
        menu_item_id: item.menuItemId,
        item_name: item.name,
        sku: item.sku,
        quantity: item.qty,
        unit_price: item.price,
      })),
    })
  }

  const handleConfirmPayment = async (
    paymentMethod: "CASH" | "QRIS",
    amountPaid: number,
  ) => {
    if (orderItems.length === 0) return

    setIsProcessingPayment(true)
    try {
      let targetOrderId = activeOrderId
      let targetOrderNumber = lastOrderNumber
      const targetOrderType = orderType
      const finalSubtotal = subtotal
      const finalTotal = total

      // 1. If this is a fresh order in cart (not saved previously), create it first
      if (!targetOrderId) {
        const created = await createOrder({
          company_id: DEV_COMPANY_ID,
          store_id: DEV_STORE_ID,
          order_type: orderType,
          order_source: "POS",
          items: orderItems.map((item) => ({
            menu_item_id: item.menuItemId,
            item_name: item.name,
            sku: item.sku,
            quantity: item.qty,
            unit_price: item.price,
          })),
        })
        targetOrderId = created.id
        targetOrderNumber = created.order_number
      }

      // 2. Pay order
      const paidOrder = await payOrder(targetOrderId, {
        company_id: DEV_COMPANY_ID,
        store_id: DEV_STORE_ID,
        payment_method: paymentMethod,
        amount_paid: amountPaid,
      })

      // 3. Setup receipt data
      const changeAmount = amountPaid - paidOrder.total_amount
      setReceiptData({
        orderNumber: paidOrder.order_number || targetOrderNumber || "ORD-DONE",
        orderType: paidOrder.order_type || targetOrderType,
        items: [...orderItems],
        subtotal: paidOrder.subtotal || finalSubtotal,
        totalAmount: paidOrder.total_amount || finalTotal,
        paymentMethod,
        amountPaid,
        change: changeAmount,
      })

      // 4. Invalidate queries & reset cart
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      setPaymentModalOpen(false)
      setReceiptModalOpen(true)
      setOrderItems([])
      setActiveOrderId(null)
      setLastOrderNumber(null)
      setSuccessMessage(null)
    } catch (err) {
      alert(`Pembayaran gagal: ${(err as Error).message}`)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const products = menuItemsQuery.data ?? []


  const filteredProducts = products.filter((product) => {
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch =
      q === "" ||
      product.name.toLowerCase().includes(q) ||
      product.sku.toLowerCase().includes(q)

    if (!matchesSearch) return false

    if (activeCategory === "ALL") return true
    if (activeCategory === "FOOD") return product.sku.toUpperCase().startsWith("FD")
    if (activeCategory === "DRINK") return product.sku.toUpperCase().startsWith("DR")
    if (activeCategory === "SNACK") return product.sku.toUpperCase().startsWith("SN")
    if (activeCategory === "DESSERT") return product.sku.toUpperCase().startsWith("DS")

    return true
  })

  const subtotal = orderItems.reduce(
    (total, item) => total + item.price * item.qty,
    0,
  )

  const tax = subtotal * 0.1
  const total = subtotal + tax

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSavedOrders={() => setSavedOrdersModalOpen(true)}
        openOrdersCount={openOrdersCount}
      />

      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar onOpenOrders={() => setSavedOrdersModalOpen(true)} />

        <main className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_380px]">
          <section className="min-w-0 border-r border-slate-200">
            <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
              <div>
                <div className="text-sm font-extrabold uppercase tracking-tight">
                  Product Catalog
                </div>

                <div className="mt-0.5 text-[10px] font-semibold text-slate-400">
                  {filteredProducts.length} OF {products.length} PRODUCTS AVAILABLE
                </div>
              </div>

              <div className="text-[10px] font-bold text-slate-400">
                STORE STOCK
              </div>
            </div>

            <div className="border-b border-slate-200 bg-white px-4 py-3">
              <CategoryTabs
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
              />
            </div>

            {menuItemsQuery.isLoading && (
              <div className="p-4 text-sm font-semibold text-slate-400">
                Loading menu...
              </div>
            )}

            {menuItemsQuery.isError && (
              <div className="p-4 text-sm font-semibold text-red-600">
                Failed to load menu: {(menuItemsQuery.error as Error).message}
              </div>
            )}

            {menuItemsQuery.isSuccess && filteredProducts.length === 0 && (
              <div className="p-8 text-center text-sm font-semibold text-slate-400">
                No products found matching your search or filter.
              </div>
            )}

            {menuItemsQuery.isSuccess && filteredProducts.length > 0 && (
              <ProductGrid
                products={filteredProducts}
                onAddProduct={addProduct}
              />
            )}
          </section>

          <aside className="flex min-h-0 flex-col bg-white">
            {successMessage && (
              <div className="flex items-center justify-between border-b border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-bold text-white">
                    ✓
                  </span>
                  <span>{successMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccessMessage(null)}
                  className="ml-2 font-bold text-emerald-700 hover:text-emerald-950"
                >
                  ×
                </button>
              </div>
            )}

            <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold uppercase tracking-tight">
                    Current Order
                  </span>
                  {activeOrderId && (
                    <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-extrabold text-emerald-800">
                      RECALLED
                    </span>
                  )}
                </div>

                <div className="mt-0.5 flex items-center gap-2 text-[10px] font-semibold text-slate-400">
                  <span>{lastOrderNumber ? `Order: ${lastOrderNumber}` : "New Order"}</span>
                  <button
                    type="button"
                    onClick={() => setSavedOrdersModalOpen(true)}
                    className="text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                  >
                    Saved ({openOrdersCount})
                  </button>
                </div>
              </div>

              <div className="flex rounded-md border border-slate-200 bg-slate-100 p-0.5">
                <button
                  type="button"
                  onClick={() => setOrderType("DINE_IN")}
                  className={`rounded px-2.5 py-1 text-[10px] font-bold transition-all ${
                    orderType === "DINE_IN"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  DINE IN
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType("TAKEAWAY")}
                  className={`rounded px-2.5 py-1 text-[10px] font-bold transition-all ${
                    orderType === "TAKEAWAY"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  TAKEAWAY
                </button>
              </div>
            </div>

            <OrderPanel
              items={orderItems}
              onIncrease={increaseItem}
              onDecrease={decreaseItem}
              onRemove={removeItem}
            />

            <OrderSummary
              subtotal={subtotal}
              tax={tax}
              total={total}
            />

            {createOrderMutation.isError && (
              <div className="border-t border-red-200 bg-red-50 p-2 text-xs font-semibold text-red-600">
                Failed to save order:{" "}
                {(createOrderMutation.error as Error).message}
              </div>
            )}

            <OrderActions
              total={total}
              disabled={orderItems.length === 0 || createOrderMutation.isPending || isProcessingPayment}
              isSaving={createOrderMutation.isPending}
              onSaveOrder={handleSaveOrder}
              onPayOrder={() => setPaymentModalOpen(true)}
              onClearOrder={() => {
                setOrderItems([])
                setActiveOrderId(null)
                setLastOrderNumber(null)
                setSuccessMessage(null)
              }}
            />
          </aside>
        </main>
      </div>

      <SavedOrdersModal
        opened={savedOrdersModalOpen}
        onClose={() => setSavedOrdersModalOpen(false)}
        onSelectOrder={handleSelectSavedOrder}
      />

      <PaymentModal
        opened={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        totalAmount={total}
        orderNumber={lastOrderNumber ?? undefined}
        itemsCount={orderItems.length}
        onConfirmPayment={handleConfirmPayment}
        isProcessing={isProcessingPayment}
      />

      {receiptData && (
        <ReceiptModal
          opened={receiptModalOpen}
          onClose={() => {
            setReceiptModalOpen(false)
            setReceiptData(null)
          }}
          orderNumber={receiptData.orderNumber}
          orderType={receiptData.orderType}
          items={receiptData.items}
          subtotal={receiptData.subtotal}
          totalAmount={receiptData.totalAmount}
          paymentMethod={receiptData.paymentMethod}
          amountPaid={receiptData.amountPaid}
          change={receiptData.change}
        />
      )}
    </div>
  )
}

export default App

