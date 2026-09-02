import type { OrderItem as OrderItemType } from "../../types/pos"
import { OrderItem } from "./OrderItem"

type OrderPanelProps = {
  items: OrderItemType[]
  onIncrease: (index: number) => void
  onDecrease: (index: number) => void
  onRemove: (index: number) => void
}

export function OrderPanel({
  items,
  onIncrease,
  onDecrease,
  onRemove,
}: OrderPanelProps) {
  return (
    <div className="flex-1 overflow-auto">
      {items.map((item, index) => (
        <OrderItem
          key={`${item.name}-${index}`}
          item={item}
          onIncrease={() => onIncrease(index)}
          onDecrease={() => onDecrease(index)}
          onRemove={() => onRemove(index)}
        />
      ))}
    </div>
  )
}