import { useState } from "react"
import type { OrderItem, Product, Table } from "../../../types/pos"
import type { OrderResponse } from "../../../api"

export function useOrderCart() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKEAWAY">("DINE_IN")
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
  const [activeOrderIds, setActiveOrderIds] = useState<string[]>([])
  const [lastOrderNumber, setLastOrderNumber] = useState<string | null>(null)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)

  const addProduct = (product: Product) => {
    if (product.stock !== undefined && product.stock <= 0) {
      return
    }

    setOrderItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.menuItemId === product.id,
      )

      if (existingItem) {
        if (product.stock !== undefined && existingItem.qty >= product.stock) {
          return currentItems
        }
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

  const increaseItem = (index: number) => {
    setOrderItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, qty: item.qty + 1 } : item,
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

  const updateItemNotes = (index: number, notes: string) => {
    setOrderItems((currentItems) => 
     currentItems.map((item, itemIndex) =>
      itemIndex === index ? {...item, notes} : item,
    ),
   )
  }

  const clearCart = () => {
    setOrderItems([])
    setActiveOrderId(null)
    setActiveOrderIds([])
    setSelectedTable(null)
    setLastOrderNumber(null)
  }

  const loadSavedOrder = (
    order: OrderResponse,
    items: OrderItem[],
    tables: Table[] = [],
  ) => {
    setActiveOrderId(order.id)
    setActiveOrderIds([order.id])
    setLastOrderNumber(order.order_number)
    setOrderType(order.order_type as "DINE_IN" | "TAKEAWAY")
    if (order.table_id) {
      const foundTable = tables.find((t) => t.id === order.table_id) ?? null
      setSelectedTable(foundTable)
    } else {
      setSelectedTable(null)
    }
    setOrderItems(items)
  }

  const loadTableSession = (
    table: Table,
    orders: OrderResponse[],
    items: OrderItem[],
  ) => {
    setActiveOrderId(orders[0]?.id ?? null)
    setActiveOrderIds(orders.map((o) => o.id))
    const orderNumbers = orders.map((o) => `#${o.order_number}`).join(", ")
    setLastOrderNumber(orderNumbers)
    setOrderType("DINE_IN")
    setSelectedTable(table)
    setOrderItems(items)
  }

  const itemCount = orderItems.reduce((acc, item) => acc + item.qty, 0)
  const subtotal = orderItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  )
  const tax = subtotal * 0.1
  const total = subtotal + tax

  return {
    orderItems,
    setOrderItems,
    orderType,
    setOrderType,
    selectedTable,
    setSelectedTable,
    activeOrderId,
    setActiveOrderId,
    activeOrderIds,
    setActiveOrderIds,
    lastOrderNumber,
    setLastOrderNumber,
    cartDrawerOpen,
    setCartDrawerOpen,
    addProduct,
    increaseItem,
    decreaseItem,
    removeItem,
    updateItemNotes,
    clearCart,
    loadSavedOrder,
    loadTableSession,
    itemCount,
    subtotal,
    tax,
    total,
  }
}

