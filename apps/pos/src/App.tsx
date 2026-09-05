import { Sidebar } from "./components/SideBar"
import { TopBar } from "./components/TopBar"
import { CategoryTabs } from "./components/catalog/CategoryTabs"
import { ProductGrid } from "./components/catalog/ProductGrid"
import { OrderActions } from "./components/order/OrderAction"
import { OrderPanel } from "./components/order/OrderPanel"
import { OrderSummary } from "./components/order/OrderSummary"
import { SavedOrdersModal } from "./components/order/SavedOrdersModal"
import { TableSelectModal } from "./components/table/TableSelectModal"
import { PaymentModal } from "./components/payment/PaymentModal"
import { ReceiptModal } from "./components/payment/ReceiptModal"
import { DashboardView } from "./views/DashboardView"
import { TablesView } from "./views/TablesView"
import { KitchenView } from "./views/KitchenView"
import { PaymentsView } from "./views/PaymentsView"
import { InventoryView } from "./views/InventoryView"
import { ReportsView } from "./views/ReportsView"
import { EmployeesView } from "./views/EmployeesView"
import { SettingsView } from "./views/SettingsView"
import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createOrder,
  fetchMenuCategories,
  fetchMenuItems,
  fetchOrderById,
  fetchOrders,
  fetchTables,
  payOrder,
  type OrderResponse,
} from "./api/client"
import { DEV_COMPANY_ID, DEV_STORE_ID } from "./config"
import type { PosView } from "./types/navigation"
import type { OrderItem, Product, Table } from "./types/pos"
import { Button } from "@mantine/core"
import { Table2 } from "lucide-react"

function App() {
  const [currentView, setCurrentView] = useState<PosView>("ORDERS")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [lastOrderNumber, setLastOrderNumber] = useState<string | null>(null)
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
  const [savedOrdersModalOpen, setSavedOrdersModalOpen] = useState(false)
  const [tableModalOpen, setTableModalOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
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
    tableNumber?: string
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

  const menuCategoriesQuery = useQuery({
    queryKey: ["menu-categories", DEV_COMPANY_ID],
    queryFn: () => fetchMenuCategories(DEV_COMPANY_ID),
  })

  const tablesQuery = useQuery({
    queryKey: ["tables", DEV_COMPANY_ID, DEV_STORE_ID],
    queryFn: () => fetchTables(DEV_COMPANY_ID, DEV_STORE_ID),
  })

  const tables = tablesQuery.data ?? []

  const openOrdersQuery = useQuery({
    queryKey: ["orders", DEV_COMPANY_ID, DEV_STORE_ID, "OPEN"],
    queryFn: () => fetchOrders(DEV_COMPANY_ID, DEV_STORE_ID, "OPEN"),
    refetchInterval: 15000,
  })

  const completedOrdersQuery = useQuery({
    queryKey: ["orders", DEV_COMPANY_ID, DEV_STORE_ID, "COMPLETED"],
    queryFn: () => fetchOrders(DEV_COMPANY_ID, DEV_STORE_ID, "COMPLETED"),
    refetchInterval: 15000,
  })

  const openOrders = openOrdersQuery.data ?? []
  const completedOrders = completedOrdersQuery.data ?? []
  const allOrders = [...openOrders, ...completedOrders]
  const openOrdersCount = openOrders.length

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (result) => {
      setOrderItems([])
      setActiveOrderId(null)
      setSelectedTable(null)
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
    if (order.table_id) {
      const foundTable = tables.find((t) => t.id === order.table_id) ?? null
      setSelectedTable(foundTable)
    } else {
      setSelectedTable(null)
    }
    setOrderItems(items)
    setSuccessMessage(`Order #${order.order_number} loaded into checkout. Ready to PAY!`)
  }

  const handleLoadOrderFromDashboard = async (order: OrderResponse) => {
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
      handleSelectSavedOrder(fullOrder, items)
      setCurrentView("ORDERS")
    } catch (err) {
      alert(`Gagal memuat pesanan: ${(err as Error).message}`)
    }
  }

  const handleOpenReceiptFromPayment = async (order: OrderResponse) => {
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
      const targetTableNumber =
        fullOrder.table_id
          ? tables.find((t) => t.id === fullOrder.table_id)?.table_number
          : undefined

      setReceiptData({
        orderNumber: fullOrder.order_number,
        orderType: fullOrder.order_type,
        tableNumber: targetTableNumber,
        items,
        subtotal: fullOrder.subtotal,
        totalAmount: fullOrder.total_amount,
        paymentMethod: "CASH",
        amountPaid: fullOrder.total_amount,
        change: 0,
      })
      setReceiptModalOpen(true)
    } catch (err) {
      alert(`Gagal memuat data struk: ${(err as Error).message}`)
    }
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
      table_id: orderType === "DINE_IN" ? selectedTable?.id : undefined,
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
          table_id: orderType === "DINE_IN" ? selectedTable?.id : undefined,
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
      const targetTableNumber =
        selectedTable?.table_number ||
        (paidOrder.table_id ? tables.find((t) => t.id === paidOrder.table_id)?.table_number : undefined)

      const changeAmount = amountPaid - paidOrder.total_amount
      setReceiptData({
        orderNumber: paidOrder.order_number || targetOrderNumber || "ORD-DONE",
        orderType: paidOrder.order_type || targetOrderType,
        tableNumber: targetTableNumber,
        items: [...orderItems],
        subtotal: paidOrder.subtotal || finalSubtotal,
        totalAmount: paidOrder.total_amount || finalTotal,
        paymentMethod,
        amountPaid,
        change: changeAmount,
      })

      // 4. Invalidate queries & reset cart
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["tables"] })
      setPaymentModalOpen(false)
      setReceiptModalOpen(true)
      setOrderItems([])
      setActiveOrderId(null)
      setSelectedTable(null)
      setLastOrderNumber(null)
      setSuccessMessage(null)
    } catch (err) {
      alert(`Pembayaran gagal: ${(err as Error).message}`)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const products = menuItemsQuery.data ?? []
  const categoryTabs = [
    { id: "ALL", name: "ALL" },
    ...(menuCategoriesQuery.data ?? []).map((cat) => ({
      id: cat.id,
      name: cat.name,
    })),
  ]

  const filteredProducts = products.filter((product) => {
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch =
      q === "" ||
      product.name.toLowerCase().includes(q) ||
      product.sku.toLowerCase().includes(q)

    if (!matchesSearch) return false

    if (activeCategory === "ALL") return true
    return product.categoryIds?.includes(activeCategory)
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
        <Sidebar
          activeView={currentView}
          onViewChange={setCurrentView}
        />

        {currentView === "ORDERS" && (
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
                categories={categoryTabs}
                activeCategoryId={activeCategory}
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
                  onClick={() => {
                    setOrderType("TAKEAWAY")
                    setSelectedTable(null)
                  }}
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

            {orderType === "DINE_IN" && (
              <div className="flex items-center justify-between border-b border-slate-200 bg-blue-50/50 px-4 py-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Table2 size={15} className="text-blue-600" />
                  <span>Meja:</span>
                  <span
                    className={
                      selectedTable
                        ? "text-blue-700 font-extrabold"
                        : "text-slate-400 font-normal italic"
                    }
                  >
                    {selectedTable ? selectedTable.table_number : "Belum dipilih"}
                  </span>
                  {selectedTable && (
                    <span className="text-[10px] text-slate-500 font-medium">
                      ({selectedTable.capacity} Kursi)
                    </span>
                  )}
                </div>
                <Button
                  size="compact-xs"
                  variant="light"
                  color="blue"
                  onClick={() => setTableModalOpen(true)}
                  styles={{ root: { fontSize: 11 } }}
                >
                  {selectedTable ? "Ganti" : "Pilih Meja"}
                </Button>
              </div>
            )}

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
                setSelectedTable(null)
                setLastOrderNumber(null)
                setSuccessMessage(null)
              }}
            />
          </aside>
        </main>
        )}

        {currentView === "DASHBOARD" && (
          <DashboardView
            openOrders={openOrders}
            completedOrders={completedOrders}
            tables={tables}
            menuItemsCount={products.length}
            onNavigateToOrders={() => setCurrentView("ORDERS")}
            onSelectOrder={handleLoadOrderFromDashboard}
          />
        )}

        {currentView === "TABLES" && (
          <TablesView
            tables={tables}
            selectedTableId={selectedTable?.id ?? null}
            onSelectTableForOrder={(table) => {
              setSelectedTable(table)
              setOrderType("DINE_IN")
              setCurrentView("ORDERS")
            }}
          />
        )}

        {currentView === "KITCHEN" && (
          <KitchenView
            orders={allOrders}
            tables={tables}
          />
        )}

        {currentView === "PAYMENTS" && (
          <PaymentsView
            completedOrders={completedOrders}
            tables={tables}
            onOpenReceipt={handleOpenReceiptFromPayment}
          />
        )}

        {currentView === "INVENTORY" && (
          <InventoryView
            products={products}
            categories={menuCategoriesQuery.data ?? []}
          />
        )}

        {currentView === "REPORTS" && (
          <ReportsView
            completedOrders={completedOrders}
          />
        )}

        {currentView === "EMPLOYEES" && (
          <EmployeesView />
        )}

        {currentView === "SETTINGS" && (
          <SettingsView />
        )}
      </div>

      <SavedOrdersModal
        opened={savedOrdersModalOpen}
        onClose={() => setSavedOrdersModalOpen(false)}
        onSelectOrder={handleSelectSavedOrder}
      />

      <TableSelectModal
        opened={tableModalOpen}
        onClose={() => setTableModalOpen(false)}
        tables={tables}
        selectedTableId={selectedTable?.id ?? null}
        onSelectTable={(tbl) => {
          setSelectedTable(tbl)
          setOrderType("DINE_IN")
        }}
        onClearTable={() => setSelectedTable(null)}
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
          tableNumber={receiptData.tableNumber}
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

