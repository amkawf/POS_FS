import { Drawer } from "@mantine/core"

type CartDrawerProps = {
  opened: boolean
  onClose: () => void
  children: React.ReactNode
}

export function CartDrawer({ opened, onClose, children }: CartDrawerProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      title={
        <span className="text-sm font-extrabold uppercase tracking-tight text-slate-900">
          Keranjang & Checkout
        </span>
      }
      styles={{
        header: {
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: 12,
        },
        body: {
          padding: 0,
          height: "calc(100% - 57px)",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <div className="flex h-full flex-col bg-white">
        {children}
      </div>
    </Drawer>
  )
}

