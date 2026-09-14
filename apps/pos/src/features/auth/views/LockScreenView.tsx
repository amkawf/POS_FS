import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Badge, Button, Loader, Modal, NumberInput } from "@mantine/core"
import { Delete, KeyRound, Lock, ShieldCheck, Store, UserCheck, Utensils } from "lucide-react"
import { useAuth } from "../../../context/AuthContext"
import { fetchStoreStaff } from "../../../api"
import { formatRupiah } from "../../../utils/currency"

export function LockScreenView() {
  const { storeId, loginWithPin, openShift, activeShift } = useAuth()
  const [pin, setPin] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Real-time Clock
  const [currentTime, setCurrentTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Mengambil daftar nama staf toko untuk kemudahan referensi
  const { data: staffList = [] } = useQuery({
    queryKey: ["store-staff", storeId],
    queryFn: () => fetchStoreStaff(storeId),
  })

  // Modal Buka Kasir (Register Open)
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false)
  const [startingCash, setStartingCash] = useState<number>(200000)
  const [isOpeningShift, setIsOpeningShift] = useState(false)

  // Tangani klik angka di Numpad
  const handleDigitPress = (digit: string) => {
    if (pin.length < 6 && !isSubmitting) {
      setErrorMsg(null)
      const nextPin = pin + digit
      setPin(nextPin)
      // Auto-submit saat 4 digit tercapai
      if (nextPin.length === 4) {
        submitPin(nextPin)
      }
    }
  }

  const handleBackspace = () => {
    setErrorMsg(null)
    setPin((prev) => prev.slice(0, -1))
  }

  const handleClear = () => {
    setErrorMsg(null)
    setPin("")
  }

  // Verifikasi PIN ke backend
  const submitPin = async (inputPin: string) => {
    setIsSubmitting(true)
    setErrorMsg(null)
    try {
      const user = await loginWithPin(inputPin)
      // Jika kasir dan belum punya shift aktif, tampilkan modal Buka Kasir
      if (user.role === "CASHIER" && !activeShift) {
        setIsShiftModalOpen(true)
      }
    } catch (err: any) {
      setErrorMsg(err.message || "PIN salah, silakan coba lagi.")
      setPin("")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Keyboard listener agar kasir juga bisa mengetik dari keyboard fisik
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigitPress(e.key)
      } else if (e.key === "Backspace") {
        handleBackspace()
      } else if (e.key === "Escape") {
        handleClear()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [pin, isSubmitting])

  // Konfirmasi Buka Kasir
  const handleConfirmOpenShift = async () => {
    setIsOpeningShift(true)
    try {
      await openShift(startingCash)
      setIsShiftModalOpen(false)
    } catch (err: any) {
      alert(err.message || "Gagal membuka sesi kasir")
    } finally {
      setIsOpeningShift(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-between bg-slate-100/70 p-4 sm:p-6 text-slate-900 select-none">
      {/* HEADER: BRANDING, STATUS & JAM */}
      <header className="flex w-full max-w-4xl items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-extrabold text-white shadow-sm shadow-blue-500/25">
            P
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-tight text-slate-900">
              POS TERMINAL
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
              <Store size={12} strokeWidth={2} />
              <span>STORE-001</span>
            </div>
          </div>
        </div>

        {/* Indikator Online & Jam Real-Time */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 border-r border-slate-200 pr-4">
            <div className="relative flex h-2.5 w-2.5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40" />
            </div>
            <span className="text-[10px] font-extrabold tracking-wider text-slate-700">ONLINE</span>
          </div>

          <div className="text-right">
            <div className="font-mono text-base font-extrabold tracking-wider text-slate-900">
              {currentTime.toLocaleTimeString("id-ID")}
            </div>
            <div className="text-[10px] font-medium text-slate-400">
              {currentTime.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </header>

      {/* BODY: KARTU UTAMA NUMPAD (TABLET POS STYLE) */}
      <main className="my-auto flex w-full max-w-sm flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        {/* ICON & TITLE */}
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
          <Lock size={22} strokeWidth={2.5} />
        </div>
        <h2 className="text-base font-extrabold tracking-tight text-slate-900">Layar Terkunci</h2>
        <p className="text-xs font-medium text-slate-400 mt-0.5">Masukkan 4-digit PIN staf untuk mulai bertugas</p>

        {/* PIN DOTS INDICATOR */}
        <div className="my-6 flex items-center gap-3.5">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx
            return (
              <div
                key={idx}
                className={`h-3.5 w-3.5 rounded-full transition-all duration-200 ${
                  isFilled
                    ? "scale-110 bg-blue-600 border-2 border-blue-600 shadow-xs shadow-blue-500/40"
                    : "border-2 border-slate-300 bg-slate-100/80"
                }`}
              />
            )
          })}
        </div>

        {/* ERROR MESSAGE ALERT */}
        {errorMsg && (
          <div className="mb-4 w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-600 animate-shake">
            {errorMsg}
          </div>
        )}

        {/* TOUCH NUMPAD GRID (3x4) */}
        <div className="grid grid-cols-3 gap-2.5 w-full">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={isSubmitting}
              onClick={() => handleDigitPress(digit)}
              className="flex h-14 w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50/60 font-mono text-xl font-bold text-slate-800 shadow-2xs transition-all duration-150 hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700 active:scale-95 active:bg-blue-600 active:text-white cursor-pointer disabled:opacity-50"
            >
              {digit}
            </button>
          ))}

          {/* TOMBOL CLEAR (C) */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleClear}
            className="flex h-14 w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50/40 text-xs font-extrabold text-slate-400 transition-all duration-150 hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            CLEAR
          </button>

          {/* TOMBOL ANGKA 0 */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleDigitPress("0")}
            className="flex h-14 w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50/60 font-mono text-xl font-bold text-slate-800 shadow-2xs transition-all duration-150 hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700 active:scale-95 active:bg-blue-600 active:text-white cursor-pointer disabled:opacity-50"
          >
            0
          </button>

          {/* TOMBOL BACKSPACE */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleBackspace}
            className="flex h-14 w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50/40 text-slate-500 transition-all duration-150 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? <Loader size="xs" color="blue" /> : <Delete size={18} strokeWidth={2} />}
          </button>
        </div>

        {/* DEMO STAFF QUICK SHORTCUTS */}
        <div className="mt-6 w-full border-t border-slate-100 pt-5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Shortcut Akun Demo
          </p>
          <div className="flex flex-col gap-1.5 w-full">
            {staffList.map((s) => {
              const demoPin = s.role === "CASHIER" ? "1234" : s.role === "KITCHEN" ? "5678" : "9999"
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setPin(demoPin)
                    submitPin(demoPin)
                  }}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-700 shadow-2xs transition-all hover:border-blue-300 hover:bg-blue-50/50 active:scale-98 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{s.name}</span>
                    <Badge size="xs" variant="light" color={s.role === "CASHIER" ? "blue" : s.role === "KITCHEN" ? "orange" : "teal"}>
                      {s.role}
                    </Badge>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                    PIN: {demoPin}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
        <ShieldCheck size={14} className="text-blue-600" />
        <span>POS Restoran Aman Terenkripsi dengan Bcrypt & JWT Session</span>
      </footer>

      {/* ========================================== */}
      {/* MODAL BUKA KASIR (REGISTER OPENING MODAL)  */}
      {/* ========================================== */}
      <Modal
        opened={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Store size={15} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-extrabold text-slate-900">Buka Sesi Kasir Baru</span>
          </div>
        }
        centered
        radius="lg"
      >
        <div className="flex flex-col gap-4 text-slate-800 pt-1">
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-slate-600">
            <p className="font-medium">
              Selamat bertugas! Silakan hitung dan masukkan <strong>uang kas awal</strong> yang ada di dalam laci kasir saat ini.
            </p>
          </div>

          <NumberInput
            label="Modal Awal di Laci Kasir (Starting Cash)"
            description="Uang receh/modal operasional untuk kembalian pembeli"
            value={startingCash}
            onChange={(val) => setStartingCash(typeof val === "number" ? val : 0)}
            min={0}
            step={50000}
            prefix="Rp "
            thousandSeparator="."
            decimalSeparator=","
            styles={{
              input: {
                fontWeight: 700,
                fontSize: "14px",
                borderColor: "#cbd5e1",
              },
            }}
          />

          <div className="mt-2 flex justify-end gap-2 border-t border-slate-100 pt-3">
            <Button
              color="blue"
              fullWidth
              loading={isOpeningShift}
              onClick={handleConfirmOpenShift}
              styles={{
                root: {
                  fontWeight: 700,
                  borderRadius: "8px",
                },
              }}
            >
              Buka Kasir & Mulai Transaksi
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

