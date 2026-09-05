export type Category = {
  id: string
  menu_id?: string
  name: string
  sort_order?: number
}

export type Product = {
  id: string
  sku: string
  name: string
  price: number
  categoryIds?: string[]
}

export type OrderItem = {
  menuItemId: string
  sku: string
  name: string
  price: number
  qty: number
}
