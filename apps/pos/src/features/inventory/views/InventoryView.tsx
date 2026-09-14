import { useState } from "react"
import {
  Badge,
  Button,
  Modal,
  NumberInput,
  SegmentedControl,
  Select,
  TextInput,
} from "@mantine/core"
import {
  AlertTriangle,
  BookOpen,
  Package,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
} from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { Category, Product, Ingredient } from "../../../types/pos"
import { formatRupiah } from "../../../utils/currency"
import {
  adjustStock,
  batchProduce,
  createIngredient,
  createMenuItem,
  fetchIngredients,
  fetchRecipeByMenuItem,
  restockIngredient,
  saveRecipe,
  updateIngredient,
} from "../../../api"
import { DEV_COMPANY_ID, DEV_STORE_ID } from "../../../config"

type InventoryViewProps = {
  products: Product[]
  categories: Category[]
}

export function InventoryView({ products, categories }: InventoryViewProps) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<"FINISHED_GOODS" | "RAW_MATERIALS">("FINISHED_GOODS")
  const [search, setSearch] = useState("")

  // ==========================================
  // QUERY: DAFTAR BAHAN BAKU TOKO
  // ==========================================
  const ingredientsQuery = useQuery({
    queryKey: ["ingredients", DEV_COMPANY_ID, DEV_STORE_ID],
    queryFn: () => fetchIngredients(DEV_COMPANY_ID, DEV_STORE_ID),
  })
  const ingredients = ingredientsQuery.data ?? []

  // ==========================================
  // STATE MODAL 1: TAMBAH STOK PORSI MAKANAN JADI
  // ==========================================
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [adjustQty, setAdjustQty] = useState<number>(20)
  const [adjustNotes, setAdjustNotes] = useState("Restock harian")
  const [isSubmittingStock, setIsSubmittingStock] = useState(false)

  // ==========================================
  // STATE MODAL 2: DAFTARKAN MENU BARU
  // ==========================================
  const [isCreateMenuModalOpen, setIsCreateMenuModalOpen] = useState(false)
  const [newMenuName, setNewMenuName] = useState("")
  const [newMenuSku, setNewMenuSku] = useState("")
  const [newMenuPrice, setNewMenuPrice] = useState<number>(25000)
  const [newMenuCategoryId, setNewMenuCategoryId] = useState<string | null>(null)
  const [newMenuFulfillment, setNewMenuFulfillment] = useState<"BATCH_COOKING" | "MADE_TO_ORDER">("BATCH_COOKING")
  const [isSubmittingMenu, setIsSubmittingMenu] = useState(false)

  // ==========================================
  // STATE MODAL 3: PENGATURAN RESEP (BOM)
  // ==========================================
  const [recipeTargetProduct, setRecipeTargetProduct] = useState<Product | null>(null)
  const [recipeRows, setRecipeRows] = useState<{ ingredientId: string; quantity: number }[]>([])
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false)
  const [isSubmittingRecipe, setIsSubmittingRecipe] = useState(false)

  // ==========================================
  // STATE MODAL 4: DAFTARKAN BAHAN BAKU BARU
  // ==========================================
  const [isCreateIngModalOpen, setIsCreateIngModalOpen] = useState(false)
  const [newIngName, setNewIngName] = useState("")
  const [newIngUnit, setNewIngUnit] = useState("kg")
  const [newIngMinAlert, setNewIngMinAlert] = useState<number>(2)
  const [isSubmittingIng, setIsSubmittingIng] = useState(false)

  // ==========================================
  // STATE MODAL 5: BELANJA BAHAN BAKU (RESTOCK)
  // ==========================================
  const [restockTargetIng, setRestockTargetIng] = useState<Ingredient | null>(null)
  const [restockIngQty, setRestockIngQty] = useState<number>(5)
  const [restockIngNotes, setRestockIngNotes] = useState("Kiriman supplier")
  const [isSubmittingRestockIng, setIsSubmittingRestockIng] = useState(false)

  // ==========================================
  // STATE MODAL 6: EDIT BAHAN BAKU
  // ==========================================
  const [editTargetIng, setEditTargetIng] = useState<Ingredient | null>(null)
  const [editIngName, setEditIngName] = useState("")
  const [editIngCode, setEditIngCode] = useState("")
  const [editIngUnit, setEditIngUnit] = useState("kg")
  const [editIngMinAlert, setEditIngMinAlert] = useState<number>(0)
  const [isSubmittingEditIng, setIsSubmittingEditIng] = useState(false)

  // Membuka modal edit dan mengisi form dengan data bahan baku saat ini
  const handleOpenEditIngredient = (ing: Ingredient) => {
    setEditTargetIng(ing)
    setEditIngName(ing.name)
    setEditIngCode(ing.code || "")
    setEditIngUnit(ing.unit)
    setEditIngMinAlert(ing.min_stock_alert)
  }

  // Mengirim pembaruan atribut ke API backend
  const handleUpdateIngredient = async () => {
    if (!editTargetIng || !editIngName.trim() || !editIngUnit.trim()) return

    setIsSubmittingEditIng(true)
    try {
      await updateIngredient(editTargetIng.id, {
        company_id: DEV_COMPANY_ID,
        code: editIngCode.trim() || undefined,
        name: editIngName.trim(),
        unit: editIngUnit.trim(),
        min_stock_alert: editIngMinAlert,
      })

      // Invalidate cache React Query agar tabel langsung merefresh data terbaru
      await queryClient.invalidateQueries({ queryKey: ["ingredients"] })
      setEditTargetIng(null)
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui bahan baku")
    } finally {
      setIsSubmittingEditIng(false)
    }
  }
  
  // Filter Kategori
  const getCategoryName = (catIds?: string[]) => {
    if (!catIds || catIds.length === 0) return "Tanpa Kategori"
    const matched = categories.find((c) => catIds.includes(c.id))
    return matched ? matched.name : "Umum"
  }

  // Filter Search
  const filteredProducts = products.filter((p) => {
    const q = search.trim().toLowerCase()
    return q === "" || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
  })

  const filteredIngredients = ingredients.filter((ing) => {
    const q = search.trim().toLowerCase()
    return q === "" || ing.name.toLowerCase().includes(q) || (ing.code && ing.code.toLowerCase().includes(q))
  })

    // HANDLER: Produksi Masak Batch atau Penyesuaian Stok Manual
  const handleAdjustStock = async () => {
    if (!selectedProduct || adjustQty <= 0) return
    setIsSubmittingStock(true)
    try {
          const isBatch = !selectedProduct.fulfillment_type || selectedProduct.fulfillment_type === "BATCH_COOKING"
    if (isBatch) {
      // 🍳 1. Jalankan konversi bahan baku -> makanan jadi
      await batchProduce({
        company_id: DEV_COMPANY_ID,
        store_id: DEV_STORE_ID,
        menu_item_id: selectedProduct.id,
        portions: adjustQty,
        notes: adjustNotes.trim() || `Produksi masak batch (+${adjustQty} porsi)`,
      })
    } else {
      // 📦 2. Jika Made-to-Order / manual opname
      await adjustStock({
        company_id: DEV_COMPANY_ID,
        store_id: DEV_STORE_ID,
        menu_item_id: selectedProduct.id,
        quantity: adjustQty,
        notes: adjustNotes.trim() || `Restock manual (+${adjustQty})`,
      })
    }
      // Refresh KEDUA cache: Makanan Jadi & Gudang Bahan Baku Mentah!
      await queryClient.invalidateQueries({ queryKey: ["menu-items"] })
      await queryClient.invalidateQueries({ queryKey: ["ingredients"] })
      setSelectedProduct(null)
      alert(`Berhasil memproduksi ${adjustQty} porsi ${selectedProduct.name}! Bahan baku di gudang telah otomatis dipotong.`)
    } catch (err) {
      alert(`Gagal memproses: ${(err as Error).message}`)
    } finally {
      setIsSubmittingStock(false)
    }
  }

  // HANDLER: Pembuatan Menu Baru
  const handleCreateMenu = async () => {
    if (!newMenuName || !newMenuSku || newMenuPrice <= 0) {
      alert("Harap lengkapi nama, SKU, dan harga menu.")
      return
    }
    setIsSubmittingMenu(true)
    try {
      await createMenuItem({
        company_id: DEV_COMPANY_ID,
        sku: newMenuSku,
        name: newMenuName,
        base_price: newMenuPrice,
        category_ids: newMenuCategoryId ? [newMenuCategoryId] : [],
        fulfillment_type: newMenuFulfillment,
      })
      await queryClient.invalidateQueries({ queryKey: ["menu-items"] })
      setIsCreateMenuModalOpen(false)
      setNewMenuName("")
      setNewMenuSku("")
      setNewMenuPrice(25000)
    } catch (err) {
      alert(`Gagal membuat menu: ${(err as Error).message}`)
    } finally {
      setIsSubmittingMenu(false)
    }
  }

  // HANDLER: Buka Modal Resep & Fetch Data Resep
  const handleOpenRecipe = async (prod: Product) => {
    setRecipeTargetProduct(prod)
    setIsLoadingRecipe(true)
    try {
      const items = await fetchRecipeByMenuItem(prod.id)
      setRecipeRows(
        items.map((it) => ({
          ingredientId: it.ingredient_id,
          quantity: it.quantity_per_portion,
        })),
      )
    } catch {
      setRecipeRows([])
    } finally {
      setIsLoadingRecipe(false)
    }
  }

  // HANDLER: Simpan Komposisi Resep
  const handleSaveRecipe = async () => {
    if (!recipeTargetProduct) return
    setIsSubmittingRecipe(true)
    try {
      const validItems = recipeRows
        .filter((r) => r.ingredientId && r.quantity > 0)
        .map((r) => ({
          ingredient_id: r.ingredientId,
          quantity_per_portion: r.quantity,
        }))

      await saveRecipe(recipeTargetProduct.id, validItems)
      alert("Resep berhasil disimpan!")
      setRecipeTargetProduct(null)
    } catch (err) {
      alert(`Gagal menyimpan resep: ${(err as Error).message}`)
    } finally {
      setIsSubmittingRecipe(false)
    }
  }

  // HANDLER: Daftarkan Bahan Baku Baru
  const handleCreateIngredient = async () => {
    if (!newIngName || !newIngUnit) {
      alert("Nama bahan dan satuan wajib diisi.")
      return
    }
    setIsSubmittingIng(true)
    try {
      await createIngredient({
        company_id: DEV_COMPANY_ID,
        name: newIngName,
        unit: newIngUnit.trim().toLowerCase(),
        min_stock_alert: newIngMinAlert,
      })
      await queryClient.invalidateQueries({ queryKey: ["ingredients"] })
      setIsCreateIngModalOpen(false)
      setNewIngName("")
    } catch (err) {
      alert(`Gagal mendaftarkan bahan baku: ${(err as Error).message}`)
    } finally {
      setIsSubmittingIng(false)
    }
  }

  // HANDLER: Belanja Bahan Baku (Restock)
  const handleRestockIngredient = async () => {
    if (!restockTargetIng || restockIngQty <= 0) return
    setIsSubmittingRestockIng(true)
    try {
      await restockIngredient({
        company_id: DEV_COMPANY_ID,
        store_id: DEV_STORE_ID,
        ingredient_id: restockTargetIng.id,
        quantity: restockIngQty,
        notes: restockIngNotes.trim(),
      })
      await queryClient.invalidateQueries({ queryKey: ["ingredients"] })
      setRestockTargetIng(null)
    } catch (err) {
      alert(`Gagal menambah stok belanja: ${(err as Error).message}`)
    } finally {
      setIsSubmittingRestockIng(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6">
      {/* HEADER UTAMA */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
            <Package className="text-blue-600" size={24} />
            <span>Pusat Inventori & Dapur</span>
          </h1>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Kelola porsi makanan siap saji, resep (BOM), dan stok bahan baku mentah.
          </p>
        </div>

        {/* TOMBOL AKSI ATAS */}
        <div className="flex items-center gap-2">
          {activeTab === "FINISHED_GOODS" ? (
            <Button
              size="xs"
              color="blue"
              leftSection={<Plus size={14} />}
              onClick={() => setIsCreateMenuModalOpen(true)}
            >
              Tambah Menu Baru
            </Button>
          ) : (
            <Button
              size="xs"
              color="indigo"
              leftSection={<Plus size={14} />}
              onClick={() => setIsCreateIngModalOpen(true)}
            >
              Daftarkan Bahan Baku
            </Button>
          )}
        </div>
      </div>

      {/* TAB SWITCHER & SEARCH */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          value={activeTab}
          onChange={(val) => setActiveTab(val as "FINISHED_GOODS" | "RAW_MATERIALS")}
          data={[
            { label: "Makanan Jadi (Siap Saji)", value: "FINISHED_GOODS" },
            { label: "Gudang Bahan Baku Mentah", value: "RAW_MATERIALS" },
          ]}
          size="sm"
          radius="md"
        />

        <div className="w-full sm:max-w-xs">
          <TextInput
            placeholder={activeTab === "FINISHED_GOODS" ? "Cari nama menu / SKU..." : "Cari nama bahan baku..."}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            leftSection={<Search size={15} />}
            size="xs"
            radius="md"
          />
        </div>
      </div>

      {/* TAB 1: MAKANAN JADI (FINISHED GOODS) */}
      {activeTab === "FINISHED_GOODS" && (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">SKU</th>
                  <th className="px-5 py-3">Nama Menu</th>
                  <th className="px-5 py-3">Kategori</th>
                  <th className="px-5 py-3">Tipe Pemenuhan</th>
                  <th className="px-5 py-3 text-right">Harga Dasar</th>
                  <th className="px-5 py-3 text-right">Sisa Stok</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="transition-all hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-slate-500">
                      {p.sku}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{p.name}</td>
                    <td className="px-5 py-3.5">
                      <Badge size="xs" color="gray" variant="light">
                        {getCategoryName(p.categoryIds)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        size="xs"
                        color={p.fulfillment_type === "MADE_TO_ORDER" ? "teal" : "blue"}
                        variant="light"
                      >
                        {p.fulfillment_type === "MADE_TO_ORDER" ? "Made-to-Order" : "Batch Cooking"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right font-extrabold text-slate-900">
                      {formatRupiah(p.price)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {p.stock !== undefined && p.stock <= 0 ? (
                        <Badge size="xs" color="red" variant="light">
                          Habis (0)
                        </Badge>
                      ) : (
                        <Badge size="xs" color="green" variant="light">
                          {p.stock !== undefined ? `${p.stock} Porsi` : "Tersedia"}
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Tombol Atur Resep */}
                        <Button
                          size="xs"
                          variant="subtle"
                          color="indigo"
                          leftSection={<BookOpen size={12} />}
                          onClick={() => handleOpenRecipe(p)}
                        >
                          Resep
                        </Button>

                        {/* Tombol Tambah Stok Manual */}
                        <Button
                          size="xs"
                          variant="light"
                          color="blue"
                          leftSection={<Plus size={12} />}
                          onClick={() => {
                            setSelectedProduct(p)
                            setAdjustQty(20)
                          }}
                        >
                          + Stok
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: GUDANG BAHAN BAKU MENTAH (RAW MATERIALS) */}
      {activeTab === "RAW_MATERIALS" && (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Kode / ID</th>
                  <th className="px-5 py-3">Nama Bahan Baku</th>
                  <th className="px-5 py-3">Satuan</th>
                  <th className="px-5 py-3 text-right">Batas Peringatan</th>
                  <th className="px-5 py-3 text-right">Stok Fisik Saat Ini</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIngredients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      Belum ada bahan baku terdaftar. Klik "Daftarkan Bahan Baku" di atas untuk mulai.
                    </td>
                  </tr>
                ) : (
                  filteredIngredients.map((ing) => {
                    const currentStock = ing.stock ?? 0
                    const isNegative = currentStock < 0
                    const isLow = currentStock <= ing.min_stock_alert && !isNegative

                    return (
                      <tr key={ing.id} className="transition-all hover:bg-slate-50/70">
                        <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-slate-400">
                          {ing.code || ing.id.slice(0, 8)}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-900">{ing.name}</td>
                        <td className="px-5 py-3.5">
                          <Badge size="xs" color="gray" variant="outline">
                            {ing.unit}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-slate-500">
                          {ing.min_stock_alert} {ing.unit}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {isNegative ? (
                            <Badge size="xs" color="red" variant="filled" leftSection={<AlertTriangle size={10} />}>
                              Minus ({currentStock} {ing.unit})
                            </Badge>
                          ) : isLow ? (
                            <Badge size="xs" color="amber" variant="light">
                              {currentStock} {ing.unit} (Menipis)
                            </Badge>
                          ) : (
                            <Badge size="xs" color="green" variant="light">
                              {currentStock} {ing.unit}
                            </Badge>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Tombol Edit Atribut Bahan Baku */}
                            <Button
                              size="xs"
                              variant="subtle"
                              color="gray"
                              leftSection={<Pencil size={12} />}
                              onClick={() => handleOpenEditIngredient(ing)}
                            >
                              Edit
                            </Button>

                            {/* Tombol Catat Belanja Masuk */}
                            <Button
                              size="xs"
                              variant="light"
                              color="indigo"
                              leftSection={<ShoppingBag size={12} />}
                              onClick={() => {
                                setRestockTargetIng(ing)
                                setRestockIngQty(5)
                              }}
                            >
                              + Belanja
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: TAMBAH STOK MANUAL MAKANAN JADI                */}
      {/* ======================================================== */}
      <Modal
        opened={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        title={
          <span className="text-sm font-bold text-slate-900">
            {selectedProduct?.fulfillment_type === "MADE_TO_ORDER"
              ? `Koreksi Stok: ${selectedProduct?.name}`
              : `🍳 Produksi Masak Dapur: ${selectedProduct?.name}`}
          </span>
        }
        centered
      >
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <div>SKU: <span className="font-mono font-bold text-slate-800">{selectedProduct?.sku}</span></div>
            <div className="mt-1">
              Stok Saat Ini: <span className="font-bold text-blue-600">{selectedProduct?.stock ?? 0} Porsi</span>
            </div>
            {selectedProduct?.fulfillment_type !== "MADE_TO_ORDER" && (
              <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 rounded p-2 border border-amber-200">
                ⚡ <strong>Konversi Otomatis:</strong> Memasak porsi ini akan otomatis memotong stok bahan baku di gudang sesuai takaran resep.
              </div>
            )}
          </div>
          <NumberInput
            label={selectedProduct?.fulfillment_type === "MADE_TO_ORDER" ? "Jumlah Penyesuaian Porsi" : "Jumlah Porsi yang Dimasak"}
            value={adjustQty}
            onChange={(val) => setAdjustQty(typeof val === "number" ? val : 0)}
            min={1}
          />
          <TextInput
            label="Catatan Mutasi"
            placeholder={selectedProduct?.fulfillment_type === "MADE_TO_ORDER" ? "Koreksi stok" : "Masak batch makan siang"}
            value={adjustNotes}
            onChange={(e) => setAdjustNotes(e.currentTarget.value)}
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="default" onClick={() => setSelectedProduct(null)}>Batal</Button>
            <Button
              color={selectedProduct?.fulfillment_type === "MADE_TO_ORDER" ? "blue" : "teal"}
              loading={isSubmittingStock}
              onClick={handleAdjustStock}
            >
              {selectedProduct?.fulfillment_type === "MADE_TO_ORDER" ? "Simpan Porsi" : "🍳 Mulai Masak & Potong Bahan"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: BUAT MENU MAKANAN BARU                         */}
      {/* ======================================================== */}
      <Modal
        opened={isCreateMenuModalOpen}
        onClose={() => setIsCreateMenuModalOpen(false)}
        title={<span className="text-sm font-bold text-slate-900">Daftarkan Menu Makanan/Minuman Baru</span>}
        centered
      >
        <div className="flex flex-col gap-3">
          <TextInput
            label="Nama Menu"
            placeholder="Contoh: Ayam Geprek Sambal Matah"
            required
            value={newMenuName}
            onChange={(e) => setNewMenuName(e.currentTarget.value)}
          />
          <TextInput
            label="Kode SKU"
            placeholder="Contoh: FD-003"
            required
            value={newMenuSku}
            onChange={(e) => setNewMenuSku(e.currentTarget.value)}
          />
          <NumberInput
            label="Harga Dasar (Rp)"
            required
            value={newMenuPrice}
            onChange={(val) => setNewMenuPrice(typeof val === "number" ? val : 0)}
            min={500}
            step={1000}
          />
          <Select
            label="Kategori"
            placeholder="Pilih kategori menu"
            data={categories.map((c) => ({ value: c.id, label: c.name }))}
            value={newMenuCategoryId}
            onChange={setNewMenuCategoryId}
            clearable
          />
          <Select
            label="Tipe Pemenuhan (Fulfillment Type)"
            data={[
              { value: "BATCH_COOKING", label: "Batch Cooking (Dimasak koki di awal)" },
              { value: "MADE_TO_ORDER", label: "Made-to-Order (Dibuat saat ada pesanan)" },
            ]}
            value={newMenuFulfillment}
            onChange={(val) => setNewMenuFulfillment(val as "BATCH_COOKING" | "MADE_TO_ORDER")}
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="default" onClick={() => setIsCreateMenuModalOpen(false)}>Batal</Button>
            <Button color="blue" loading={isSubmittingMenu} onClick={handleCreateMenu}>Simpan Menu</Button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 3: PENGATURAN RESEP (BOM)                         */}
      {/* ======================================================== */}
      <Modal
        opened={recipeTargetProduct !== null}
        onClose={() => setRecipeTargetProduct(null)}
        title={
          <span className="text-sm font-bold text-slate-900">
            Konfigurasi Resep: {recipeTargetProduct?.name}
          </span>
        }
        size="lg"
        centered
      >
        <div className="flex flex-col gap-4">
          <p className="text-xs text-slate-500">
            Tentukan bahan mentah dan takaran yang dibutuhkan untuk membuat <strong>1 porsi</strong> menu ini.
          </p>

          {isLoadingRecipe ? (
            <div className="py-6 text-center text-xs text-slate-400">Memuat data resep...</div>
          ) : (
            <div className="flex flex-col gap-3">
              {recipeRows.map((row, idx) => {
                const matchedIng = ingredients.find((i) => i.id === row.ingredientId)
                const unitLabel = matchedIng ? matchedIng.unit : "satuan"

                return (
                  <div key={idx} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                    <div className="flex-1">
                      <Select
                        placeholder="Pilih Bahan Baku"
                        size="xs"
                        data={ingredients.map((i) => ({
                          value: i.id,
                          label: `${i.name} (${i.unit})`,
                        }))}
                        value={row.ingredientId}
                        onChange={(val) => {
                          const updated = [...recipeRows]
                          updated[idx].ingredientId = val || ""
                          setRecipeRows(updated)
                        }}
                      />
                    </div>

                    <div className="w-36">
                      <NumberInput
                        placeholder={`Takaran (${unitLabel})`}
                        size="xs"
                        value={row.quantity}
                        onChange={(val) => {
                          const updated = [...recipeRows]
                          updated[idx].quantity = typeof val === "number" ? val : 0
                          setRecipeRows(updated)
                        }}
                        decimalScale={4}
                        step={0.05}
                        min={0.0001}
                      />
                    </div>

                    <Button
                      size="xs"
                      color="red"
                      variant="subtle"
                      onClick={() => {
                        const updated = recipeRows.filter((_, i) => i !== idx)
                        setRecipeRows(updated)
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                )
              })}

              <Button
                variant="outline"
                size="xs"
                color="indigo"
                leftSection={<Plus size={13} />}
                onClick={() => setRecipeRows([...recipeRows, { ingredientId: "", quantity: 0.1 }])}
              >
                + Tambah Komposisi Bahan
              </Button>
            </div>
          )}

          <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3">
            <Button variant="default" onClick={() => setRecipeTargetProduct(null)}>Batal</Button>
            <Button color="indigo" loading={isSubmittingRecipe} onClick={handleSaveRecipe}>Simpan Resep</Button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 4: DAFTARKAN BAHAN BAKU BARU                      */}
      {/* ======================================================== */}
      <Modal
        opened={isCreateIngModalOpen}
        onClose={() => setIsCreateIngModalOpen(false)}
        title={<span className="text-sm font-bold text-slate-900">Daftarkan Master Bahan Baku Baru</span>}
        centered
      >
        <div className="flex flex-col gap-3">
          <TextInput
            label="Nama Bahan Baku"
            placeholder="Contoh: Daging Ayam Fillet, Garam Dapur, Minyak Sayur"
            required
            value={newIngName}
            onChange={(e) => setNewIngName(e.currentTarget.value)}
          />
          <TextInput
            label="Satuan Alami (Unit)"
            description="Bebas, tidak dipaksa kg/liter (misal: kg, gram, liter, butir, lembar)"
            placeholder="Contoh: kg atau gram"
            required
            value={newIngUnit}
            onChange={(e) => setNewIngUnit(e.currentTarget.value)}
          />
          <NumberInput
            label="Batas Minimum Peringatan Stok"
            description="Sistem akan memberi tahu jika stok berada di bawah batas ini"
            value={newIngMinAlert}
            onChange={(val) => setNewIngMinAlert(typeof val === "number" ? val : 0)}
            min={0}
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="default" onClick={() => setIsCreateIngModalOpen(false)}>Batal</Button>
            <Button color="indigo" loading={isSubmittingIng} onClick={handleCreateIngredient}>Daftarkan Bahan</Button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 5: BELANJA BAHAN BAKU (RESTOCK)                   */}
      {/* ======================================================== */}
      <Modal
        opened={restockTargetIng !== null}
        onClose={() => setRestockTargetIng(null)}
        title={
          <span className="text-sm font-bold text-slate-900">
            Catat Belanja Bahan: {restockTargetIng?.name}
          </span>
        }
        centered
      >
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <div>Satuan: <span className="font-bold text-slate-800">{restockTargetIng?.unit}</span></div>
            <div className="mt-1">
              Stok Fisik Saat Ini:{" "}
              <span className="font-bold text-indigo-600">
                {restockTargetIng?.stock ?? 0} {restockTargetIng?.unit}
              </span>
            </div>
          </div>
          <NumberInput
            label={`Jumlah Kuantitas Belanja (${restockTargetIng?.unit})`}
            description="Masukkan jumlah fisik yang baru dibeli dari pasar/supplier"
            value={restockIngQty}
            onChange={(val) => setRestockIngQty(typeof val === "number" ? val : 0)}
            min={0.01}
            step={1}
            decimalScale={4}
          />
          <TextInput
            label="Catatan Bon / Supplier"
            placeholder="Contoh: Bon Pasar Jaya, Toko Berkah"
            value={restockIngNotes}
            onChange={(e) => setRestockIngNotes(e.currentTarget.value)}
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="default" onClick={() => setRestockTargetIng(null)}>Batal</Button>
            <Button color="indigo" loading={isSubmittingRestockIng} onClick={handleRestockIngredient}>
              Simpan Belanja Masuk
            </Button>
          </div>
        </div>
      </Modal>

            {/* ======================================================== */}
      {/* MODAL 6: EDIT MASTER BAHAN BAKU                          */}
      {/* ======================================================== */}
      <Modal
        opened={editTargetIng !== null}
        onClose={() => setEditTargetIng(null)}
        title={
          <span className="text-sm font-bold text-slate-900">
            Edit Bahan Baku: {editTargetIng?.name}
          </span>
        }
        centered
      >
        <div className="flex flex-col gap-3">
          <TextInput
            label="Kode Bahan (Opsional)"
            placeholder="Contoh: ING-AYAM, ING-001"
            value={editIngCode}
            onChange={(e) => setEditIngCode(e.currentTarget.value)}
          />
          <TextInput
            label="Nama Bahan Baku"
            placeholder="Contoh: Daging Ayam Fillet"
            required
            value={editIngName}
            onChange={(e) => setEditIngName(e.currentTarget.value)}
          />
          <TextInput
            label="Satuan Alami (Unit)"
            description="Bebas, tidak dipaksa kg/liter (misal: kg, gram, liter, butir, lembar)"
            placeholder="Contoh: kg, gram, butir"
            required
            value={editIngUnit}
            onChange={(e) => setEditIngUnit(e.currentTarget.value)}
          />
          <NumberInput
            label="Batas Minimum Peringatan Stok"
            description="Sistem akan memberi badge peringatan jika stok di bawah angka ini"
            value={editIngMinAlert}
            onChange={(val) => setEditIngMinAlert(typeof val === "number" ? val : 0)}
            min={0}
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="default" onClick={() => setEditTargetIng(null)}>
              Batal
            </Button>
            <Button
              color="indigo"
              loading={isSubmittingEditIng}
              onClick={handleUpdateIngredient}
            >
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}