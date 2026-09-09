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
  path: string
}

export const MAIN_NAV_ITEMS: NavMenuItem[] = [
  {
    view: "DASHBOARD",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    view: "ORDERS",
    label: "Orders",
    icon: ShoppingCart,
    path: "/",
  },
  {
    view: "TABLES",
    label: "Tables",
    icon: Table2,
    path: "/tables",
  },
  {
    view: "KITCHEN",
    label: "Kitchen",
    icon: ChefHat,
    path: "/kitchen",
  },
  {
    view: "PAYMENTS",
    label: "Payments",
    icon: CreditCard,
    path: "/payments",
  },
  {
    view: "INVENTORY",
    label: "Inventory",
    icon: Package,
    path: "/inventory",
  },
  {
    view: "REPORTS",
    label: "Reports",
    icon: BarChart3,
    path: "/reports",
  },
]

export const BOTTOM_NAV_ITEMS: NavMenuItem[] = [
  {
    view: "EMPLOYEES",
    label: "Employees",
    icon: Users,
    path: "/employees",
  },
  {
    view: "SETTINGS",
    label: "Settings",
    icon: Settings,
    path: "/settings",
  },
]

export const ALL_NAV_ITEMS = [...MAIN_NAV_ITEMS, ...BOTTOM_NAV_ITEMS]

