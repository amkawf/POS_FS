import {
  CreditCard,
  Percent,
  Save,
  Trash2,
} from "lucide-react"
import { Button } from "@mantine/core"

type OrderActionsProps = {
  total: number
  disabled?: boolean
  isSaving?: boolean
  onSaveOrder: () => void
  onClearOrder: () => void
  onPayOrder?: () => void
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
}

export function OrderActions({
  total,
  disabled = false,
  isSaving = false,
  onSaveOrder,
  onClearOrder,
  onPayOrder,
}: OrderActionsProps) {

  return (
    <div className="border-t border-slate-200 bg-white p-3">
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="default"
          size="sm"
          leftSection={<Save size={14} />}
          onClick={onSaveOrder}
          disabled={disabled}
          styles={{
            root: {
              borderColor: "#e2e8f0",
              color: "#2563eb",
              fontWeight: 700,
            },
          }}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>

        <Button
          variant="default"
          size="sm"
          leftSection={<Percent size={14} />}
          styles={{
            root: {
              borderColor: "#e2e8f0",
              color: "#475569",
              fontWeight: 700,
            },
          }}
        >
          Discount
        </Button>

        <Button
          variant="default"
          size="sm"
          leftSection={<Trash2 size={14} />}
          onClick={onClearOrder}
          styles={{
            root: {
              borderColor: "#e2e8f0",
              color: "#ef4444",
              fontWeight: 700,
            },
          }}
        >
          Clear
        </Button>
      </div>

      <Button
        fullWidth
        size="lg"
        color="blue"
        leftSection={<CreditCard size={19} />}
        className="mt-2"
        disabled={disabled}
        onClick={onPayOrder}
        styles={{
          root: {
            height: 52,
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: "0.02em",
          },
        }}
      >
        PAY
        <span className="ml-3">
          Rp {formatPrice(total)}
        </span>
      </Button>
    </div>
  )
}
