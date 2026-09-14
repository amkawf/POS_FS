import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { CashierShift, User } from "../types/pos"
import { pinLogin, openCashierShift, closeCashierShift } from "../api"
import { DEV_COMPANY_ID, DEV_STORE_ID } from "../config"

type AuthContextType = {
  currentUser: User | null
  token: string | null
  activeShift: CashierShift | null
  isLocked: boolean
  companyId: string
  storeId: string
  loginWithPin: (pin: string) => Promise<User>
  quickLock: () => void
  openShift: (startingCash: number) => Promise<CashierShift>
  closeShift: (actualCash: number, expectedCash: number, notes?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY_USER = "pos_active_user"
const STORAGE_KEY_TOKEN = "pos_token"
const STORAGE_KEY_SHIFT = "pos_active_shift"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [companyId] = useState(DEV_COMPANY_ID)
  const [storeId] = useState(DEV_STORE_ID)

  // State identitas staf aktif
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER)
    return saved ? JSON.parse(saved) : null
  })

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_TOKEN)
  })

  const [activeShift, setActiveShift] = useState<CashierShift | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SHIFT)
    return saved ? JSON.parse(saved) : null
  })

  // Layar terkunci jika belum login
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return !localStorage.getItem(STORAGE_KEY_TOKEN)
  })

  // Sinkronisasi ke LocalStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser))
    } else {
      localStorage.removeItem(STORAGE_KEY_USER)
    }
  }, [currentUser])

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEY_TOKEN, token)
    } else {
      localStorage.removeItem(STORAGE_KEY_TOKEN)
    }
  }, [token])

  useEffect(() => {
    if (activeShift) {
      localStorage.setItem(STORAGE_KEY_SHIFT, JSON.stringify(activeShift))
    } else {
      localStorage.removeItem(STORAGE_KEY_SHIFT)
    }
  }, [activeShift])

  // Login cepat menggunakan PIN
  const loginWithPin = async (pin: string): Promise<User> => {
    const res = await pinLogin({ store_id: storeId, pin })
    setCurrentUser(res.user)
    setToken(res.token)
    if (res.active_shift) {
      setActiveShift(res.active_shift)
    }
    // CONTROLLED UNLOCK:
    // Jika Kasir belum punya shift aktif, tahan kunci agar LockScreen menampilkan modal Buka Kasir.
    // Selain itu (misal: Kitchen, Manager, atau kasir yang shift-nya masih jalan), langsung buka kunci!
    if (res.user.role === "CASHIER" && !res.active_shift) {
      setIsLocked(true)
    } else {
      setIsLocked(false)
    }
    return res.user
  }

  // Kunci layar seketika saat kasir beranjak
  const quickLock = () => {
    setIsLocked(true)
  }

  // Buka shift kasir (Modal Awal)
  const openShift = async (startingCash: number): Promise<CashierShift> => {
    if (!currentUser) throw new Error("Tidak ada staf yang aktif")
    const shift = await openCashierShift({
      company_id: companyId,
      store_id: storeId,
      user_id: currentUser.id,
      starting_cash: startingCash,
    })
    setActiveShift(shift)
    
    // Buka kunci layar setelah modal awal berhasil disetor ke sistem
    setIsLocked(false)
    return shift
  }

  // Tutup shift kasir
  const closeShift = async (actualCash: number, expectedCash: number, notes?: string): Promise<void> => {
    if (!activeShift) throw new Error("Tidak ada shift kasir yang aktif")
    await closeCashierShift({
      shift_id: activeShift.id,
      actual_ending_cash: actualCash,
      expected_ending_cash: expectedCash,
      notes,
    })
    setActiveShift(null)
  }

  // Logout penuh
  const logout = () => {
    setCurrentUser(null)
    setToken(null)
    setActiveShift(null)
    setIsLocked(true)
    localStorage.clear()
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        activeShift,
        isLocked,
        companyId,
        storeId,
        loginWithPin,
        quickLock,
        openShift,
        closeShift,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook kustom untuk kemudahan akses context di komponen lain
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider")
  }
  return context
}

