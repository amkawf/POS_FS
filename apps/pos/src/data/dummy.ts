import type { OrderItem, Product } from "../types/pos"

export const categories = [
  "ALL",
  "FOOD",
  "DRINK",
  "SNACK",
  "DESSERT",
]

export const products: Product[] = [
  { code: "FD-001", name: "Nasi Goreng", price: 28000, stock: 18 },
  { code: "FD-002", name: "Mie Goreng", price: 26000, stock: 12 },
  { code: "FD-003", name: "Ayam Bakar", price: 32000, stock: 8 },
  { code: "FD-004", name: "Beef Burger", price: 35000, stock: 4 },
  { code: "DR-001", name: "Es Teh", price: 8000, stock: 42 },
  { code: "DR-002", name: "Americano", price: 18000, stock: 21 },
  { code: "DR-003", name: "Cappuccino", price: 22000, stock: 15 },
  { code: "DR-004", name: "Lemon Tea", price: 16000, stock: 9 },
  { code: "SN-001", name: "French Fries", price: 18000, stock: 16 },
  { code: "SN-002", name: "Chicken Wings", price: 24000, stock: 7 },
  { code: "DS-001", name: "Cheesecake", price: 24000, stock: 6 },
  { code: "DS-002", name: "Brownies", price: 20000, stock: 11 },
]

export const orderItems: OrderItem[] = [
  { name: "Nasi Goreng", qty: 2, price: 28000 },
  { name: "Es Teh", qty: 2, price: 8000 },
  { name: "Chicken Wings", qty: 1, price: 24000 },
]