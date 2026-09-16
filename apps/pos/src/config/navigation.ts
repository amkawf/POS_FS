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
import type { Role } from "../types/pos" 

export type NavMenuItem = {
  view: PosView
  label: string
  icon: typeof LayoutDashboard
  path: string
  roles: Role[]
}

export const MAIN_NAV_ITEMS: NavMenuItem[] = [
  {
    view: "DASHBOARD",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    roles: ["OWNER", "MANAGER"],
  },
  {
    view: "ORDERS",
    label: "Orders",
    icon: ShoppingCart,
    path: "/",
    roles: ["OWNER", "MANAGER", "CASHIER"],
  },
  {
    view: "TABLES",
    label: "Tables",
    icon: Table2,
    path: "/tables",
    roles: ["OWNER", "MANAGER", "CASHIER"],
  },
  {
    view: "KITCHEN",
    label: "Kitchen",
    icon: ChefHat,
    path: "/kitchen",
    roles: ["OWNER", "MANAGER", "KITCHEN"],
  },
  {
    view: "PAYMENTS",
    label: "Payments",
    icon: CreditCard,
    path: "/payments",
    roles: ["OWNER", "MANAGER", "CASHIER"],
  },
  {
    view: "INVENTORY",
    label: "Inventory",
    icon: Package,
    path: "/inventory",
    roles: ["OWNER", "MANAGER"],
  },
  {
    view: "REPORTS",
    label: "Reports",
    icon: BarChart3,
    path: "/reports",
    roles: ["OWNER", "MANAGER"],
  },
]

export const BOTTOM_NAV_ITEMS: NavMenuItem[] = [
  {
    view: "EMPLOYEES",
    label: "Employees",
    icon: Users,
    path: "/employees",
    roles: ["OWNER", "MANAGER"],
  },
  {
    view: "SETTINGS",
    label: "Settings",
    icon: Settings,
    path: "/settings",
    roles: ["OWNER", "MANAGER"],
  },
]

export const ALL_NAV_ITEMS = [...MAIN_NAV_ITEMS, ...BOTTOM_NAV_ITEMS]

