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
  UtensilsCrossed,
  X,
} from "lucide-react"
import { DEV_COMPANY_ID, DEV_STORE_ID } from "./config"
import { fetchMenuItems, fetchMenuCategories, fetchTables, submitCustomerOrder } from "./api"
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
  const [selectedTableNumber, setSelectedTableNumber] = useState(tableParam)
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
    return tables.find(
      (t) =>
        t.table_number.toLowerCase() === selectedTableNumber.toLowerCase() ||
        t.id === selectedTableNumber,
    )
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
    } catch (err: any) {
      setOrderError(err.message || "Gagal mengirim pesanan ke dapur. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

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
                    Meja {currentTable.table_number}
                  </span>
                ) : (
                  <span className="text-amber-600 font-bold">Meja Belum Dipilih</span>
                )}
              </div>
            </div>
          </div>

          {/* PILIH MEJA DROPDOWN (Jika scan tanpa parameter) */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedTableNumber}
              onChange={(e) => setSelectedTableNumber(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="">Pilih Meja</option>
              {tables.map((t) => (
                <option key={t.id} value={t.table_number}>
                  Meja {t.table_number}
                </option>
              ))}
            </select>
          </div>
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
