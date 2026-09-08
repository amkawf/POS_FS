export function formatPrice(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value)
}

export function formatRupiah(value: number): string {
  return `Rp ${new Intl.NumberFormat("id-ID").format(value)}`
}

