import type { Product } from "../../../types/pos"
import { ProductCard } from "./ProductCard"

type ProductGridProps = {
  products: Product[]
  onAddProduct: (product: Product) => void
}

export function ProductGrid({ products, onAddProduct }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 p-3 sm:gap-3.5 sm:p-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddProduct={onAddProduct}
        />
      ))}
    </div>
  )
}

