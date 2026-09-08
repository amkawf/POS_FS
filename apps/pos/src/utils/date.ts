export function formatElapsed(isoDate: string): string {
  try {
    const diffMs = Date.now() - new Date(isoDate).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return "Baru saja"
    if (diffMins < 60) return `${diffMins}m lalu`
    const diffHours = Math.floor(diffMins / 60)
    return `${diffHours}j ${diffMins % 60}m lalu`
  } catch {
    return ""
  }
}

export function formatDate(isoDate: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(isoDate))
  } catch {
    return isoDate
  }
}

