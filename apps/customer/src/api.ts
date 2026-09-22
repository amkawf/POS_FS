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

  const data: OrderResponse = await response.json()
  return data
}

export async function fetchActiveOrdersByTable(
  companyId: string,
  storeId: string,
  tableId: string,
): Promise<OrderResponse[]> {
  // 1. Cari semua pesanan yang statusnya OPEN di toko ini untuk meja tersebut
  const url = new URL(`${API_BASE_URL}/orders`)
  url.searchParams.set("company_id", companyId)
  url.searchParams.set("store_id", storeId)
  url.searchParams.set("status", "OPEN")

  const response = await fetch(url)
  if (!response.ok) return []

  const data: { orders: OrderResponse[] } = await response.json()
  const tableOrders = (data.orders || []).filter((o) => o.table_id === tableId)
  if (tableOrders.length === 0) return []

  // 2. Ambil rincian lengkap pesanan (beserta daftar items) untuk setiap kloter pesanan secara paralel
  const detailPromises = tableOrders.map(async (ord) => {
    try {
      const detailUrl = new URL(`${API_BASE_URL}/orders/${ord.id}`)
      detailUrl.searchParams.set("company_id", companyId)
      detailUrl.searchParams.set("store_id", storeId)

      const detailRes = await fetch(detailUrl)
      if (!detailRes.ok) return ord
      return (await detailRes.json()) as OrderResponse
    } catch {
      return ord
    }
  })

  const results = await Promise.all(detailPromises)
  // Urutkan dari kloter paling awal ke paling baru (opened_at asc)
  return results.sort(
    (a, b) => new Date(a.opened_at).getTime() - new Date(b.opened_at).getTime(),
  )
}

