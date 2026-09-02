import { Plus } from "lucide-react"
import type { Product } from "../../types/pos"

type ProductCardProps = {
  product: Product
  onAddProduct: (product: Product) => void
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
}

export function ProductCard({ product, onAddProduct }: ProductCardProps) {
  const isLowStock = product.stock <= 5

  return (
    <button
      type="button"
      onClick={() => onAddProduct(product)}
      className="group flex min-h-40 flex-col border border-slate-200 bg-white p-3 text-left transition-colors hover:border-blue-400 hover:bg-blue-50/40"
    >
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-bold text-slate-400">
          {product.code}
        </span>

        <span
          className={
            isLowStock
              ? "border border-red-200 bg-red-50 px-1.5 py-0.5 text-[9px] font-bold text-red-600"
              : "border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600"
          }
        >
          {isLowStock ? "LOW STOCK" : `STOCK ${product.stock}`}
        </span>
      </div>

      <div className="mt-6 flex-1">
        <div className="text-sm font-extrabold tracking-tight text-slate-900">
          {product.name}
        </div>

        <div className="mt-2 text-base font-bold text-blue-600">
          Rp {formatPrice(product.price)}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
        <span className="text-[10px] font-semibold uppercase text-slate-400">
          Tap to add
        </span>

        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white transition-colors group-hover:bg-blue-700">
          <Plus size={15} strokeWidth={2.5} />
        </span>
      </div>
    </button>
  )
}