import { API_BASE_URL } from "../config"
import type { Category, Product, Table } from "../types/pos"

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
}

export async function fetchMenuItems(companyId: string): Promise<Product[]> {
  const url = new URL(`${API_BASE_URL}/menu-items`)
  url.searchParams.set("company_id", companyId)

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


