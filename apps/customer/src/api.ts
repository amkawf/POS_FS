import { API_BASE_URL } from "./config"
import type { Category, Product, Table, CreateCustomerOrderPayload, OrderResponse } from "./types"

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

export async function fetchMenuItems(companyId: string, storeId?: string): Promise<Product[]> {
  const url = new URL(`${API_BASE_URL}/menu-items`)
  url.searchParams.set("company_id", companyId)
  if (storeId) {
    url.searchParams.set("store_id", storeId)
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
    stock: item.stock,
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

export async function fetchTables(companyId: string, storeId: string): Promise<Table[]> {
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

export async function submitCustomerOrder(payload: CreateCustomerOrderPayload): Promise<OrderResponse> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    await parseErrorResponse(response)
  }

  const data: { order: OrderResponse } = await response.json()
  return data.order
}

