import { useState } from "react"
import { Badge, Button, Modal, NumberInput, TextInput } from "@mantine/core"
import { Package, Plus, Search } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import type { Category, Product } from "../../../types/pos"
import { formatRupiah } from "../../../utils/currency"
import { adjustStock } from "../../../api"
import { DEV_COMPANY_ID, DEV_STORE_ID } from "../../../config"

type InventoryViewProps = {
  products: Product[]
  categories: Category[]
}

export function InventoryView({ products, categories }: InventoryViewProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")

  // State untuk Modal Tambah Stok
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [adjustQty, setAdjustQty] = useState<number>(20)
  const [notes, setNotes] = useState("Restock harian")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getCategoryName = (catIds?: string[]) => {
    if (!catIds || catIds.length === 0) return "Tanpa Kategori"
    const matched = categories.find((c) => catIds.includes(c.id))
    return matched ? matched.name : "Umum"
  }

  const filteredProducts = products.filter((p) => {
    const q = search.trim().toLowerCase()
    return (
      q === "" ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    )
  })

  // Handler Submit Tambah Stok
  const handleAdjustStock = async () => {
    if (!selectedProduct || adjustQty <= 0) return

    setIsSubmitting(true)
    try {
      await adjustStock({
        company_id: DEV_COMPANY_ID,
        store_id: DEV_STORE_ID,
        menu_item_id: selectedProduct.id,
        quantity: adjustQty,
        notes: notes.trim() || `Restock manual (+${adjustQty})`,
      })

      // Invalidate cache agar tabel dan kartu menu otomatis reload stok terbaru
      await queryClient.invalidateQueries({ queryKey: ["menu-items"] })

      // Tutup modal & reset form
      setSelectedProduct(null)
      setAdjustQty(20)
      setNotes("Restock harian")
    } catch (err) {
      alert(`Gagal menambah stok: ${(err as Error).message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
            <Package className="text-blue-600" size={24} />
            <span>Ketersediaan Menu & Stok</span>
          </h1>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Status ketersediaan produk dan katalog toko aktif.
          </p>
        </div>

        <Badge size="md" color="indigo" variant="light">
          {products.length} Menu Terdaftar
        </Badge>
      </div>

      {/* SEARCH */}
      <div className="mt-6 max-w-md">
        <TextInput
          placeholder="Cari nama produk atau SKU..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          leftSection={<Search size={16} />}
          styles={{
            input: {
              borderRadius: 8,
              borderColor: "#e2e8f0",
              backgroundColor: "#ffffff",
              fontSize: 13,
            },
          }}
        />
      </div>

      {/* PRODUCTS TABLE */}
      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Nama Produk</th>
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3 text-right">Harga Dasar</th>
                <th className="px-5 py-3 text-right">Status Stok</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="transition-all hover:bg-slate-50/70">
                  <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-slate-500">
                    {p.sku}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-slate-900">
                    {p.name}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge size="xs" color="gray" variant="light">
                      {getCategoryName(p.categoryIds)}
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
                    <Button
                      size="xs"
                      variant="light"
                      color="blue"
                      leftSection={<Plus size={12} />}
                      onClick={() => {
                        setSelectedProduct(p)
                        setAdjustQty(20)
                        setNotes("Restock harian")
                      }}
                    >
                      + Stok
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH STOK */}
      <Modal
        opened={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        title={
          <span className="text-sm font-bold text-slate-900">
            Tambah Stok: {selectedProduct?.name}
          </span>
        }
        centered
      >
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <div>SKU: <span className="font-mono font-bold text-slate-800">{selectedProduct?.sku}</span></div>
            <div className="mt-1">
              Stok Saat Ini:{" "}
              <span className="font-bold text-blue-600">
                {selectedProduct?.stock ?? 0} Porsi
              </span>
            </div>
          </div>

          <NumberInput
            label="Jumlah Tambahan Porsi"
            description="Masukkan jumlah porsi yang baru datang"
            value={adjustQty}
            onChange={(val) => setAdjustQty(typeof val === "number" ? val : 0)}
            min={1}
            step={1}
          />

          <TextInput
            label="Catatan Mutasi"
            placeholder="Contoh: Kiriman dari suplier"
            value={notes}
            onChange={(e) => setNotes(e.currentTarget.value)}
          />

          <div className="mt-2 flex justify-end gap-2">
            <Button variant="default" onClick={() => setSelectedProduct(null)}>
              Batal
            </Button>
            <Button
              color="blue"
              loading={isSubmitting}
              onClick={handleAdjustStock}
            >
              Simpan Stok
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}