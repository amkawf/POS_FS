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
  fulfillment_type?: "BATCH_COOKING" | "MADE_TO_ORDER"
}

export type OrderItem = {
  menuItemId: string
  sku: string
  name: string
  price: number
  qty: number
  notes?: string
}

export type Ingredient = {
  id: string
  company_id: string
  code?: string
  name: string
  unit: string
  min_stock_alert: number
  stock?: number
}

export type RecipeItem = {
  id?: string
  menu_item_id: string
  ingredient_id: string
  ingredient_name?: string
  ingredient_unit?: string
  quantity_per_portion: number
}