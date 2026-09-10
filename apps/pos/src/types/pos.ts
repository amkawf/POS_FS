export type Category = {
  id: string
  menu_id?: string
  name: string
  sort_order?: number
}

export type Table = {
  id: string
  company_id: string
  store_id: string
  table_number: string
  capacity: number
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "INACTIVE"
}

export type Product = {
  id: string
  sku: string
  name: string
  price: number
  categoryIds?: string[]
  stock?: number
}

export type OrderItem = {
  menuItemId: string
  sku: string
  name: string
  price: number
  qty: number
  notes?: string
}
