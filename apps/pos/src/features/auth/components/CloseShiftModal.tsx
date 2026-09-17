import { useState, useEffect } from "react"
import { Button, Modal, NumberInput, Textarea } from "@mantine/core"
import { AlertTriangle, CheckCircle2, ReceiptText, ShieldAlert } from "lucide-react"
import { formatRupiah } from "../../../utils/currency"

type CloseShiftModalProps = {
  opened: boolean
  onClose: () => void
  startingCash: number
  cashSales: number
  cashOrderCount?: number
  cashierName?: string 
  onConfirmClose: (actualCash: number, expectedCash: number, notes?: string) => Promise<void>
  isClosing: boolean
}

export function CloseShiftModal({
  opened,
  onClose,
  startingCash,
  cashSales,
  cashOrderCount,
  cashierName,  
  onConfirmClose,
  isClosing,
}: CloseShiftModalProps) {
  const expectedCash = startingCash + cashSales

  // State uang fisik nyata di laci yang dihitung oleh kasir
  const [actualCash, setActualCash] = useState<number>(expectedCash)
  const [notes, setNotes] = useState<string>("")

  // Update nilai default saat modal terbuka
  useEffect(() => {
    if (opened) {
      setActualCash(expectedCash)
      setNotes("")
    }
  }, [opened, expectedCash])

  // Hitung selisih laci: Uang Nyata - Uang Sistem
  const difference = actualCash - expectedCash

  const handleCloseShift = async () => {
    await onConfirmClose(actualCash, expectedCash, notes.trim() ? notes.trim() : undefined)
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <ReceiptText size={16} strokeWidth={2.5} />
          </div>
          <span className="text-sm font-extrabold text-slate-900">
            Tutup Sesi Kasir & Rekonsiliasi Laci
          </span>
        </div>
      }
      centered
      radius="lg"
      size="md"
    >
      <div className="flex flex-col gap-4 text-slate-800 pt-1">
        {/* KARTU RINGKASAN KAS SISTEM */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
            Perhitungan Sistem (Audited)
          </div>
          <div className="space-y-1.5">
            {/* 1. Baris Nama Kasir */}
            {cashierName && (
              <div className="flex justify-between">
                <span className="text-slate-500">Kasir Bertugas:</span>
                <span className="font-semibold text-slate-800">{cashierName}</span>
              </div>
            )}

            {/* 2. Baris Modal Kas Awal */}
            <div className="flex justify-between">
              <span className="text-slate-500">Modal Kas Awal:</span>
              <span className="font-mono font-bold text-slate-700">{formatRupiah(startingCash)}</span>
            </div>

            {/* 3. Baris Penjualan Tunai + Jumlah Nota */}
            <div className="flex justify-between">
              <span className="text-slate-500">Total Penjualan Tunai (CASH):</span>
              <span className="font-mono font-bold text-emerald-600">
                +{formatRupiah(cashSales)} {cashOrderCount !== undefined && `(${cashOrderCount} nota)`}
              </span>
            </div>

            {/* 4. Baris Total Seharusnya */}
            <div className="border-t border-slate-200/80 pt-1.5 flex justify-between text-slate-900 font-extrabold">
              <span>Kas Seharusnya di Laci:</span>
              <span className="font-mono text-sm text-blue-700">{formatRupiah(expectedCash)}</span>
            </div>
          </div>
        </div>

        {/* INPUT UANG FISIK NYATA OLEH KASIR */}
        <div>
          <NumberInput
            label="Uang Fisik di Laci Kasir (Aktual)"
            description="Hitung seluruh uang kertas dan koin yang ada di laci kasir saat ini"
            value={actualCash}
            onChange={(val) => setActualCash(typeof val === "number" ? val : 0)}
            min={0}
            step={10000}
            prefix="Rp "
            thousandSeparator="."
            decimalSeparator=","
            styles={{
              input: {
                fontWeight: 700,
                fontSize: "15px",
                borderColor: "#cbd5e1",
              },
            }}
          />
        </div>

        {/* INDIKATOR SELISIH (VARIANCE BADGE) */}
        {difference === 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-800">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Uang Laci PAS (Sesuai dengan sistem).</span>
          </div>
        )}

        {difference > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-800">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <div>
              <span>Uang Laci LEBIH sebesar </span>
              <span className="font-mono font-bold">+{formatRupiah(difference)}</span>
            </div>
          </div>
        )}

        {difference < 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-800">
            <ShieldAlert size={16} className="text-red-600 shrink-0" />
            <div>
              <span>Uang Laci KURANG sebesar </span>
              <span className="font-mono font-bold text-red-700">
                -{formatRupiah(Math.abs(difference))}
              </span>
            </div>
          </div>
        )}

        {/* CATATAN PENJELASAN (NOTES) */}
        <Textarea
          label="Catatan Kasir (Opsional)"
          placeholder={
            difference !== 0
              ? "Tulis alasan jika ada selisih uang (contoh: ada tip atau uang kembalian tertinggal)..."
              : "Catatan penutupan shift..."
          }
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
          rows={2}
          styles={{
            input: {
              fontSize: "12px",
            },
          }}
        />

        {/* TOMBOL AKSI */}
        <div className="mt-2 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <Button variant="default" onClick={onClose} disabled={isClosing}>
            Batal
          </Button>
          <Button
            color="red"
            loading={isClosing}
            onClick={handleCloseShift}
            styles={{
              root: {
                fontWeight: 700,
                borderRadius: "8px",
              },
            }}
          >
            Konfirmasi & Tutup Kasir
          </Button>
        </div>
      </div>
    </Modal>
  )
}

