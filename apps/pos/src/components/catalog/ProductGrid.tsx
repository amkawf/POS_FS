import type { Product } from "../../types/pos"
import { ProductCard } from "./ProductCard"

type ProductGridProps = {
  products: Product[]
  onAddProduct: (product: Product) => void
}

export function ProductGrid({
  products,
  onAddProduct,
}: ProductGridProps) {
  return (
    <div className="grid grid-cols-4 gap-px bg-neutral-300">
      {products.map((product) => (
        <ProductCard
          key={product.code}
          product={product}
          onAddProduct={onAddProduct}
        />
      ))}
    </div>
  )
}