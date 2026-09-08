import {
  BarChart3,
  ChefHat,
  CreditCard,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Table2,
  Users,
} from "lucide-react"
import type { PosView } from "../types/navigation"

export type NavMenuItem = {
  view: PosView
  label: string
  icon: typeof LayoutDashboard
}

export const MAIN_NAV_ITEMS: NavMenuItem[] = [
  {
    view: "DASHBOARD",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    view: "ORDERS",
    label: "Orders",
    icon: ShoppingCart,
  },
  {
    view: "TABLES",
    label: "Tables",
    icon: Table2,
  },
  {
    view: "KITCHEN",
    label: "Kitchen",
    icon: ChefHat,
  },
  {
    view: "PAYMENTS",
    label: "Payments",
    icon: CreditCard,
  },
  {
    view: "INVENTORY",
    label: "Inventory",
    icon: Package,
  },
  {
    view: "REPORTS",
    label: "Reports",
    icon: BarChart3,
  },
]

export const BOTTOM_NAV_ITEMS: NavMenuItem[] = [
  {
    view: "EMPLOYEES",
    label: "Employees",
    icon: Users,
  },
  {
    view: "SETTINGS",
    label: "Settings",
    icon: Settings,
  },
]

export const ALL_NAV_ITEMS = [...MAIN_NAV_ITEMS, ...BOTTOM_NAV_ITEMS]

