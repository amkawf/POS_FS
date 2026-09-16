# Dokumentasi Lengkap Proyek: POS Restaurant Platform

Dokumen ini menyajikan panduan arsitektur, struktur kode, skema database, alur kerja operasional, dan referensi API untuk platform POS restoran yang telah dikembangkan sejauh ini.

---

## 1. Ringkasan Proyek & Arsitektur

Platform ini adalah **Restaurant/Cafe Point of Sale (POS)** tingkat restoran (*cloud-only*) yang dirancang menggunakan pendekatan **Incremental Vertical Slice**.

### Prinsip Arsitektur Utama (Locked Architecture)
* **Backend**:
  * **Bahasa & Framework**: Go 1.24, Gin Web Framework.
  * **Pola Arsitektur**: Modular Monolith & Pragmatic Domain-Driven Design (DDD).
  * **Database**: PostgreSQL 17 (koneksi menggunakan `pgx/v5` dan query builder/type-safe SQL menggunakan `sqlc`).
  * **Layering Ketat**:
    $$\text{Interface (HTTP)} \longrightarrow \text{Application (Use Case)} \longrightarrow \text{Domain} \longleftarrow \text{Infrastructure (Postgres/sqlc)}$$
  * **Batasan Transaksi**: Transaksi database dikontrol di layer **Application (Use Case boundary)** menggunakan `TransactionManager`.
* **Frontend**:
  * **Monorepo**: Turborepo + `pnpm` workspace (`frontend/`).
  * **Stack**: React 19, TypeScript, Vite, Mantine UI v7, Tailwind CSS v4, `@tanstack/react-query` v5, Lucide React Icons.
  * **Surface Model**: Direncanakan 4 PWA mandiri (`pos`, `ordering`, `kitchen`, `management`). Surface yang saat ini telah aktif dan fungsional adalah **Terminal POS (`apps/pos`)**.

---

## 2. Struktur Direktori Proyek

```text
D:\POS\
├── CLAUDE.md                             # Pedoman master arsitektur & aturan pengembangan
├── DOCUMENTATION.md                      # Dokumentasi teknis lengkap proyek (file ini)
│
├── backend\                              # Service Backend (Go)
│   ├── cmd\
│   │   └── api\
│   │       └── main.go                   # Entry point server HTTP & graceful shutdown
│   ├── docker-compose.yml                # PostgreSQL 17 (Host: 5433 -> Container: 5432)
│   ├── migrations\                       # File migrasi SQL bertahap (000001 s.d. 000009)
│   │   ├── 000001_create_companies.*
│   │   ├── 000002_create_stores.*
│   │   ├── 000003_create_menus.*
│   │   ├── 000004_create_menu_categories.*
│   │   ├── 000005_create_menu_items.*
│   │   ├── 000006_create_store_menu_items.*
│   │   ├── 000007_create_menu_category_items.*
│   │   ├── 000008_create_orders.*
│   │   └── 000009_create_order_items.*
│   ├── scripts\
│   │   └── seed_dev.sql                  # Data dummy inisial (Dev Company, Store, Menu Items)
│   ├── sqlc\
│   │   └── sqlc.yaml                     # Konfigurasi code generator sqlc
│   └── internal\
│       ├── bootstrap\
│       │   └── app.go                    # Manual Dependency Injection (Wiring Use Cases & Handler)
│       ├── config\
│       │   └── config.go                 # Konfigurasi env dengan default fallback lokal
│       ├── database\
│       │   ├── postgres.go               # Inisialisasi pool pgx (pgxpool)
│       │   └── transaction.go            # TransactionManager (WithinTransaction)
│       ├── http\
│       │   ├── middleware\
│       │   │   └── cors.go               # CORS Middleware (mengizinkan port 5173 Vite)
│       │   └── router.go                 # Setup router Gin, Recovery, & /health
│       ├── menu\                         # Modul Menu
│       │   ├── application\
│       │   │   └── list_menu_items.go
│       │   ├── domain\
│       │   │   └── menu_item.go
│       │   ├── http\
│       │   │   └── handler.go            # GET /api/v1/menu-items
│       │   └── repository\
│       │       ├── postgres_menu_item_repositories.go
│       │       ├── queries\menu_items.sql
│       │       └── generated\            # Kode hasil sqlc generate
│       └── order\                        # Modul Order (Pesanan & Pembayaran)
│           ├── domain\
│           │   ├── order.go              # Entitas Order, OrderItem, state transition, validasi
│           │   └── order_test.go         # Unit test logika domain
│           ├── application\
│           │   ├── create_order.go       # Use Case membuat order baru (transaksional)
│           │   ├── get_order.go          # Use Case mengambil detail 1 order
│           │   ├── list_orders.go        # Use Case mengambil daftar antrean order
│           │   ├── pay_order.go          # Use Case memproses pembayaran (Cash/QRIS)
│           │   └── delete_order.go       # Use Case menghapus saved order dengan proteksi
│           ├── repository\
│           │   ├── order_repository.go   # Interface OrderRepository
│           │   ├── postgres_order_repositories.go # Implementasi pgx + sqlc
│           │   ├── mappers.go            # Konversi Postgres types <-> Domain entities
│           │   ├── numeric.go            # Helper konversi NUMERIC(15,2) <-> int64
│           │   ├── queries\orders.sql    # Raw SQL queries untuk sqlc
│           │   └── generated\            # Kode hasil sqlc generate
│           └── http\
│               ├── dto.go                # Request & Response structs (JSON DTO)
│               └── handler.go            # REST Endpoints controller
│
└── frontend\                             # Monorepo Frontend
    ├── package.json                      # Turbo monorepo root
    ├── pnpm-workspace.yaml
    └── apps\
        └── pos\                          # PWA Kasir (Terminal POS)
            ├── src\
            │   ├── main.tsx              # React root & MantineProvider setup
            │   ├── App.tsx               # State coordinator kasir (Cart, Actions, Modals)
            │   ├── config.ts             # Base URL API & UUID Dev Company/Store
            │   ├── api\
            │   │   └── client.ts         # Centralized HTTP client (fetch API wrappers)
            │   ├── types\
            │   │   └── pos.ts            # Definisi tipe TypeScript UI (Product, Cart Item)
            │   ├── data\
            │   │   └── dummy.ts          # Kategori menu fallback
            │   └── components\
            │       ├── TopBar.tsx        # Header, search box, saved orders counter badge
            │       ├── SideBar.tsx       # Sidebar navigasi
            │       ├── catalog\
            │       │   ├── CategoryTabs.tsx # Filter kategori produk
            │       │   ├── ProductCard.tsx  # Kartu item menu
            │       │   └── ProductGrid.tsx  # Grid katalog produk
            │       ├── order\
            │       │   ├── OrderItem.tsx    # Baris item di keranjang (+ / - / hapus)
            │       │   ├── OrderPanel.tsx   # Panel daftar item keranjang
            │       │   ├── OrderSummary.tsx # Rincian subtotal, tax 10%, total
            │       │   ├── OrderAction.tsx  # Tombol aksi (Save, Clear, PAY)
            │       │   └── SavedOrdersModal.tsx # Modal Hold & Recall + Hapus Pesanan
            │       └── payment\
            │           ├── PaymentModal.tsx # Modal pembayaran (Cash pecahan & QRIS)
            │           └── ReceiptModal.tsx # Struk kasir termal & cetak struk
```

---

## 3. Database Schema & Migrasi

Database PostgreSQL menggunakan nama database `pos` yang berjalan pada port host `5433` (port container `5432`).

### Tabel-Tabel Utama:
1. **`companies` (`000001`)**: Menyimpan data perusahaan/tenant induk.
2. **`stores` (`000002`)**: Cabang toko/restoran milik perusahaan (`company_id`).
3. **`menus` (`000003`) & `menu_categories` (`000004`)**: Struktur pengelompokan menu restoran.
4. **`menu_items` (`000005`)**: Master produk makanan/minuman dengan kolom `sku`, `name`, `base_price` berformat `NUMERIC(15,2)`.
5. **`orders` (`000008`)**:
   - `id`: UUID (Primary Key).
   - `company_id`, `store_id`: Multi-tenant boundary.
   - `order_number`: Nomor pesanan unik berformat `ORD-YYYYMMDD-XXXXXXXX`.
   - `order_type`: `DINE_IN`, `TAKEAWAY`, `DELIVERY`.
   - `order_source`: `POS`, `WAITER`, `QR`.
   - `status`: `DRAFT`, `OPEN`, `COMPLETED`, `CANCELLED`, `VOID`, `REFUNDED`.
   - `customer_name`: Nama tamu (opsional).
   - `subtotal`, `discount_amount`, `tax_amount`, `service_amount`, `total_amount`: Nilai moneter desimal aman.
   - `notes`: Catatan pembayaran/order.
   - `opened_at`, `completed_at`, `cancelled_at`: Timestamp audit lifecycle.
6. **`order_items` (`000009`)**:
   - Snapshot data produk saat dipesan (`item_name`, `sku`, `quantity`, `unit_price`, `total_amount`, `notes`, `status`).

---

## 4. Arsitektur Backend (Go)

### A. Konfigurasi (`internal/config/config.go`)
Memiliki fungsi `getEnv(key, fallback)` yang secara default langsung menghubungkan ke Docker lokal tanpa konfigurasi manual:
- `DATABASE_HOST` $\rightarrow$ `localhost`
- `DATABASE_PORT` $\rightarrow$ `5433`
- `DATABASE_NAME` $\rightarrow$ `pos`
- `DATABASE_USER` $\rightarrow$ `pos`
- `DATABASE_PASSWORD` $\rightarrow$ `pos_dev_password`
- `APP_PORT` $\rightarrow$ `8080`

### B. Transaksi Database (`internal/database/transaction.go`)
Menyediakan abstraksi `TransactionManager`:
```go
func (tm *TransactionManager) WithinTransaction(ctx context.Context, fn func(ctx context.Context, tx pgx.Tx) error) error
```
Semua operasi penulisan berganda (seperti membuat pesanan beserta item-itemnya, atau menghapus pesanan) dieksekusi di dalam blok transaksi PostgreSQL atomik.

### C. Domain Model (`internal/order/domain/order.go`)
Mengisolasi seluruh *business invariants*:
* `NewOrder(...)`: Menginisialisasi pesanan berstatus `DRAFT`.
* `AddItem(...)`: Menambahkan item, memvalidasi kuantitas $>0$ & harga $\ge 0$, serta menghitung ulang subtotal & total.
* `Open()`: Membuka pesanan menjadi `OPEN` (hanya jika minimal memiliki 1 item).
* `Complete(notes *string)`: Menyelesaikan pesanan ke status `COMPLETED`, mencatat `completed_at`, dan menyimpan rincian bayar.
* `CanDelete()`: Menolak penghapusan jika status sudah `COMPLETED` (`ErrOrderAlreadyCompleted`) demi audit finansial.

### D. Application Layer (Use Cases)
1. **`CreateOrderUseCase`**: Menghasilkan nomor acak order, memvalidasi item, membuka status pesanan, lalu menyimpannya dalam 1 transaksi DB.
2. **`GetOrderUseCase`**: Mengambil detail satu pesanan beserta relasi item-itemnya.
3. **`ListOrdersUseCase`**: Mengambil antrean pesanan aktif berdasarkan `company_id` & `store_id` (dengan opsi filter status `OPEN`).
4. **`PayOrderUseCase`**: Memvalidasi jumlah bayar $\ge$ total tagihan, menghitung uang kembalian (*change*), mengubah status menjadi `COMPLETED`, dan memperbarui database.
5. **`DeleteOrderUseCase`**: Memeriksa kelayakan hapus (`CanDelete`), lalu menghapus baris di `order_items` kemudian di `orders` secara transaksional.

---

## 5. Arsitektur Frontend (React 19 POS)

### A. State Management
* **Server State**: Dikelola sepenuhnya oleh `@tanstack/react-query`.
  * `queryKey: ["menu-items"]`: Mengambil katalog produk dari backend.
  * `queryKey: ["orders", ..., "OPEN"]`: Memantau jumlah antrean pesanan belum bayar secara realtime (auto-refetch 15 detik).
* **Client / UI State**:
  * `orderItems`: Keranjang item belanja saat ini.
  * `activeOrderId`: Menandai ID pesanan jika sedang me-recall pesanan lama (*Saved Order*).
  * `orderType`: Toggle `DINE_IN` vs `TAKEAWAY`.
  * `searchQuery` & `activeCategory`: Pencarian katalog dan filter tab.

### B. Komponen Utama
* **[TopBar](file:///d:/POS/frontend/apps/pos/src/components/TopBar.tsx)**: Kotak pencarian menu dan tombol cepat *Saved Orders* dengan badge counter pesanan aktif.
* **[CategoryTabs](file:///d:/POS/frontend/apps/pos/src/components/catalog/CategoryTabs.tsx)**: Filter kategori makanan/minuman (`ALL`, `FOOD`, `DRINK`, `SNACK`, `DESSERT`).
* **[ProductGrid](file:///d:/POS/frontend/apps/pos/src/components/catalog/ProductGrid.tsx)**: Menampilkan menu dari database secara dinamis.
* **[SavedOrdersModal](file:///d:/POS/frontend/apps/pos/src/components/order/SavedOrdersModal.tsx)**:
  * Menampilkan antrean pesanan tersimpan (*Hold & Recall*).
  * Filter tab: `OPEN`, `ALL`, `COMPLETED`.
  * Tombol **Load to Checkout**: Menarik data pesanan ke keranjang kasir.
  * Tombol **Hapus Pesanan** (Ikon Tong Sampah): Menampilkan modal konfirmasi sebelum data dihapus permanen.
* **[PaymentModal](file:///d:/POS/frontend/apps/pos/src/components/payment/PaymentModal.tsx)**:
  * Pilihan metode **TUNAI (CASH)**: Pilihan pecahan cepat (*Uang Pas, 10k, 20k, 50k, 100k, 200k*), input uang diterima, dan kalkulator kembalian otomatis.
  * Pilihan metode **QRIS**: Mock QR code dinamis dan simulasi konfirmasi bayar sukses.
* **[ReceiptModal](file:///d:/POS/frontend/apps/pos/src/components/payment/ReceiptModal.tsx)**:
  * Tampilan struk kasir termal dengan rincian item, pajak, total, pembayaran, dan kembalian.
  * Terintegrasi dengan fungsi browser `window.print()`.

---

## 6. Alur Operasional Kasir (End-to-End Workflows)

### Alur 1: Penjualan Langsung & Checkout Tunai
1. Kasir memilih menu dari katalog produk $\rightarrow$ Item masuk ke panel pesanan samping.
2. Kasir memilih jenis pesanan (`DINE IN` atau `TAKEAWAY`).
3. Kasir menekan tombol **PAY Rp [Total]** $\rightarrow$ Muncul `PaymentModal`.
4. Kasir memilih nominal uang yang diterima (atau klik tombol *Uang Pas* / *Pecahan Cepat*) $\rightarrow$ Uang kembalian terhitung otomatis.
5. Kasir menekan **Bayar Tunai** $\rightarrow$ Sistem membuat pesanan dan menyelesaikan pembayaran di database (`status = COMPLETED`).
6. Muncul `ReceiptModal` $\rightarrow$ Kasir dapat mencetak struk lalu menekan **Pesanan Baru** untuk membersihkan keranjang.

### Alur 2: Simpan Pesanan Sementara (Hold Order)
1. Tamu memesan makanan di meja, kasir memasukkan item ke keranjang.
2. Kasir menekan tombol **Save**.
3. Sistem mengirimkan payload ke `POST /api/v1/orders` $\rightarrow$ Pesanan tersimpan di PostgreSQL dengan nomor unik (misal: `#ORD-20260904-XXXX`).
4. Keranjang otomatis bersih, dan badge counter *Saved Orders* di TopBar bertambah.

### Alur 3: Panggil Pesanan Tersimpan (Recall to Checkout)
1. Kasir membuka menu **Saved Orders** di TopBar atau Sidebar.
2. Kasir melihat daftar pesanan berstatus `OPEN`.
3. Kasir menekan **Load to Checkout** pada pesanan yang ingin dibayar.
4. Data item dan nomor pesanan dimuat kembali ke keranjang kasir dengan label badge **`RECALLED`**.
5. Kasir dapat langsung memproses pembayaran via tombol **PAY**.

### Alur 4: Pembatalan / Hapus Pesanan Tersimpan
1. Di dalam `SavedOrdersModal`, kasir menekan tombol tong sampah merah pada pesanan yang batal.
2. Muncul dialog konfirmasi: *"Apakah Anda yakin ingin menghapus pesanan #ORD-XXXX?"*.
3. Jika kasir menekan **Ya, Hapus Pesanan** $\rightarrow$ API `DELETE /api/v1/orders/:id` dijalankan $\rightarrow$ Relasi pesanan dan item dihapus dari database.
4. Daftar modal me-refresh secara otomatis dan badge counter berkurang.

---

## 7. Referensi REST API

Base URL: `http://localhost:8080`

| Method | Endpoint | Query / Body Params | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | - | Health check status server backend (`{"status":"ok"}`) |
| `GET` | `/api/v1/menu-items` | `company_id` | Mengambil seluruh daftar menu makanan/minuman toko |
| `POST` | `/api/v1/orders` | Body: `CreateOrderRequest` | Membuat pesanan baru dan menyimpannya dalam status `OPEN` |
| `GET` | `/api/v1/orders` | `company_id`, `store_id`, `status` (opsional), `limit` | Mengambil daftar riwayat/antrean pesanan terurut dari yang terbaru |
| `GET` | `/api/v1/orders/:id` | `company_id`, `store_id` | Mengambil data lengkap 1 pesanan beserta item-itemnya |
| `POST` | `/api/v1/orders/:id/pay` | Body: `PayOrderRequest` | Menyelesaikan pembayaran pesanan (berubah ke `COMPLETED`) |
| `DELETE` | `/api/v1/orders/:id` | `company_id`, `store_id` | Menghapus pesanan berstatus `OPEN` / `DRAFT` |

---

## 8. Panduan Menjalankan & Pengujian

### Prasyarat
* Docker & Docker Compose
* Go 1.24+
* Node.js 20+ dan pnpm

### 1. Menjalankan Database
```powershell
cd D:\POS\backend
docker compose up -d
```

### 2. Menjalankan Backend API
Konfigurasi database lokal sudah tertanam otomatis di kode, cukup jalankan:
```powershell
cd D:\POS\backend
go run ./cmd/api
```
*(Server mendengarkan di port `http://localhost:8080`)*

### 3. Menjalankan Frontend POS Kasir
```powershell
cd D:\POS\frontend
pnpm dev
```
*(Aplikasi kasir dapat diakses di `http://localhost:5173`)*

### 4. Menjalankan Pengujian Otomatis
* **Backend Unit & Integration Tests**:
  ```powershell
  cd D:\POS\backend
  go test ./...
  ```
* **Frontend TypeScript & Build Verification**:
  ```powershell
  cd D:\POS\frontend
  pnpm build
  ```

