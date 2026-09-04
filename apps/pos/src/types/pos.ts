export type Product = {
  id: string
  sku: string
  name: string
  price: number
}

export type OrderItem = {
  menuItemId: string
  sku: string
  name: string
  price: number
  qty: number
}
