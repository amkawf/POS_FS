import { Sidebar } from "./components/SideBar"
import { TopBar } from "./components/TopBar"
import { CategoryTabs } from "./components/catalog/CategoryTabs"
import { ProductGrid } from "./components/catalog/ProductGrid"
import { OrderActions } from "./components/order/OrderAction"
import { OrderPanel } from "./components/order/OrderPanel"
import { OrderSummary } from "./components/order/OrderSummary"
import { categories, orderItems as initialOrderItems, products } from "./data/dummy"
import { useState } from "react"

function App() {
  const [orderItems, setOrderItems] = useState(initialOrderItems)
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
  const subtotal = orderItems.reduce(
    (total, item) => total + item.price * item.qty,
    0,
  )

  const tax = subtotal * 0.1
  const total = subtotal + tax

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopBar />

      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar />

        <main className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_380px]">
          <section className="min-w-0 border-r border-slate-200">
            <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
              <div>
                <div className="text-sm font-extrabold uppercase tracking-tight">
                  Product Catalog
                </div>

                <div className="mt-0.5 text-[10px] font-semibold text-slate-400">
                  {products.length} PRODUCTS AVAILABLE
                </div>
              </div>

              <div className="text-[10px] font-bold text-slate-400">
                STORE STOCK
              </div>
            </div>

            <div className="border-b border-slate-200 bg-white px-4 py-3">
              <CategoryTabs categories={categories} />
            </div>

            <ProductGrid
  products={products}
  onAddProduct={(product) => {
    setOrderItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.name === product.name,
      )

      if (existingItem) {
        return currentItems.map((item) =>
          item.name === product.name
            ? { ...item, qty: item.qty + 1 }
            : item,
        )
      }

      return [
        ...currentItems,
        {
          name: product.name,
          price: product.price,
          qty: 1,
        },
      ]
    })
  }}
/>
          </section>

          <aside className="flex min-h-0 flex-col bg-white">
            <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
              <div>
                <div className="text-sm font-extrabold uppercase tracking-tight">
                  Current Order
                </div>

                <div className="mt-0.5 text-[10px] font-semibold text-slate-400">
                  #ORD-20260902-001
                </div>
              </div>

              <div className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">
                DINE IN
              </div>
            </div>

            <OrderPanel items={orderItems} />

            <OrderSummary
              subtotal={subtotal}
              tax={tax}
              total={total}
            />

            <OrderActions
  total={total}
  onSaveOrder={() => {
    console.log("Save order:", orderItems)
  }}
  onClearOrder={() => {
    console.log("Clear order")
  }}
/>
          </aside>
        </main>
      </div>
    </div>
  )
}

export default App