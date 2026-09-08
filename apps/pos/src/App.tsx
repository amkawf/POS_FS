import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Table2 } from "lucide-react"

// Layout Components
import { MobileNavDrawer, Sidebar, TopBar } from "./components/layout"

// Feature: Catalog
import { CategoryTabs, ProductGrid } from "./features/catalog"

// Feature: Orders & Cart
import {
  CartDrawer,
  CartFloatingBar,
  OrderActions,
  OrderPanel,
  OrderSummary,
  SavedOrdersModal,
  useOrderCart,
} from "./features/orders"

// Feature: Tables & Dine-In
import { TableSelectModal, TablesView } from "./features/tables"

// Feature: Payment & Receipts
import { PaymentModal, ReceiptModal } from "./features/payment"

// Other Views
import { DashboardView } from "./features/dashboard"
import { KitchenView } from "./features/kitchen"
import { PaymentsView } from "./features/payments-history"
import { InventoryView } from "./features/inventory"
import { ReportsView } from "./features/reports"
import { EmployeesView } from "./features/employees"
import { SettingsView } from "./features/settings"

// API, Config & Types
import {
  createOrder,
  fetchMenuCategories,
  fetchMenuItems,
  fetchOrderById,
  fetchOrders,
  fetchTables,
  payOrder,
  updateTableStatus,
  type OrderResponse,
} from "./api"
import { DEV_COMPANY_ID, DEV_STORE_ID } from "./config"
import type { PosView } from "./types/navigation"
import type { OrderItem } from "./types/pos"

export function App() {
  const [currentView, setCurrentView] = useState<PosView>("ORDERS")
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("ALL")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Modals state
  const [savedOrdersModalOpen, setSavedOrdersModalOpen] = useState(false)
  const [tableModalOpen, setTableModalOpen] = useState(false)
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

  // Pure Cart Hook
  const cart = useOrderCart()
  const queryClient = useQueryClient()

  // Queries
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

  const tables = tablesQuery.data ?? []
  const openOrders = openOrdersQuery.data ?? []
  const completedOrders = completedOrdersQuery.data ?? []
  const allOrders = [...openOrders, ...completedOrders]
  const products = menuItemsQuery.data ?? []

  // Auto-dismiss notification timer
  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => setSuccessMessage(null), 5000)
    return () => clearTimeout(timer)
  }, [successMessage])

  // Create Order Mutation
  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (result) => {
      const savedTableName = cart.selectedTable?.table_number
      cart.clearCart()
      cart.setLastOrderNumber(result.order_number)
      cart.setCartDrawerOpen(false)

      if (savedTableName) {
        setSuccessMessage(`Pesanan disimpan ke Meja ${savedTableName} (#${result.order_number})! Meja kini terisi.`)
      } else {
        setSuccessMessage(`Pesanan #${result.order_number} berhasil disimpan!`)
      }
      queryClient.invalidateQueries({ queryKey: ["menu-items"] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["tables"] })
    },
  })

  // Handlers
  const handleSaveOrder = () => {
    if (cart.orderItems.length === 0) return

    if (cart.orderType === "DINE_IN" && !cart.selectedTable) {
      setTableModalOpen(true)
      return
    }

    createOrderMutation.mutate({
      company_id: DEV_COMPANY_ID,
      store_id: DEV_STORE_ID,
      table_id: cart.orderType === "DINE_IN" ? cart.selectedTable?.id : undefined,
      order_type: cart.orderType,
      order_source: "POS",
      items: cart.orderItems.map((item) => ({
        menu_item_id: item.menuItemId,
        item_name: item.name,
        sku: item.sku,
        quantity: item.qty,
        unit_price: item.price,
        notes: item.notes || null,
      })),
    })
  }

  const handleSelectSavedOrder = (order: OrderResponse, items: OrderItem[]) => {
    cart.loadSavedOrder(order, items, tables)
    setSuccessMessage(`Order #${order.order_number} dimuat ke kasir. Siap dibayar!`)
  }

  const handleLoadOrderFromDashboard = async (order: OrderResponse) => {
    try {
      const fullOrder = await fetchOrderById(order.id, DEV_COMPANY_ID, DEV_STORE_ID)
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
      const fullOrder = await fetchOrderById(order.id, DEV_COMPANY_ID, DEV_STORE_ID)
      const items: OrderItem[] = (fullOrder.items ?? []).map((item) => ({
        menuItemId: item.menu_item_id,
        sku: item.sku,
        name: item.item_name,
        price: item.unit_price,
        qty: item.quantity,
        notes: item.notes ?? undefined,
      }))
      const targetTableNumber = fullOrder.table_id
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

  const handleConfirmPayment = async (paymentMethod: "CASH" | "QRIS", amountPaid: number) => {
    if (cart.orderItems.length === 0) return

    setIsProcessingPayment(true)
    try {
      let targetOrderId = cart.activeOrderId
      let targetOrderNumber = cart.lastOrderNumber
      const targetOrderType = cart.orderType
      const finalSubtotal = cart.subtotal
      const finalTotal = cart.total

      // 1. Create order if fresh cart
      if (!targetOrderId) {
        const created = await createOrder({
          company_id: DEV_COMPANY_ID,
          store_id: DEV_STORE_ID,
          table_id: cart.orderType === "DINE_IN" ? cart.selectedTable?.id : undefined,
          order_type: cart.orderType,
          order_source: "POS",
          items: cart.orderItems.map((item) => ({
            menu_item_id: item.menuItemId,
            item_name: item.name,
            sku: item.sku,
            quantity: item.qty,
            unit_price: item.price,
            notes: item.notes || null,
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
        cart.selectedTable?.table_number ||
        (paidOrder.table_id ? tables.find((t) => t.id === paidOrder.table_id)?.table_number : undefined)

      const changeAmount = amountPaid - paidOrder.total_amount
      setReceiptData({
        orderNumber: paidOrder.order_number || targetOrderNumber || "ORD-DONE",
        orderType: paidOrder.order_type || targetOrderType,
        tableNumber: targetTableNumber,
        items: [...cart.orderItems],
        subtotal: paidOrder.subtotal || finalSubtotal,
        totalAmount: paidOrder.total_amount || finalTotal,
        paymentMethod,
        amountPaid,
        change: changeAmount,
      })

      // 4. Invalidate & reset
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["tables"] })
      setPaymentModalOpen(false)
      cart.setCartDrawerOpen(false)
      setReceiptModalOpen(true)
      cart.clearCart()
      setSuccessMessage(null)
    } catch (err) {
      alert(`Pembayaran gagal: ${(err as Error).message}`)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Filter Catalog Products
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

  // Shared Cart & Checkout Panel UI (used in both desktop sidebar & mobile drawer)
  const renderCartContent = () => (
    <>
      {successMessage && (
        <div className="mx-3 mt-3 flex shrink-0 items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 shadow-2xs">
          <div className="flex min-w-0 items-center gap-2 pr-1">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-bold text-white shadow-2xs">
              ✓
            </span>
            <span className="truncate" title={successMessage}>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="ml-2 shrink-0 font-bold text-emerald-700 hover:text-emerald-950 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Header: Order Info + DINE IN / TAKEAWAY Toggle */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4">
        <div className="min-w-0 flex-1 pr-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="shrink-0 text-sm font-extrabold uppercase tracking-tight text-slate-900">
              Current Order
            </span>
            {cart.activeOrderId && (
              <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-700">
                RECALLED
              </span>
            )}
          </div>

          <div className="mt-0.5 flex min-w-0 items-center gap-2 text-[10px] font-medium text-slate-400">
            <span
              className="truncate max-w-30"
              title={cart.lastOrderNumber ? `Order: ${cart.lastOrderNumber}` : "New Order"}
            >
              {cart.lastOrderNumber ? `#${cart.lastOrderNumber}` : "New Order"}
            </span>
            <span className="text-slate-300">•</span>
          </div>
        </div>

        <div className="flex shrink-0 rounded-lg border border-slate-200 bg-slate-100 p-0.5">
          <button
            type="button"
            onClick={() => cart.setOrderType("DINE_IN")}
            className={`rounded-md px-2.5 py-1 text-[10px] font-bold whitespace-nowrap transition-all duration-200 active:scale-[0.98] cursor-pointer ${
              cart.orderType === "DINE_IN"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            DINE IN
          </button>
          <button
            type="button"
            onClick={() => {
              cart.setOrderType("TAKEAWAY")
              cart.setSelectedTable(null)
            }}
            className={`rounded-md px-2.5 py-1 text-[10px] font-bold whitespace-nowrap transition-all duration-200 active:scale-[0.98] cursor-pointer ${
              cart.orderType === "TAKEAWAY"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            TAKEAWAY
          </button>
        </div>
      </div>

      {/* Dine In Table Selector Strip */}
      {cart.orderType === "DINE_IN" && (
        <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50/60 px-4 py-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Table2 size={14} strokeWidth={2} className="text-blue-600" />
            <span className="text-slate-500 font-medium">Meja:</span>
            <span
              className={
                cart.selectedTable
                  ? "font-extrabold text-blue-700"
                  : "font-normal italic text-slate-400"
              }
            >
              {cart.selectedTable ? cart.selectedTable.table_number : "Belum dipilih"}
            </span>
            {cart.selectedTable && (
              <span className="text-[10px] font-medium text-slate-400">
                ({cart.selectedTable.capacity} Kursi)
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setTableModalOpen(true)}
            className="rounded-lg border border-blue-200/80 bg-white px-2.5 py-1 text-[11px] font-bold text-blue-600 shadow-2xs transition-all duration-200 hover:bg-blue-50 active:scale-[0.98] cursor-pointer"
          >
            {cart.selectedTable ? "Ganti" : "Pilih Meja"}
          </button>
        </div>
      )}

      {/* Cart Items List */}
      <OrderPanel
        items={cart.orderItems}
        onIncrease={cart.increaseItem}
        onDecrease={cart.decreaseItem}
        onRemove={cart.removeItem}
        onUpdateNotes={cart.updateItemNotes}
      />

      {/* Pricing Summary */}
      <OrderSummary
        subtotal={cart.subtotal}
        tax={cart.tax}
        total={cart.total}
      />

      {createOrderMutation.isError && (
        <div className="border-t border-red-200 bg-red-50 p-2 text-xs font-semibold text-red-600">
          Failed to save order: {(createOrderMutation.error as Error).message}
        </div>
      )}

      {/* Cart Action Buttons */}
      <OrderActions
        total={cart.total}
        disabled={cart.orderItems.length === 0 || createOrderMutation.isPending || isProcessingPayment}
        isSaving={createOrderMutation.isPending}
        saveLabel={
          cart.orderType === "DINE_IN"
            ? (cart.selectedTable ? `Simpan Meja ${cart.selectedTable.table_number}` : "Simpan Meja")
            : "Simpan Pesanan"
        }
        onSaveOrder={handleSaveOrder}
        onPayOrder={() => setPaymentModalOpen(true)}
        onClearOrder={() => {
          cart.clearCart()
          setSuccessMessage(null)
        }}
      />
    </>
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* TopBar */}
      <TopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSavedOrders={() => setSavedOrdersModalOpen(true)}
        openOrdersCount={openOrders.length}
        onToggleMobileNav={() => setMobileNavOpen(true)}
        cartItemCount={cart.itemCount}
        onOpenMobileCart={() => cart.setCartDrawerOpen(true)}
        currentView={currentView}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Desktop Persistent Sidebar */}
        <Sidebar
          activeView={currentView}
          onViewChange={setCurrentView}
        />

        {/* Mobile Navigation Drawer */}
        <MobileNavDrawer
          opened={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          activeView={currentView}
          onViewChange={setCurrentView}
        />

        {/* View Content Area */}
        {currentView === "ORDERS" && (
          <main className="flex min-w-0 flex-1 overflow-hidden">
            {/* Catalog Section */}
            <section className="flex min-w-0 flex-1 flex-col overflow-y-auto border-r border-slate-200 bg-slate-50/30 pb-20 lg:pb-0">
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-5">
                <div>
                  <div className="text-sm font-extrabold uppercase tracking-tight text-slate-900">
                    Katalog Produk
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] font-semibold tracking-wider text-slate-400">
                    {filteredProducts.length} DARI {products.length} PRODUK TERSEDIA
                  </div>
                </div>

                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-2xs">
                  STORE STOCK
                </span>
              </div>

              <div className="border-b border-slate-200 bg-white px-4 py-2.5">
                <CategoryTabs
                  categories={categoryTabs}
                  activeCategoryId={activeCategory}
                  onSelectCategory={setActiveCategory}
                />
              </div>

              {menuItemsQuery.isLoading && (
                <div className="p-6 text-xs font-semibold text-slate-400">
                  Memuat katalog menu...
                </div>
              )}

              {menuItemsQuery.isError && (
                <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-600">
                  Gagal memuat menu: {(menuItemsQuery.error as Error).message}
                </div>
              )}

              {menuItemsQuery.isSuccess && filteredProducts.length === 0 && (
                <div className="p-12 text-center text-xs font-semibold text-slate-400">
                  Tidak ada produk yang cocok dengan pencarian atau filter kategori.
                </div>
              )}

              {menuItemsQuery.isSuccess && filteredProducts.length > 0 && (
                <ProductGrid
                  products={filteredProducts}
                  onAddProduct={(p) => {
                    cart.addProduct(p)
                    setSuccessMessage(null)
                  }}
                />
              )}
            </section>

            {/* Desktop Cart Aside (Always visible on lg screen) */}
            <aside className="hidden lg:flex w-95 shrink-0 min-h-0 flex-col bg-white">
              {renderCartContent()}
            </aside>

            {/* Mobile Bottom Floating Cart Bar */}
            <CartFloatingBar
              itemCount={cart.itemCount}
              total={cart.total}
              onOpenCart={() => cart.setCartDrawerOpen(true)}
            />

            {/* Mobile / Tablet Cart Drawer */}
            <CartDrawer
              opened={cart.cartDrawerOpen}
              onClose={() => cart.setCartDrawerOpen(false)}
            >
              {renderCartContent()}
            </CartDrawer>
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
            openOrders={openOrders}
            selectedTableId={cart.selectedTable?.id ?? null}
            onSelectTableForOrder={(table) => {
              cart.setSelectedTable(table)
              cart.setOrderType("DINE_IN")
              setCurrentView("ORDERS")
            }}
            onSelectOrder={handleLoadOrderFromDashboard}
            onReleaseTable={async (tableId) => {
              try {
                await updateTableStatus(tableId, {
                  company_id: DEV_COMPANY_ID,
                  store_id: DEV_STORE_ID,
                  status: "AVAILABLE",
                })
                queryClient.invalidateQueries({ queryKey: ["tables"] })
              } catch (err) {
                alert(`Gagal merilis status meja: ${(err as Error).message}`)
              }
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

      {/* Global Modals */}
      <SavedOrdersModal
        opened={savedOrdersModalOpen}
        onClose={() => setSavedOrdersModalOpen(false)}
        onSelectOrder={handleSelectSavedOrder}
      />

      <TableSelectModal
        opened={tableModalOpen}
        onClose={() => setTableModalOpen(false)}
        tables={tables}
        openOrders={openOrders}
        selectedTableId={cart.selectedTable?.id ?? null}
        onSelectTable={(tbl) => {
          cart.setSelectedTable(tbl)
          cart.setOrderType("DINE_IN")
        }}
        onSelectOrder={(order) => {
          handleLoadOrderFromDashboard(order)
          setTableModalOpen(false)
        }}
        onClearTable={() => cart.setSelectedTable(null)}
      />

      <PaymentModal
        opened={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        totalAmount={cart.total}
        orderNumber={cart.lastOrderNumber ?? undefined}
        itemsCount={cart.orderItems.length}
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
