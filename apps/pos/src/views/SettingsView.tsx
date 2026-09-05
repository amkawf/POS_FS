import { Badge } from "@mantine/core"
import { Cloud, Database, Printer, Settings, Store } from "lucide-react"
import { DEV_COMPANY_ID, DEV_STORE_ID } from "../config"

export function SettingsView() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Settings className="text-blue-600" size={24} />
            <span>Pengaturan POS Terminal</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Konfigurasi koneksi, toko aktif, dan perangkat keras kasir.
          </p>
        </div>

        <Badge size="md" color="green" variant="light" leftSection={<Cloud size={13} />}>
          Cloud-Only Active
        </Badge>
      </div>

      <div className="mt-6 max-w-3xl space-y-6">
        {/* STORE & COMPANY INFO */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            <Store size={18} className="text-blue-600" />
            <span>Identitas Toko & Perusahaan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-4">
            <div className="rounded-lg bg-slate-50 p-3">
              <span className="text-slate-500 font-semibold">Nama Toko:</span>
              <div className="font-extrabold text-slate-900 mt-0.5">Dev Store (S1)</div>
              <div className="font-mono text-[10px] text-slate-400 mt-1 break-all">
                ID: {DEV_STORE_ID}
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <span className="text-slate-500 font-semibold">Perusahaan:</span>
              <div className="font-extrabold text-slate-900 mt-0.5">Dev Company (C1)</div>
              <div className="font-mono text-[10px] text-slate-400 mt-1 break-all">
                ID: {DEV_COMPANY_ID}
              </div>
            </div>
          </div>
        </div>

        {/* PRINTER SETTINGS */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            <Printer size={18} className="text-blue-600" />
            <span>Konfigurasi Printer Struk</span>
          </div>

          <div className="space-y-3 text-xs mt-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
              <div>
                <div className="font-bold text-slate-900">Printer Kasir Utama</div>
                <div className="text-[11px] text-slate-500">Thermal 80mm - Auto Cutter</div>
              </div>
              <Badge size="xs" color="green">
                TERHUBUNG
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
              <div>
                <div className="font-bold text-slate-900">Printer Dapur (KDS)</div>
                <div className="text-[11px] text-slate-500">Thermal 80mm - Cetak Tiket Otomatis</div>
              </div>
              <Badge size="xs" color="blue">
                SIAP
              </Badge>
            </div>
          </div>
        </div>

        {/* CLOUD & BACKEND STATUS */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            <Database size={18} className="text-blue-600" />
            <span>Koneksi Backend & Arsitektur</span>
          </div>

          <div className="text-xs text-slate-600 space-y-2 mt-3">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span>Backend Engine</span>
              <span className="font-bold text-slate-900">Go (Gin) + PostgreSQL (pgx/sqlc)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span>Deployment Model</span>
              <span className="font-bold text-slate-900">Cloud-Only Restaurant-Grade</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span>PWA Resilience</span>
              <span className="font-bold text-emerald-600">Online & Sync Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
