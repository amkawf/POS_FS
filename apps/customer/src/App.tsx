import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  CheckCircle2,
  ChefHat,
  ChevronUp,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  Receipt,
  UtensilsCrossed,
  X,
} from "lucide-react"
import { DEV_COMPANY_ID, DEV_STORE_ID } from "./config"
import { fetchMenuItems, fetchMenuCategories, fetchTables, submitCustomerOrder, fetchActiveOrdersByTable } from "./api"
import type { CustomerCartItem, Product, Table } from "./types"

// Helper format mata uang Rupiah
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function App() {
  // 1. Ambil nomor meja dari URL parameter (?table=01 atau ?t=01)
  const urlParams = new URLSearchParams(window.location.search)
  const tableParam = urlParams.get("table") || urlParams.get("t") || ""

  // State lokal
  const selectedTableNumber = tableParam
  const [customerName, setCustomerName] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CustomerCartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [orderSuccess, setOrderSuccess] = useState<{
    orderNumber: string
    tableNumber: string
    items: CustomerCartItem[]
    total: number
  } | null>(null)

  // 2. Fetch Data dari Backend API
  const { data: menuItems = [], isLoading: isLoadingMenu } = useQuery({
    queryKey: ["customer-menu", DEV_COMPANY_ID, DEV_STORE_ID],
    queryFn: () => fetchMenuItems(DEV_COMPANY_ID, DEV_STORE_ID),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ["customer-categories", DEV_COMPANY_ID],
    queryFn: () => fetchMenuCategories(DEV_COMPANY_ID),
  })

  const { data: tables = [] } = useQuery({
    queryKey: ["customer-tables", DEV_COMPANY_ID, DEV_STORE_ID],
    queryFn: () => fetchTables(DEV_COMPANY_ID, DEV_STORE_ID),
  })

  // Cocokkan meja yang dipilih dengan data meja di database
  const currentTable: Table | undefined = useMemo(() => {
    if (!selectedTableNumber) return undefined

    // 1. Bersihkan kata "meja" dan spasi (misal "Meja 03" atau "03" disederhanakan jadi "03")
    const cleanParam = selectedTableNumber.toLowerCase().replace("meja", "").trim()

    return tables.find((t) => {
      const cleanDb = t.table_number.toLowerCase().replace("meja", "").trim()

      // 2. Cocokkan string teks, angka, atau UUID ID meja
      return (
        cleanDb === cleanParam ||
        parseInt(cleanDb, 10) === parseInt(cleanParam, 10) ||
        t.id === selectedTableNumber
      )
    })
  }, [tables, selectedTableNumber])

  // Hitung total item & harga di keranjang
  const totalItemCount = cart.reduce((acc, it) => acc + it.qty, 0)
  const subtotal = cart.reduce((acc, it) => acc + it.price * it.qty, 0)
  const tax = subtotal * 0.1
  const totalAmount = subtotal + tax

  // Filter katalog produk
  const filteredProducts = useMemo(() => {
    return menuItems.filter((p) => {
      const matchCategory =
        activeCategory === "ALL" || (p.categoryIds && p.categoryIds.includes(activeCategory))
      const matchSearch =
        searchQuery.trim() === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCategory && matchSearch
    })
  }, [menuItems, activeCategory, searchQuery])

  // Operasi Keranjang
  const handleAddToCart = (product: Product) => {
    if (product.stock !== undefined && product.stock <= 0) return

    setCart((prev) => {
      const existing = prev.find((it) => it.menuItemId === product.id)
      if (existing) {
        if (product.stock !== undefined && existing.qty >= product.stock) {
          return prev // Jangan melebihi stok
        }
        return prev.map((it) =>
          it.menuItemId === product.id ? { ...it, qty: it.qty + 1 } : it,
        )
      }
      return [
        ...prev,
        {
          menuItemId: product.id,
          sku: product.sku,
          name: product.name,
          price: product.price,
          qty: 1,
          notes: "",
        },
      ]
    })
  }

  const handleDecreaseItem = (menuItemId: string) => {
    setCart((prev) =>
      prev
        .map((it) => (it.menuItemId === menuItemId ? { ...it, qty: it.qty - 1 } : it))
        .filter((it) => it.qty > 0),
    )
  }

  const handleUpdateItemNotes = (menuItemId: string, notes: string) => {
    setCart((prev) =>
      prev.map((it) => (it.menuItemId === menuItemId ? { ...it, notes } : it)),
    )
  }

  const handleRemoveItem = (menuItemId: string) => {
    setCart((prev) => prev.filter((it) => it.menuItemId !== menuItemId))
  }

  // Kirim Pesanan ke Dapur
  const handleSubmitOrder = async () => {
    if (!currentTable) {
      setOrderError("Harap pilih nomor meja Anda terlebih dahulu.")
      return
    }
    if (cart.length === 0) return

    setIsSubmitting(true)
    setOrderError(null)

    try {
      const res = await submitCustomerOrder({
        company_id: DEV_COMPANY_ID,
        store_id: DEV_STORE_ID,
        table_id: currentTable.id,
        order_type: "DINE_IN",
        order_source: "QR",
        customer_name: customerName.trim() || undefined,
        created_by: null,
        items: cart.map((it) => ({
          menu_item_id: it.menuItemId,
          item_name: it.name,
          sku: it.sku,
          quantity: it.qty,
          unit_price: it.price,
          notes: it.notes?.trim() || undefined,
        })),
      })

      // Set state sukses & bersihkan keranjang
      setOrderSuccess({
        orderNumber: res.order_number,
        tableNumber: currentTable.table_number,
        items: [...cart],
        total: totalAmount,
      })
      setCart([])
      setIsCartOpen(false)
      refetchActiveOrders()
    } catch (err: any) {
      setOrderError(err.message || "Gagal mengirim pesanan ke dapur. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // State untuk buka/tutup drawer pesanan meja
  const [isTableOrdersOpen, setIsTableOrdersOpen] = useState(false)

  // Ambil data semua pesanan aktif meja ini (otomatis polling setiap 6 detik)
  const {
    data: activeOrders = [],
    isLoading: isLoadingActiveOrders,
    refetch: refetchActiveOrders,
  } = useQuery({
    queryKey: ["customer-active-orders", currentTable?.id],
    queryFn: () => fetchActiveOrdersByTable(DEV_COMPANY_ID, DEV_STORE_ID, currentTable!.id),
    enabled: !!currentTable?.id,
    refetchInterval: 6000,
  })

  // Hitung akumulasi dari semua kloter pesanan
  const activeItemsCount = activeOrders.reduce(
    (sum, ord) => sum + (ord.items || []).reduce((acc, it) => acc + it.quantity, 0),
    0,
  )
  const tableSubtotal = activeOrders.reduce((sum, ord) => sum + ord.subtotal, 0)
  const tableTax = activeOrders.reduce((sum, ord) => sum + ord.tax_amount, 0)
  const tableTotal = activeOrders.reduce((sum, ord) => sum + ord.total_amount, 0)

  // =========================================================================
  // VIEW: TAMPILAN SUKSES SETELAH ORDER TERKIRIM
  // =========================================================================
  if (orderSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 sm:p-6">
        <div className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-6 sm:p-8 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={36} strokeWidth={2.5} />
          </div>

          <h1 className="mt-4 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            Pesanan Berhasil Dikirim!
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Tiket pesanan Anda telah masuk ke dapur dan sedang dipersiapkan oleh koki.
          </p>

          <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-left text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-medium">Nomor Pesanan</span>
              <span className="font-mono font-bold text-slate-900">{orderSuccess.orderNumber}</span>
            </div>
            <div className="flex justify-between py-1 pt-2">
              <span className="text-slate-500 font-medium">Meja Makan</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Meja {orderSuccess.tableNumber}
              </span>
            </div>
            {customerName && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Nama Tamu</span>
                <span className="font-bold text-slate-900">{customerName}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-t border-slate-200/60 mt-2 pt-2">
              <span className="text-slate-500 font-medium">Total Tagihan (Inc. Pajak)</span>
              <span className="font-bold text-blue-600 text-sm">{formatRupiah(orderSuccess.total)}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 rounded-lg p-3 border border-amber-200/60">
            <ChefHat size={16} />
            <span>Koki sedang memasak pesanan Anda...</span>
          </div>

          <button
            type="button"
            onClick={() => setOrderSuccess(null)}
            className="mt-6 w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.99] cursor-pointer"
          >
            Pesan Menu Tambahan
          </button>
        </div>
      </div>
    )
  }

  // =========================================================================
  // VIEW: KATALOG MENU UTAMA PELANGGAN
  // =========================================================================
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 pb-28">
      {/* HEADER ATAS KHUSUS MOBILE */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md">
                <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Logo & Info Meja (sudah ada) */}
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/30">
              <UtensilsCrossed size={18} />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-slate-900">Resto Nusantara</h1>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <span>Self-Order</span>
                <span>•</span>
                {currentTable ? (
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    {currentTable.table_number}
                  </span>
                ) : (
                  <span className="text-amber-600 font-bold">Meja Belum Dipilih</span>
                )}
              </div>
            </div>
          </div>

          {/* 👉 TOMBOL BARU: PESANAN MEJA (MENGGANTIKAN DROPDOWN) */}
          {currentTable && (
            <button
              type="button"
              onClick={() => setIsTableOrdersOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 hover:border-slate-300 active:scale-95 transition-all cursor-pointer"
            >
              <Receipt size={15} className="text-blue-600" />
              <span>Pesanan Meja</span>
              {activeItemsCount > 0 && (
                <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-extrabold text-white">
                  {activeItemsCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* INPUT NAMA TAMU & SEARCH */}
        <div className="mx-auto mt-2.5 max-w-2xl flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Nama Anda (opsional, misal: Budi)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white"
          />
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari makanan atau minuman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/80 pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* CATEGORY PILLS */}
        <div className="mx-auto mt-3 flex max-w-2xl gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <button
            type="button"
            onClick={() => setActiveCategory("ALL")}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
              activeCategory === "ALL"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua Menu
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCategory(c.id)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                activeCategory === c.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </header>

      {/* KATALOG PRODUK LIST */}
      <main className="mx-auto w-full max-w-2xl px-4 pt-4">
        {isLoadingMenu ? (
          <div className="py-20 text-center text-xs font-semibold text-slate-400">
            Memuat daftar menu segar...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-xs font-semibold text-slate-400">
            Tidak ada menu yang sesuai dengan pencarian Anda.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filteredProducts.map((p) => {
              const cartItem = cart.find((it) => it.menuItemId === p.id)
              const isOutOfStock = p.stock !== undefined && p.stock <= 0

              return (
                <div
                  key={p.id}
                  className={`flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs transition-all ${
                    isOutOfStock ? "opacity-60 bg-slate-50/80" : "hover:border-blue-200 hover:shadow-xs"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {p.sku}
                      </span>
                      {p.stock !== undefined && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            isOutOfStock
                              ? "bg-red-100 text-red-600"
                              : p.stock <= 5
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isOutOfStock ? "Habis" : `Sisa ${p.stock}`}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 text-sm font-bold text-slate-900 leading-snug">{p.name}</h3>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                    <div className="text-sm font-extrabold text-slate-900">
                      {formatRupiah(p.price)}
                    </div>

                    {/* TOMBOL AKSI KERANJANG */}
                    {isOutOfStock ? (
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                        Habis
                      </span>
                    ) : cartItem ? (
                      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/60 p-1">
                        <button
                          type="button"
                          onClick={() => handleDecreaseItem(p.id)}
                          className="flex h-6 w-6 items-center justify-center rounded bg-white text-blue-600 shadow-2xs hover:bg-blue-100 active:scale-95 cursor-pointer"
                        >
                          <Minus size={12} strokeWidth={2.5} />
                        </button>
                        <span className="font-mono text-xs font-bold text-blue-700 min-w-4 text-center">
                          {cartItem.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddToCart(p)}
                          className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-white shadow-2xs hover:bg-blue-700 active:scale-95 cursor-pointer"
                        >
                          <Plus size={12} strokeWidth={2.5} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddToCart(p)}
                        className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-600 transition-all hover:bg-blue-600 hover:text-white active:scale-95 cursor-pointer"
                      >
                        <Plus size={13} strokeWidth={2.5} />
                        <span>Tambah</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* FLOATING BOTTOM CART BAR */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 pointer-events-none">
          <div className="mx-auto max-w-2xl pointer-events-auto">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="flex w-full items-center justify-between rounded-2xl bg-blue-600 p-3.5 text-white shadow-xl shadow-blue-500/30 transition-all hover:bg-blue-700 active:scale-[0.99] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700">
                  <ShoppingBag size={18} />
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 font-mono text-[9px] font-bold text-white">
                    {totalItemCount}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-medium text-blue-100">
                    {totalItemCount} Menu di Keranjang
                  </div>
                  <div className="text-sm font-extrabold">{formatRupiah(totalAmount)}</div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                <span>Lihat Pesanan</span>
                <ChevronUp size={14} />
              </div>
            </button>
          </div>
        </div>
      )}


            {/* DRAWER PESANAN AKTIF MEJA (SLIDE-OVER DARI KANAN SEPERTI POS) */}
      {isTableOrdersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs">
          {/* Klik backdrop luar untuk menutup */}
          <div className="fixed inset-0" onClick={() => setIsTableOrdersOpen(false)} />

          <div className="relative flex h-full w-full max-w-sm sm:max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200 z-10">
            {/* Header Drawer */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Receipt size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">Pesanan {currentTable?.table_number}</h2>
                  <p className="text-[11px] font-semibold text-slate-500">
                    {activeOrders.length > 0
                      ? `${activeOrders.length} Kloter Pesanan (${activeItemsCount} item)`
                      : "Belum ada pesanan aktif"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTableOrdersOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 active:scale-95 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Konten Daftar Menu yang Sedang Dipesan */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {isLoadingActiveOrders ? (
                <div className="py-12 text-center text-xs font-semibold text-slate-400">
                  Memuat pesanan meja...
                </div>
              ) : activeOrders.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <ChefHat size={36} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">Belum ada pesanan untuk meja ini</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Pesanan yang kamu kirim akan muncul di sini</p>
                </div>
              ) : (
                activeOrders.map((ord, idx) => (
                  <div key={ord.id} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2.5">
                    {/* Header per kloter pesanan */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-700">
                          Kloter #{idx + 1}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-slate-700">
                          #{ord.order_number}
                        </span>
                      </div>
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-emerald-700">
                        {ord.status}
                      </span>
                    </div>

                    {/* Item dalam kloter ini */}
                    <div className="space-y-1.5">
                      {(ord.items || []).map((it) => (
                        <div key={it.id} className="flex items-start justify-between text-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-[11px] font-black text-slate-700">
                                {it.quantity}x
                              </span>
                              <span className="font-semibold text-slate-800">{it.item_name}</span>
                            </div>
                            {it.notes && (
                              <p className="text-[11px] italic text-slate-400 pl-7">Catatan: {it.notes}</p>
                            )}
                          </div>
                          <span className="font-mono font-bold text-slate-800">
                            {formatRupiah(it.total_amount || it.unit_price * it.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Total Tagihan Sementara Seluruh Meja */}
            {activeOrders.length > 0 && (
              <div className="border-t border-slate-100 bg-slate-50/80 p-4 space-y-2">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span>{formatRupiah(tableSubtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Pajak Restoran (10%)</span>
                  <span>{formatRupiah(tableTax)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Tagihan Meja</span>
                  <span className="text-blue-600">{formatRupiah(tableTotal)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* CART DRAWER / BOTTOM SHEET MODAL */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-t-3xl sm:rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* DRAWER HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Rincian Pesanan</h2>
                <p className="text-xs font-semibold text-emerald-600">
                  {currentTable ? `Meja ${currentTable.table_number}` : "Meja belum ditentukan"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 active:scale-95 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* ERROR ALERT JIKA ADA */}
            {orderError && (
              <div className="mx-5 mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                <AlertCircle size={16} className="shrink-0" />
                <span>{orderError}</span>
              </div>
            )}

            {/* DAFTAR ITEM KERANJANG */}
            <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
              {cart.map((it) => (
                <div key={it.menuItemId} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{it.name}</h4>
                      <div className="font-mono text-xs font-semibold text-slate-500">
                        {formatRupiah(it.price)}
                      </div>
                    </div>

                    {/* STEPPER +/- */}
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
                      <button
                        type="button"
                        onClick={() => handleDecreaseItem(it.menuItemId)}
                        className="flex h-6 w-6 items-center justify-center rounded bg-white text-slate-700 shadow-2xs hover:bg-slate-100 active:scale-95 cursor-pointer"
                      >
                        <Minus size={11} strokeWidth={2.5} />
                      </button>
                      <span className="font-mono text-xs font-bold text-slate-800 min-w-4 text-center">
                        {it.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const prod = menuItems.find((p) => p.id === it.menuItemId)
                          if (prod) handleAddToCart(prod)
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-white shadow-2xs hover:bg-blue-700 active:scale-95 cursor-pointer"
                      >
                        <Plus size={11} strokeWidth={2.5} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(it.menuItemId)}
                        className="ml-1 text-slate-400 hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* INPUT CATATAN KHUSUS MENU */}
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Catatan khusus (misal: pedas sedang, es sedikit)"
                      value={it.notes || ""}
                      onChange={(e) => handleUpdateItemNotes(it.menuItemId, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* RINGKASAN HARGA & TOMBOL KIRIM KE DAPUR */}
            <div className="border-t border-slate-100 bg-slate-50/50 p-5">
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal ({totalItemCount} item)</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Pajak Restoran (10%)</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(tax)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200/80 pt-2 text-sm font-extrabold text-slate-900">
                  <span>Total Pembayaran</span>
                  <span className="text-blue-600">{formatRupiah(totalAmount)}</span>
                </div>
              </div>

              <div className="mt-2 text-[10px] text-slate-500 text-center">
                ⚡ Pesanan akan langsung dikirim ke koki dapur untuk mulai dimasak.
              </div>

              <button
                type="button"
                disabled={isSubmitting || !currentTable}
                onClick={handleSubmitOrder}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-extrabold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Mengirim ke Dapur...</span>
                ) : (
                  <>
                    <ChefHat size={16} />
                    <span>Kirim Pesanan ke Dapur ({formatRupiah(totalAmount)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
