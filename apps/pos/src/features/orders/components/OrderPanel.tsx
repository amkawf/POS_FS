import { ShoppingBag } from "lucide-react"
import type { OrderItem as OrderItemType } from "../../../types/pos"
import { OrderItem } from "./OrderItem"

type OrderPanelProps = {
  items: OrderItemType[]
  onIncrease: (index: number) => void
  onDecrease: (index: number) => void
  onRemove: (index: number) => void
  onUpdateNotes: (index: number, notes: string) => void
}

export function OrderPanel({
  items,
  onIncrease,
  onDecrease,
  onRemove,
  onUpdateNotes,
}: OrderPanelProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <ShoppingBag size={22} strokeWidth={1.75} />
        </div>
        <div className="mt-3 text-xs font-bold text-slate-700">
          Keranjang masih kosong
        </div>
        <div className="mt-1 max-w-50 text-[11px] font-medium text-slate-400">
          Pilih menu dari katalog untuk memulai pesanan
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {items.map((item, index) => (
        <OrderItem
          key={`${item.menuItemId}-${index}`}
          item={item}
          onIncrease={() => onIncrease(index)}
          onDecrease={() => onDecrease(index)}
          onRemove={() => onRemove(index)}
          onUpdateNotes={(notes) => onUpdateNotes(index, notes)}
        />
      ))}
    </div>
  )
}

