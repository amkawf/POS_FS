import { API_BASE_URL } from "../config"
// Ganti baris 2 menjadi ini (tanpa Ingredient dan RecipeItem):
import type { Category, Product, Table, Role, User, CashierShift } from "../types/pos"

export class ApiError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

async function parseErrorResponse(response: Response): Promise<never> {
  const body = await response.json().catch(() => null)
  const code = body?.error?.code ?? "UNKNOWN_ERROR"
  const message = body?.error?.message ?? response.statusText
  throw new ApiError(code, message)
}

type MenuItemResponse = {
  id: string
  sku: string
  name: string
  description?: string
  base_price: number
  category_ids?: string[]
  stock?: number
  fulfillment_type?: "BATCH_COOKING" | "MADE_TO_ORDER" 
}

export async function fetchMenuItems(companyId: string, storeId?: string): Promise<Product[]> { // Terima storeId
  const url = new URL(`${API_BASE_URL}/menu-items`)
  url.searchParams.set("company_id", companyId)
  if (storeId) {
    url.searchParams.set("store_id", storeId) // Kirim store_id jika ada
  }
  const response = await fetch(url)
  if (!response.ok) {
    await parseErrorResponse(response)
  }
  const data: { items: MenuItemResponse[] } = await response.json()
  return data.items.map((item) => ({
    id: item.id,
    sku: item.sku,
    name: item.name,
    price: item.base_price,
    categoryIds: item.category_ids ?? [],
    stock: item.stock, //  Teruskan ke Product
    fulfillment_type: item.fulfillment_type,
  }))
}

export async function fetchMenuCategories(companyId: string): Promise<Category[]> {
  const url = new URL(`${API_BASE_URL}/menu-categories`)
  url.searchParams.set("company_id", companyId)

  const response = await fetch(url)

  if (!response.ok) {
    await parseErrorResponse(response)
  }

  const data: { categories: Category[] } = await response.json()
  return data.categories
}

export async function fetchTables(
  companyId: string,
  storeId: string,
): Promise<Table[]> {
  const url = new URL(`${API_BASE_URL}/tables`)
  url.searchParams.set("company_id", companyId)
  url.searchParams.set("store_id", storeId)

  const response = await fetch(url)
  if (!response.ok) {
    await parseErrorResponse(response)
  }

  const data: { tables: Table[] } = await response.json()
  return data.tables
}

export async function updateTableStatus(
  tableId: string,
  payload: { company_id: string; store_id: string; status: string },
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tables/${tableId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    await parseErrorResponse(response)
  }
}

export type CreateOrderItemPayload = {
  menu_item_id: string
  item_name: string
  sku: string
  quantity: number
  unit_price: number
  notes?: string | null
}

export type CreateOrderPayload = {
  company_id: string
  store_id: string
  table_id?: string
  order_type: string
  order_source: string
  created_by?: string 
  items: CreateOrderItemPayload[]
}

export type CreateOrderResult = {
  id: string
  company_id: string
  store_id: string
  table_id?: string
  order_number: string
  status: string
  subtotal: number
  total_amount: number
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<CreateOrderResult> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    await parseErrorResponse(response)
  }

  return response.json()
}

export type OrderItemResponse = {
  id: string
  order_id: string
  menu_item_id: string
  item_name: string
  sku: string
  quantity: number
  unit_price: number
  modifier_amount: number
  discount_amount: number
  tax_amount: number
  total_amount: number
  notes?: string
  status: string
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
  created_by?: string
  subtotal: number
  discount_amount: number
  tax_amount: number
  service_amount: number
  total_amount: number
  notes?: string
  opened_at: string
  items?: OrderItemResponse[]
}

export async function fetchOrders(
  companyId: string,
  storeId: string,
  status?: string,
): Promise<OrderResponse[]> {
  const url = new URL(`${API_BASE_URL}/orders`)
  url.searchParams.set("company_id", companyId)
  url.searchParams.set("store_id", storeId)
  if (status) {
    url.searchParams.set("status", status)
  }

  const response = await fetch(url)
  if (!response.ok) {
    await parseErrorResponse(response)
  }

  const data: { orders: OrderResponse[] } = await response.json()
  return data.orders
}

export async function fetchOrderById(
  id: string,
  companyId: string,
  storeId: string,
): Promise<OrderResponse> {
  const url = new URL(`${API_BASE_URL}/orders/${id}`)
  url.searchParams.set("company_id", companyId)
  url.searchParams.set("store_id", storeId)

  const response = await fetch(url)
  if (!response.ok) {
    await parseErrorResponse(response)
  }

  return response.json()
}

export type PayOrderPayload = {
  company_id: string
  store_id: string
  payment_method: string
  amount_paid: number
  notes?: string
}

export async function payOrder(
  id: string,
  payload: PayOrderPayload,
): Promise<OrderResponse> {
  const response = await fetch(`${API_BASE_URL}/orders/${id}/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    await parseErrorResponse(response)
  }

  return response.json()
}

export async function deleteOrder(
  id: string,
  companyId: string,
  storeId: string,
): Promise<{ message: string }> {
  const url = new URL(`${API_BASE_URL}/orders/${id}`)
  url.searchParams.set("company_id", companyId)
  url.searchParams.set("store_id", storeId)

  const response = await fetch(url, {
    method: "DELETE",
  })

  if (!response.ok) {
    await parseErrorResponse(response)
  }

  return response.json()
}

export type KitchenTicketItemResponse = {
  id: string
  ticket_id: string
  order_item_id?: string
  menu_item_id: string
  item_name: string
  sku: string
  quantity: number
  notes?: string
  status: "PENDING" | "PREPARING" | "READY" | "SERVED" | "CANCELLED"
  created_at: string
  updated_at: string
}

export type KitchenTicketResponse = {
  id: string
  company_id: string
  store_id: string
  order_id: string
  order_number: string
  order_type: string
  table_id?: string
  table_number?: string
  status: "PENDING" | "PREPARING" | "READY" | "SERVED" | "CANCELLED"
  priority: "NORMAL" | "RUSH" | "VIP"
  notes?: string
  items: KitchenTicketItemResponse[]
  created_at: string
  updated_at: string
  started_at?: string
  ready_at?: string
  served_at?: string
}

export async function fetchKitchenTickets(
  companyId: string,
  storeId: string,
  status?: string,
): Promise<KitchenTicketResponse[]> {
  const url = new URL(`${API_BASE_URL}/kitchen/tickets`)
  url.searchParams.set("company_id", companyId)
  url.searchParams.set("store_id", storeId)
  if (status && status !== "ALL") {
    url.searchParams.set("status", status)
  }

  const response = await fetch(url)
  if (!response.ok) {
    await parseErrorResponse(response)
  }

  const data: { tickets: KitchenTicketResponse[] } = await response.json()
  return data.tickets
}

export type UpdateKitchenTicketStatusPayload = {
  company_id: string
  store_id: string
  status: "PENDING" | "PREPARING" | "READY" | "SERVED" | "CANCELLED"
}

export async function updateKitchenTicketStatus(
  id: string,
  payload: UpdateKitchenTicketStatusPayload,
): Promise<KitchenTicketResponse> {
  const response = await fetch(`${API_BASE_URL}/kitchen/tickets/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    await parseErrorResponse(response)
  }

  return response.json()
}


export type AdjustStockPayload = {
  company_id: string
  store_id: string
  menu_item_id: string
  quantity: number
  notes?: string
}

export async function adjustStock(payload: AdjustStockPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/inventory/adjust`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    await parseErrorResponse(response)
  }
}

// ==========================================
// 1. API BAHAN BAKU (INGREDIENTS)
// ==========================================

export type Ingredient = {
  id: string
  company_id: string
  code?: string
  name: string
  unit: string
  min_stock_alert: number
  stock?: number
}

// Mengambil daftar bahan baku beserta stok toko saat ini
export async function fetchIngredients(companyId: string, storeId: string): Promise<Ingredient[]> {
  const url = new URL(`${API_BASE_URL}/ingredients`)
  url.searchParams.set("company_id", companyId)
  url.searchParams.set("store_id", storeId)

  const response = await fetch(url)
  if (!response.ok) {
    await parseErrorResponse(response)
  }

  const data: { ingredients: Ingredient[] } = await response.json()
  return data.ingredients
}

// Pendaftaran master bahan baku baru
export type CreateIngredientPayload = {
  company_id: string
  code?: string
  name: string
  unit: string
  min_stock_alert?: number
}

export async function createIngredient(payload: CreateIngredientPayload): Promise<Ingredient> {
  const response = await fetch(`${API_BASE_URL}/ingredients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    await parseErrorResponse(response)
  }

  return response.json()
}

// Pencatatan belanja bahan baku masuk (Restock)
export type RestockIngredientPayload = {
  company_id: string
  store_id: string
  ingredient_id: string
  quantity: number
  notes?: string
}

export async function restockIngredient(payload: RestockIngredientPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/ingredients/restock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    await parseErrorResponse(response)
  }
}

// ==========================================
// 2. API RESEP (RECIPE / BOM)
// ==========================================

export type RecipeItem = {
  id?: string
  menu_item_id: string
  ingredient_id: string
  ingredient_name?: string
  ingredient_unit?: string
  quantity_per_portion: number
}

// Mengambil takaran resep untuk 1 menu
export async function fetchRecipeByMenuItem(menuItemId: string): Promise<RecipeItem[]> {
  const response = await fetch(`${API_BASE_URL}/recipes/${menuItemId}`)
  if (!response.ok) {
    await parseErrorResponse(response)
  }

  const data: { items: RecipeItem[] } = await response.json()
  return data.items ?? []
}

// Menyimpan komposisi resep baru untuk 1 menu
export async function saveRecipe(
  menuItemId: string,
  items: { ingredient_id: string; quantity_per_portion: number }[],
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/recipes/${menuItemId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  })

  if (!response.ok) {
    await parseErrorResponse(response)
  }
}

// ==========================================
// 3. API BUAT MENU BARU (CREATE MENU ITEM)
// ==========================================

export type CreateMenuItemPayload = {
  company_id: string
  sku: string
  name: string
  description?: string
  base_price: number
  category_ids?: string[]
  fulfillment_type?: "BATCH_COOKING" | "MADE_TO_ORDER"
}

export async function createMenuItem(payload: CreateMenuItemPayload): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/menu-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    await parseErrorResponse(response)
  }

  const item = await response.json()
  return {
    id: item.id,
    sku: item.sku,
    name: item.name,
    price: item.base_price,
    categoryIds: item.category_ids ?? [],
    stock: item.stock,
  }
}

// ==========================================
// 4. API PRODUKSI DAPUR (BATCH COOKING)
// ==========================================

export type BatchProducePayload = {
  company_id: string
  store_id: string
  menu_item_id: string
  portions: number
  notes?: string
}

export async function batchProduce(payload: BatchProducePayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/kitchen/produce`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    await parseErrorResponse(response)
  }
}

// ==========================================
// TIPE & FUNGSI UPDATE BAHAN BAKU
// ==========================================

// Payload untuk memperbarui atribut master bahan baku
export type UpdateIngredientPayload = {
  company_id: string
  code?: string
  name: string
  unit: string
  min_stock_alert?: number
}

// Memanggil endpoint PUT /api/v1/ingredients/:id
export async function updateIngredient(
  id: string,
  payload: UpdateIngredientPayload,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/ingredients/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    await parseErrorResponse(response)
  }
}

// ==========================================
// 5. API AUTENTIKASI STAF & POS SHIFT
// ==========================================

export type PinLoginPayload = {
  store_id: string
  pin: string
}

export type PinLoginResponse = {
  user: User
  token: string
  active_shift?: CashierShift
}

// 1. Verifikasi PIN kasir/koki
export async function pinLogin(payload: PinLoginPayload): Promise<PinLoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/pin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    await parseErrorResponse(response)
  }

  return response.json()
}

export type StaffProfile = {
  id: string
  name: string
  role: Role
}

// 2. Mengambil daftar nama staf di toko (untuk tampilan avatar layar kunci)
export async function fetchStoreStaff(storeId: string): Promise<StaffProfile[]> {
  const response = await fetch(`${API_BASE_URL}/auth/staff?store_id=${storeId}`)
  if (!response.ok) {
    await parseErrorResponse(response)
  }
  const data: { staff: StaffProfile[] } = await response.json()
  return data.staff ?? []
}

export type OpenShiftPayload = {
  company_id: string
  store_id: string
  user_id: string
  starting_cash: number
}

// 3. Membuka laci kasir (Modal Awal)
export async function openCashierShift(payload: OpenShiftPayload): Promise<CashierShift> {
  const response = await fetch(`${API_BASE_URL}/auth/shifts/open`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    await parseErrorResponse(response)
  }

  return response.json()
}

export type CloseShiftPayload = {
  shift_id: string
  actual_ending_cash: number
  expected_ending_cash: number
  notes?: string
}

// 4. Menutup laci kasir & rekonsiliasi kas
export async function closeCashierShift(payload: CloseShiftPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/shifts/close`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    await parseErrorResponse(response)
  }
}

// ==========================================
// API PENGHAPUSAN (DELETE OPERATIONS)
// ==========================================

// Menghapus bahan baku fisik dari database
export async function deleteIngredient(
  id: string,
  companyId: string,
): Promise<{ message: string }> {
  const url = new URL(`${API_BASE_URL}/ingredients/${id}`)
  url.searchParams.set("company_id", companyId)

  const response = await fetch(url, {
    method: "DELETE",
  })

  if (!response.ok) {
    await parseErrorResponse(response)
  }

  return response.json()
}

// Menonaktifkan menu makanan (Soft Delete)
export async function deleteMenuItem(
  id: string,
  companyId: string,
): Promise<{ message: string }> {
  const url = new URL(`${API_BASE_URL}/menu-items/${id}`)
  url.searchParams.set("company_id", companyId)

  const response = await fetch(url, {
    method: "DELETE",
  })

  if (!response.ok) {
    await parseErrorResponse(response)
  }

  return response.json()
}