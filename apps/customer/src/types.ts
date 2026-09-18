export type Product = {
  id: string
  sku: string
  name: string
  price: number
  stock?: number
  categoryIds?: string[]
  fulfillment_type?: "BATCH_COOKING" | "MADE_TO_ORDER"
}

export type Category = {
  id: string
  name: string
  code?: string
}

export type Table = {
  id: string
  company_id: string
  store_id: string
  table_number: string
  capacity: number
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "INACTIVE"
}

export type CustomerCartItem = {
  menuItemId: string
  sku: string
  name: string
  price: number
  qty: number
  notes?: string
}

export type CreateCustomerOrderPayload = {
  company_id: string
  store_id: string
  table_id: string
  order_type: "DINE_IN"
  order_source: "QR"
  customer_name?: string
  notes?: string
  created_by?: null
  items: {
    menu_item_id: string
    item_name: string
    sku: string
    quantity: number
    unit_price: number
    notes?: string
  }[]
}

export type OrderResponse = {
  id: string
  company_id: string
  store_id: string
  table_id?: string
  order_number: string
  order_type: string
  order_source: string
  status: string
  customer_name?: string
  items: {
    id: string
    order_id: string
    menu_item_id: string
    item_name: string
    sku: string
    quantity: number
    unit_price: number
    total_amount: number
    notes?: string
  }[]
  subtotal: number
  discount_amount: number
  tax_amount: number
  service_amount: number
  total_amount: number
  notes?: string
  opened_at: string
}

