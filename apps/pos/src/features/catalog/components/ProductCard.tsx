import { Plus } from "lucide-react"
import type { Product } from "../../../types/pos"
import { formatPrice } from "../../../utils/currency"

type ProductCardProps = {
  product: Product
  onAddProduct: (product: Product) => void
}

export function ProductCard({ product, onAddProduct }: ProductCardProps) {
  const isOutOfStock = product.stock !== undefined && product.stock <= 0

  return (
    <button
      type="button"
      disabled={isOutOfStock}
      onClick={() => onAddProduct(product)}
      className={`group flex min-h-36 sm:min-h-40 flex-col justify-between rounded-xl border p-3 sm:p-3.5 text-left shadow-sm transition-all duration-200 ease-in-out ${
        isOutOfStock
          ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
          : "border-slate-200/80 bg-white hover:border-blue-300 hover:bg-blue-50/20 hover:shadow-md active:scale-[0.98] cursor-pointer"
      }`}
    >
      <div>
        <div className="flex items-start justify-between">
          <span className="font-mono text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {product.sku}
          </span>

          {/* Badge Stok */}
          {product.stock !== undefined && (
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                isOutOfStock
                  ? "bg-rose-100 text-rose-600"
                  : product.stock <= 5
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {isOutOfStock ? "Habis" : `Sisa ${product.stock}`}
            </span>
          )}
        </div>

        <div className="mt-1.5 sm:mt-2.5">
          <div className="line-clamp-2 text-xs sm:text-sm font-bold tracking-tight text-slate-900 transition-colors group-hover:text-blue-600">
            {product.name}
          </div>
        </div>
      </div>

      <div className="mt-3 sm:mt-4">
        <div className="font-mono text-sm sm:text-base font-bold tabular-nums text-slate-900">
          Rp {formatPrice(product.price)}
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {isOutOfStock ? "Tidak Tersedia" : "Tambah"}
          </span>

          <span
            className={`flex h-6.5 w-6.5 sm:h-7 sm:w-7 items-center justify-center rounded-lg shadow-2xs transition-all duration-200 ${
              isOutOfStock
                ? "bg-slate-200 text-slate-400"
                : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-xs active:scale-90"
            }`}
          >
            <Plus size={14} strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </button>
  )
}

