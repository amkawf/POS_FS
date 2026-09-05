import { useState } from "react"
import { Badge, TextInput } from "@mantine/core"
import { Package, Search } from "lucide-react"
import type { Category, Product } from "../types/pos"

type InventoryViewProps = {
  products: Product[]
  categories: Category[]
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID").format(amount)
}

export function InventoryView({ products, categories }: InventoryViewProps) {
  const [search, setSearch] = useState("")

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

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Package className="text-blue-600" size={24} />
            <span>Ketersediaan Menu & Stok</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
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
      <div className="mt-5 rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Nama Produk</th>
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3 text-right">Harga Dasar</th>
                <th className="px-5 py-3 text-right">Status Stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-all">
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
                    Rp {formatRupiah(p.price)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Badge size="xs" color="green" variant="light">
                      TERSEDIA
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-12 text-center text-xs font-semibold text-slate-400">
            Tidak ada produk yang cocok dengan pencarian.
          </div>
        )}
      </div>
    </div>
  )
}
