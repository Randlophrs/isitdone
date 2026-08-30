# isitdone

> A simple, private, local-first periodic checklist for daily, weekly, and monthly routines.

`isitdone` adalah aplikasi lokal untuk membantu mencatat apakah sebuah aktivitas rutin sudah dikerjakan atau belum pada periode yang sedang berjalan.

Aplikasi ini dibuat untuk masalah sederhana tetapi sering terjadi:

- “Daily Genshin sudah dikerjakan belum?”
- “Aku sudah check-in Shopee hari ini?”
- “Duolingo hari ini sudah?”
- “Weekly mission minggu ini sudah selesai?”
- “Routine ini tadi sudah dicentang atau belum?”

`isitdone` tidak memaksa pengguna melakukan aktivitas pada jam tertentu. Selama aktivitas dilakukan dalam periode yang sesuai, pengguna cukup menandainya sebagai selesai.

Data utama disimpan secara lokal menggunakan SQLite melalui backend Python FastAPI. Tidak ada login, tidak ada cloud wajib, dan tidak ada database eksternal.

---

## Daftar Isi

- [Tentang Project](#tentang-project)
- [Masalah yang Diselesaikan](#masalah-yang-diselesaikan)
- [Tujuan Project](#tujuan-project)
- [Fitur](#fitur)
- [Konsep Utama](#konsep-utama)
- [Contoh Penggunaan](#contoh-penggunaan)
- [Tech Stack](#tech-stack)
- [Mengapa Menggunakan Backend](#mengapa-menggunakan-backend)
- [Arsitektur](#arsitektur)
- [Alur Aplikasi](#alur-aplikasi)
- [Struktur Data](#struktur-data)
- [Database](#database)
- [Data Directory Initialization](#data-directory-initialization)
- [Single User dan Concurrency](#single-user-dan-concurrency)
- [Struktur Project](#struktur-project)
- [Persyaratan Sistem](#persyaratan-sistem)
- [Cara Menjalankan](#cara-menjalankan)
- [Production Lokal](#production-lokal)
- [Install & Menjalankan `isitdone`](#install--menjalankan-isitdone)
- [Backup dan Restore](#backup-dan-restore)
- [Konfigurasi](#konfigurasi)
- [CORS](#cors)
- [Desain UI/UX](#desain-uiux)
- [PWA](#pwa)
- [Privasi dan Data](#privasi-dan-data)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [Non-Goals](#non-goals)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)
- [Filosofi](#filosofi)

---

## Tentang Project

`isitdone` adalah aplikasi **periodic checklist** yang berfokus pada status aktivitas rutin berdasarkan periode:

- Daily
- Weekly
- Monthly

Contoh routine daily:

```text
Genshin Commission
```

Routine tersebut tidak memiliki jam wajib. Pengguna bebas mengerjakannya kapan saja pada hari tersebut. Setelah selesai, pengguna mencentangnya.

Pada hari berikutnya, checklist otomatis tersedia kembali sebagai routine baru untuk hari tersebut, sementara riwayat hari sebelumnya tetap tersimpan di database.

Contoh:

```text
24 Agustus  → selesai
25 Agustus  → belum selesai
26 Agustus  → belum selesai
```

### Karakteristik utama

- Local-first.
- Single-user lokal.
- Tanpa login.
- Tanpa akun pengguna.
- Tanpa cloud wajib.
- Backend berjalan di komputer lokal.
- Data utama disimpan dalam file SQLite lokal.
- JSON tersedia untuk backup dan import/export.
- Dapat digunakan tanpa koneksi internet.
- Frontend menggunakan React.
- Backend menggunakan Python FastAPI.
- Database menggunakan SQLite.
- Production mode menggunakan satu origin lokal.
- Dapat dikembangkan menjadi aplikasi desktop atau self-hosted app.

---

## Masalah yang Diselesaikan

Banyak aktivitas digital memiliki pola berulang, tetapi tidak selalu membutuhkan jadwal yang kaku.

Contohnya:

- Daily commission game.
- Daily login reward.
- Check-in marketplace.
- Belajar bahasa.
- Membaca.
- Olahraga.
- Backup project.
- Weekly mission.
- Membayar tagihan bulanan.
- Memeriksa email atau dashboard.
- Mengikuti event rutin.
- Menjalankan checklist maintenance.

Masalah utamanya bukan pengguna tidak tahu kapan harus mengerjakannya. Masalah utamanya adalah pengguna sering lupa apakah aktivitas tersebut sudah dilakukan pada periode sekarang.

Contoh keraguan yang ingin diselesaikan:

```text
“Ini sudah dikerjakan belum, ya?”
“Kayaknya sudah, tapi lupa.”
“Waduh, daily ini kelewat atau belum?”
```

`isitdone` menyelesaikan masalah tersebut dengan memberikan tampilan checklist sederhana:

```text
Sudah dilakukan → ✓
Belum dilakukan → ○
```

---

## Tujuan Project

### Tujuan utama

- Membantu pengguna melihat routine yang belum dikerjakan.
- Mengurangi keraguan seperti “sudah atau belum?”.
- Menyediakan checklist yang cepat dan mudah digunakan.
- Menyimpan riwayat completion secara permanen di perangkat.
- Menampilkan statistik dan streak secara sederhana.
- Menjaga data tetap privat dan lokal.
- Menyediakan backup yang mudah dipindahkan.
- Tidak memaksa pengguna menggunakan jadwal berbasis jam.
- Menyediakan pengalaman yang ringan bagi pengguna awam maupun developer.

### Prinsip desain

`isitdone` dibangun dengan prinsip:

1. Simple by default.
2. Tidak memaksa jadwal berdasarkan jam.
3. Checklist dapat diselesaikan kapan saja dalam periode aktif.
4. Data utama disimpan di perangkat pengguna.
5. Aplikasi tetap berguna tanpa akun.
6. Tidak ada cloud wajib.
7. Pengguna memiliki dan mengontrol datanya sendiri.
8. Pengguna dapat mengekspor dan mengimpor datanya.
9. Interaksi utama dapat dilakukan dengan satu klik.
10. Fitur tidak boleh mengalahkan kesederhanaan aplikasi.
11. Aplikasi harus tetap ringan untuk penggunaan lokal.
12. Aplikasi harus memberikan feedback yang jelas ketika backend bermasalah.

---

## Fitur

### Fitur inti

- Membuat routine baru.
- Mengedit routine.
- Menghapus atau mengarsipkan routine.
- Menonaktifkan dan mengaktifkan kembali routine.
- Menandai routine sebagai selesai.
- Membatalkan status selesai.
- Mendukung routine daily.
- Mendukung routine weekly.
- Mendukung routine monthly.
- Menampilkan routine pada periode aktif.
- Menampilkan progress penyelesaian.
- Mengelompokkan routine berdasarkan kategori.
- Menyimpan riwayat completion di SQLite.
- Menghitung current streak.
- Menghitung longest streak.
- Menampilkan completion rate.

### Fitur manajemen routine

- Nama routine.
- Deskripsi routine.
- Kategori custom.
- Ikon routine.
- Warna routine.
- Pin routine penting.
- Urutan routine custom.
- Pause routine sementara.
- Arsipkan routine tanpa menghapus histori.
- Mengatur hari pertama dalam minggu.
- Mengatur timezone pengguna.

### Fitur histori dan statistik

- Tampilan kalender histori.
- Riwayat completion berdasarkan tanggal.
- Heatmap aktivitas.
- Current streak.
- Longest streak.
- Completion rate.
- Statistik harian.
- Statistik mingguan.
- Statistik bulanan.
- Filter histori berdasarkan routine.
- Filter histori berdasarkan kategori.

### Fitur backup dan data

- Export data ke JSON.
- Import data dari JSON.
- Backup database SQLite.
- Restore database SQLite.
- Validasi file import.
- Preview data sebelum import.
- Mode import replace.
- Mode import merge.
- Versioning format data.
- Migrasi format data.
- Membuka folder data aplikasi.
- Reset seluruh data dengan konfirmasi.

### Fitur UX

- Quick add routine.
- One-click completion.
- Undo setelah completion.
- Pending routine ditampilkan lebih dahulu.
- Search routine.
- Filter All, Pending, dan Completed.
- Dark mode.
- Mode compact dan comfortable.
- Responsive mobile-first layout.
- Keyboard shortcut.
- Drag and drop untuk mengatur urutan.
- Empty state yang informatif.
- Toast notification untuk feedback.
- Loading state.
- Error state.
- Status koneksi backend lokal.
- Retry ketika backend tidak tersedia.

### Fitur distribusi

- Mode development untuk contributor.
- Mode production lokal.
- Script start untuk Windows.
- Script start untuk Linux/macOS.
- Command `isitdone` yang terdaftar di PATH.
- System tray dengan menu Open dan Quit (tanpa jendela terminal).
- Opsi self-hosting.

---

## Konsep Utama

### Routine

Routine adalah definisi aktivitas berulang.

Contoh:

```text
Nama      : Genshin Commission
Kategori  : Gaming
Frekuensi : Daily
```

Routine bukan merupakan satu task untuk satu waktu tertentu. Routine menghasilkan satu checklist untuk setiap periode aktif.

### Period

Period adalah rentang waktu tempat sebuah routine harus diselesaikan.

Contoh:

```text
Daily   → satu hari
Weekly  → satu minggu
Monthly → satu bulan
```

Pengguna bebas menyelesaikan routine kapan saja di dalam period tersebut.

### Completion

Completion adalah catatan bahwa sebuah routine telah diselesaikan pada period tertentu.

Contoh:

```text
Routine   : Genshin Commission
Period    : 2026-08-24
Status    : Completed
Completed : 2026-08-24T20:35:00+07:00
```

### Period key

Setiap completion memiliki `periodKey`.

Format yang digunakan:

```text
Daily   : YYYY-MM-DD
Weekly  : YYYY-Www
Monthly : YYYY-MM
```

Contoh:

```text
Daily   : 2026-08-24
Weekly  : 2026-W35
Monthly : 2026-08
```

Status routine ditentukan dengan mencari apakah completion untuk kombinasi berikut tersedia:

```text
routineId + periodKey
```

Jika tersedia:

```text
Status: Completed
```

Jika tidak tersedia:

```text
Status: Pending
```

### Tidak ada kewajiban waktu

`isitdone` tidak menggunakan jadwal wajib seperti:

```text
Kerjakan pukul 20:00
```

Sebaliknya, aplikasi menggunakan aturan:

```text
Kerjakan kapan saja selama periode masih aktif.
```

Contoh:

```text
Genshin Commission
Periode: 24 Agustus 2026
Waktu pengerjaan: bebas
```

---

## Contoh Penggunaan

### Routine daily

```text
Nama      : Genshin Commission
Kategori  : Gaming
Frekuensi : Daily
```

Pada 24 Agustus:

```text
[ ] Genshin Commission
```

Setelah diselesaikan:

```text
[✓] Genshin Commission
```

Pada 25 Agustus:

```text
[ ] Genshin Commission
```

Completion pada 24 Agustus tetap tersedia di histori.

### Routine weekly

```text
Nama      : Weekly Battle Pass
Kategori  : Gaming
Frekuensi : Weekly
```

Selama periode 24–30 Agustus:

```text
[ ] Weekly Battle Pass
```

Setelah selesai:

```text
[✓] Weekly Battle Pass
```

Routine tersebut akan tersedia kembali pada minggu berikutnya.

### Routine monthly

```text
Nama      : Backup project
Kategori  : Work
Frekuensi : Monthly
```

Routine hanya membutuhkan satu completion selama bulan aktif.

### Banyak routine dalam satu kategori

```text
Gaming
├── [✓] Genshin Commission
├── [ ] Genshin Expedition
├── [ ] Daily Login
└── [✓] Claim Daily Reward

Learning
├── [ ] Duolingo
└── [✓] Baca dokumentasi
```

### Semua routine selesai

```text
Today's progress
9/9 completed

Semua routine selesai 🎉
```

---

## Tech Stack

### Frontend

- React.
- Vite.
- TypeScript.
- Tailwind CSS.
- React Router.
- TanStack Query.
- Lucide React.
- date-fns.
- Zod.

### Backend

- Python.
- FastAPI.
- Uvicorn.
- Pydantic.
- SQLAlchemy atau SQLModel.
- SQLite.
- Alembic, opsional untuk migrasi database.

### Backup

- JSON.
- SQLite database backup.
- Python standard library `json`.
- Python standard library `sqlite3`.

### Tooling

- ESLint.
- Prettier.
- Ruff.
- Pytest.
- Vitest.
- React Testing Library.
- Playwright, opsional.
- GitHub Actions, opsional.
- pystray + Pillow untuk system tray (launcher).

### Deployment

- Local development server.
- Local production server.
- Portable package.
- Self-hosted server.
- Static frontend yang dilayani FastAPI.
- Desktop wrapper menggunakan Tauri, opsional di masa depan.

---

## Mengapa Menggunakan Backend?

Versi project ini menggunakan backend Python agar data utama dapat disimpan secara permanen sebagai file SQLite, bukan sebagai storage internal browser.

### Manfaat backend

- Data tidak bergantung pada browser tertentu.
- Data tidak hilang hanya karena browser history dibersihkan.
- Data dapat disimpan sebagai file.
- Query lebih terstruktur.
- Histori dapat berkembang tanpa membaca ulang seluruh file JSON.
- Backup database lebih mudah.
- Frontend dan storage memiliki tanggung jawab yang jelas.
- Aplikasi dapat dikembangkan menjadi self-hosted app.
- Database dapat disimpan di data directory yang dikontrol aplikasi.

### Apa yang tidak diperlukan?

Project ini tidak membutuhkan:

- Login.
- User registration.
- Cloud database.
- PostgreSQL.
- Redis.
- Celery.
- Background scheduler.
- Docker untuk pemakaian biasa.
- Koneksi internet untuk fitur checklist dasar.

Backend hanya berjalan di komputer lokal pengguna.

---

## Arsitektur

```text
┌─────────────────────────────────────┐
│             React UI                │
│                                     │
│  Dashboard                          │
│  Routine Form                       │
│  Routine List                       │
│  History Calendar                   │
│  Statistics                         │
│  Settings                           │
└──────────────────┬──────────────────┘
                   │ HTTP localhost
                   │
┌──────────────────▼──────────────────┐
│          FastAPI Backend             │
│                                     │
│  API Routes                         │
│  Request Validation                 │
│  Routine Service                    │
│  Period Service                     │
│  Completion Service                 │
│  Streak Service                     │
│  Statistics Service                 │
│  Backup Service                     │
│  Static File Server                 │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│              SQLite                 │
│                                     │
│  routines                           │
│  completions                        │
│  categories                         │
│  settings                           │
└─────────────────────────────────────┘
```

### Development mode

Pada development, frontend dan backend berjalan secara terpisah:

```text
React/Vite:
http://localhost:5173

FastAPI:
http://localhost:8000
```

Frontend memanggil API melalui HTTP:

```text
React
  ↓
FastAPI API
  ↓
SQLite
```

Karena frontend dan backend memiliki origin berbeda pada mode development, CORS perlu dikonfigurasi.

### Production lokal

Pada production lokal, hasil build React dilayani langsung oleh FastAPI:

```text
FastAPI
├── /api/*
└── React static files
```

User cukup membuka:

```text
http://127.0.0.1:8000
```

Frontend dan API berada pada origin yang sama sehingga komunikasi internal tidak membutuhkan konfigurasi CORS tambahan.

### Single-user model

Aplikasi menggunakan model single-user lokal:

```text
Satu user
→ satu komputer
→ satu backend lokal
→ satu database SQLite
```

Versi awal tidak menyediakan sinkronisasi multi-user atau akses database melalui network share.

---

## Alur Aplikasi

### Alur inisialisasi aplikasi

```text
User menjalankan aplikasi
        ↓
Backend menentukan data directory
        ↓
Backend membuat data directory jika belum ada
        ↓
Backend membuat atau membuka database SQLite
        ↓
Backend menjalankan migration
        ↓
Backend memeriksa frontend build
        ↓
Backend menjalankan API dan static file server
        ↓
Browser dibuka
```

### Alur membuka dashboard

```text
User membuka aplikasi
        ↓
Frontend meminta dashboard aktif
        ↓
FastAPI mendapatkan tanggal dan timezone
        ↓
FastAPI menghitung period key
        ↓
FastAPI mengambil routine aktif dari SQLite
        ↓
FastAPI mencari completion periode aktif
        ↓
API mengembalikan status routine
        ↓
React menampilkan pending dan completed
```

### Alur menyelesaikan routine

```text
User menekan checklist
        ↓
React mengirim request ke FastAPI
        ↓
FastAPI memvalidasi routine
        ↓
FastAPI menghitung period key aktif
        ↓
FastAPI membuat completion record
        ↓
SQLite menyimpan data
        ↓
FastAPI mengembalikan status terbaru
        ↓
React memperbarui progress
```

### Alur membatalkan completion

```text
User menekan routine yang sudah selesai
        ↓
React mengirim request pembatalan
        ↓
FastAPI mencari routine dan period key
        ↓
SQLite menghapus completion tersebut
        ↓
React menampilkan routine sebagai pending
```

---

## Struktur Data

### Model `Routine`

```python
class Routine:
    id: str
    name: str
    description: str | None
    category_id: str | None
    frequency: str
    is_active: bool
    is_pinned: bool
    sort_order: int
    created_at: str
    updated_at: str
    archived_at: str | None
```

### Model `Completion`

```python
class Completion:
    id: str
    routine_id: str
    period_key: str
    completed_at: str
```

### Model `Category`

```python
class Category:
    id: str
    name: str
    color: str | None
    icon: str | None
    created_at: str
```

### Model `Setting`

```python
class Setting:
    key: str
    value: str
```

---

## Database

Database utama disimpan sebagai file SQLite:

```text
isitdone.sqlite
```

Database tidak disimpan di folder instalasi aplikasi. Database disimpan di data directory user agar update aplikasi tidak menghapus data.

### Lokasi data default

#### Windows

```text
%APPDATA%\isitdone\data\isitdone.sqlite
```

#### Linux

```text
~/.local/share/isitdone/isitdone.sqlite
```

#### macOS

```text
~/Library/Application Support/isitdone/isitdone.sqlite
```

Lokasi database dapat dikonfigurasi menggunakan environment variable:

```env
ISITDONE_DATA_DIR=./data
```

### Tabel `routines`

```sql
CREATE TABLE IF NOT EXISTS routines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category_id TEXT,
    frequency TEXT NOT NULL
        CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    is_active INTEGER NOT NULL DEFAULT 1,
    is_pinned INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    archived_at TEXT,
    FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL
);
```

### Tabel `completions`

```sql
CREATE TABLE IF NOT EXISTS completions (
    id TEXT PRIMARY KEY,
    routine_id TEXT NOT NULL,
    period_key TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    FOREIGN KEY (routine_id)
        REFERENCES routines(id)
        ON DELETE CASCADE,
    UNIQUE (routine_id, period_key)
);
```

Constraint berikut memastikan satu routine hanya memiliki satu completion untuk satu periode:

```sql
UNIQUE (routine_id, period_key)
```

### Tabel `categories`

```sql
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT,
    icon TEXT,
    created_at TEXT NOT NULL
);
```

### Tabel `settings`

```sql
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
```

### Index yang direkomendasikan

```sql
CREATE INDEX IF NOT EXISTS idx_completions_routine_id
ON completions(routine_id);

CREATE INDEX IF NOT EXISTS idx_completions_period_key
ON completions(period_key);

CREATE INDEX IF NOT EXISTS idx_routines_frequency
ON routines(frequency);

CREATE INDEX IF NOT EXISTS idx_routines_is_active
ON routines(is_active);
```

---

## Data Directory Initialization

Aplikasi akan membuat data directory secara otomatis saat pertama kali dijalankan.

Jika directory belum tersedia, backend akan membuatnya sebelum membuka database SQLite.

Contoh:

```text
Windows:
%APPDATA%\isitdone\data\

Linux:
~/.local/share/isitdone/

macOS:
~/Library/Application Support/isitdone/
```

### Alur inisialisasi

```text
Aplikasi dijalankan
        ↓
Backend menentukan data directory
        ↓
Backend membuat directory jika belum ada
        ↓
Backend membuat atau membuka database SQLite
        ↓
Backend menjalankan database migration
        ↓
Aplikasi siap digunakan
```

Contoh implementasi Python:

```python
from pathlib import Path
import os


def get_data_directory() -> Path:
    configured_directory = os.getenv(
        "ISITDONE_DATA_DIR"
    )

    if configured_directory:
        data_directory = Path(
            configured_directory
        ).expanduser()
    elif os.name == "nt":
        app_data = os.getenv("APPDATA")

        if app_data:
            data_directory = (
                Path(app_data)
                / "isitdone"
                / "data"
            )
        else:
            data_directory = (
                Path.home()
                / "AppData"
                / "Roaming"
                / "isitdone"
                / "data"
            )
    else:
        data_directory = (
            Path.home()
            / ".local"
            / "share"
            / "isitdone"
        )

    data_directory.mkdir(
        parents=True,
        exist_ok=True
    )

    return data_directory
```

Database path kemudian dibuat dari directory tersebut:

```python
DATA_DIRECTORY = get_data_directory()
DATABASE_PATH = (
    DATA_DIRECTORY / "isitdone.sqlite"
)
```

Aplikasi tidak membutuhkan user untuk membuat folder database secara manual.

Jika data directory gagal dibuat, backend harus menampilkan error yang jelas dan tidak membuat database sementara di lokasi yang tidak diketahui user.

---

## Single User dan Concurrency

`isitdone` dirancang sebagai aplikasi **single-user lokal**.

Satu instance aplikasi biasanya menggunakan satu file SQLite pada satu komputer.

Penggunaan yang direkomendasikan:

```text
Satu komputer
Satu user
Satu backend lokal
Satu file SQLite
```

Hindari menggunakan file database yang sama melalui:

```text
Network share
NAS
NFS
Shared folder
Cloud sync folder yang melakukan sinkronisasi aktif
```

Jangan menjalankan beberapa instance aplikasi yang mengakses file SQLite yang sama dari perangkat berbeda.

Kondisi tersebut dapat menyebabkan:

```text
database is locked
database is busy
data conflict
database corruption
```

SQLite menggunakan mekanisme locking untuk mengatur akses bersamaan. Namun network filesystem dapat memiliki perilaku locking yang berbeda dan tidak selalu aman untuk penggunaan tersebut. [141]

Database sebaiknya selalu disimpan pada local filesystem komputer yang menjalankan backend.

Jika membutuhkan akses multi-user atau sinkronisasi antarperangkat, gunakan arsitektur server database atau sync server terpisah. Fitur tersebut berada di luar scope versi lokal `isitdone`.

---

## API

### Health check

```text
GET /api/health
```

Response:

```json
{
  "status": "ok"
}
```

### Routines

```text
GET    /api/routines
POST   /api/routines
GET    /api/routines/{routine_id}
PATCH  /api/routines/{routine_id}
DELETE /api/routines/{routine_id}
POST   /api/routines/{routine_id}/archive
POST   /api/routines/{routine_id}/restore
```

### Current dashboard

```text
GET /api/dashboard/current
```

Contoh response:

```json
{
  "date": "2026-08-24",
  "week": "2026-W35",
  "month": "2026-08",
  "progress": {
    "completed": 2,
    "total": 4,
    "percentage": 50
  },
  "groups": [
    {
      "category": "Gaming",
      "routines": [
        {
          "id": "genshin-commission",
          "name": "Genshin Commission",
          "frequency": "daily",
          "periodKey": "2026-08-24",
          "isCompleted": false,
          "completedAt": null
        }
      ]
    }
  ]
}
```

### Completion

```text
POST   /api/routines/{routine_id}/complete
DELETE /api/routines/{routine_id}/complete
GET    /api/routines/{routine_id}/completions
```

Backend menghitung `periodKey` sendiri berdasarkan tanggal dan timezone pengguna.

Frontend tidak boleh menjadi sumber kebenaran utama untuk period key.

### History

```text
GET /api/history
GET /api/history/{year}/{month}
GET /api/history/routine/{routine_id}
```

### Statistics

```text
GET /api/statistics
GET /api/statistics/routine/{routine_id}
```

### Backup

```text
GET  /api/backup/export
POST /api/backup/import
POST /api/backup/sqlite
POST /api/backup/restore
```

---

## Struktur Project

```text
isitdone/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── routine.py
│   │   │   ├── completion.py
│   │   │   ├── category.py
│   │   │   └── setting.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── routine.py
│   │   │   ├── completion.py
│   │   │   ├── category.py
│   │   │   └── backup.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── health.py
│   │   │   ├── routines.py
│   │   │   ├── completions.py
│   │   │   ├── dashboard.py
│   │   │   ├── history.py
│   │   │   ├── statistics.py
│   │   │   └── backup.py
│   │   ├── services/
│   │   │   ├── period_service.py
│   │   │   ├── routine_service.py
│   │   │   ├── completion_service.py
│   │   │   ├── streak_service.py
│   │   │   ├── statistics_service.py
│   │   │   └── backup_service.py
│   │   ├── migrations/
│   │   │   ├── 001_initial.sql
│   │   │   └── 002_add_categories.sql
│   │   └── utils/
│   │       ├── ids.py
│   │       ├── dates.py
│   │       └── timezone.py
│   ├── data/
│   │   └── .gitkeep
│   ├── tests/
│   │   ├── test_period_service.py
│   │   ├── test_routines.py
│   │   ├── test_completions.py
│   │   └── test_backup.py
│   ├── requirements.txt
│   └── run.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── layout/
│   │   │   ├── routines/
│   │   │   ├── dashboard/
│   │   │   ├── history/
│   │   │   └── statistics/
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── HistoryPage.tsx
│   │   │   ├── StatisticsPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── features/
│   │   │   ├── routines/
│   │   │   ├── dashboard/
│   │   │   ├── history/
│   │   │   ├── statistics/
│   │   │   └── backup/
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── query-client.ts
│   │   │   └── utils.ts
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── scripts/
│   ├── dev.bat
│   ├── start.bat
│   ├── dev.sh
│   └── start.sh
│
├── data/
│   └── .gitkeep
├── .env.example
├── .gitignore
├── README.md
└── LICENSE
```

---

## Persyaratan Sistem

### Untuk development

- Git.
- Python 3.11 atau lebih baru.
- Node.js 20 atau lebih baru.
- npm, pnpm, atau Bun.
- Browser modern.
- SQLite, opsional karena Python menyediakan modul SQLite bawaan.

### Untuk user akhir

Pada mode portable atau packaged:

- Windows, Linux, atau macOS yang didukung.
- Browser modern.
- Tidak perlu Python.
- Tidak perlu Node.js.
- Tidak perlu Git.
- Tidak perlu Docker.
- Tidak perlu memasang SQLite secara manual.

---

## Cara Menjalankan

### Clone repository

```bash
git clone https://github.com/username/isitdone.git
cd isitdone
```

### Setup backend

Masuk ke folder backend:

```bash
cd backend
```

Buat virtual environment:

```bash
python -m venv .venv
```

Aktifkan virtual environment di Windows:

```bash
.venv\Scripts\activate
```

Aktifkan virtual environment di Linux/macOS/WSL:

```bash
source .venv/bin/activate
```

Install dependency:

```bash
pip install -r requirements.txt
```

### Setup frontend

Buka terminal baru:

```bash
cd frontend
npm install
```

### Jalankan backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Backend tersedia di:

```text
http://localhost:8000
```

Dokumentasi API tersedia di:

```text
http://localhost:8000/docs
```

### Jalankan frontend

Pada terminal kedua:

```bash
cd frontend
npm run dev
```

Frontend tersedia di:

```text
http://localhost:5173
```

---

## Development dengan Satu Perintah

Agar developer tidak perlu menjalankan dua terminal secara manual, gunakan script root atau tool seperti `concurrently`.

Contoh `package.json` root:

```json
{
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm --prefix frontend run dev\" \"python backend/run.py\"",
    "dev:frontend": "npm --prefix frontend run dev",
    "dev:backend": "python backend/run.py",
    "build": "npm --prefix frontend run build",
    "test": "npm --prefix frontend run test"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

Jalankan:

```bash
npm run dev
```

Backend dan frontend akan berjalan bersamaan.

---

## Production Lokal

Frontend React dapat dibuild menjadi static files:

```bash
cd frontend
npm run build
```

Hasil build berada di:

```text
frontend/dist/
```

FastAPI kemudian dapat melayani folder tersebut.

Contoh pada `main.py`:

```python
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="isitdone API")

frontend_path = (
    Path(__file__).resolve().parents[1]
    / "frontend"
    / "dist"
)

if frontend_path.exists():
    app.mount(
        "/",
        StaticFiles(
            directory=frontend_path,
            html=True
        ),
        name="frontend"
    )
```

Jalankan production lokal:

```bash
uvicorn app.main:app \
  --host 127.0.0.1 \
  --port 8000
```

Buka:

```text
http://127.0.0.1:8000
```

### Catatan

Saat frontend dilayani oleh FastAPI:

- API berada pada `/api`.
- Static files dilayani oleh FastAPI.
- User cukup membuka satu URL.
- Tidak diperlukan Vite dev server.
- Frontend dan backend memiliki origin yang sama.
- CORS tidak diperlukan untuk komunikasi internal production lokal.
- Data tetap disimpan di SQLite.

### Inisialisasi production

Saat production server dijalankan:

1. Backend menentukan data directory.
2. Backend membuat directory jika belum tersedia.
3. Backend membuat database SQLite jika belum ada.
4. Backend menjalankan migration.
5. Backend memeriksa keberadaan frontend build.
6. Backend menjalankan API dan static file server.
7. User dapat membuka aplikasi.

Jika data directory gagal dibuat, backend harus menghentikan startup dengan pesan error yang jelas.

---

## Install & Menjalankan `isitdone`

`isitdone` butuh **Python 3.11+** (Node.js hanya untuk build frontend saat development). Setelah install, cukup ketik `isitdone` di terminal — server lokal jalan di background, ikon **system tray** muncul, dan browser otomatis kebuka. Tidak ada jendela terminal yang menggantung.

### Clone & install

```bash
git clone https://github.com/username/isitdone.git
cd isitdone

# cara cepat (Windows): siapkan venv, install dependensi, daftarkan command `isitdone`
powershell -ExecutionPolicy Bypass -File install.ps1
```

Atau manual:

```bash
python -m venv backend/.venv
backend/.venv/Scripts/activate
pip install -r backend/requirements.txt
pip install -e .
```

### Jalankan

Buka terminal baru, lalu:

```bash
isitdone
```

- Server berjalan di `http://127.0.0.1:8000`.
- Ikon tray (centang hijau) muncul di taskbar.
- Browser terbuka otomatis ke dashboard.
- **Quit** lewat menu tray → Quit (menghentikan server).

### Catatan

- `install.ps1` menaruh shim `isitdone.cmd` di `%LOCALAPPDATA%\isitdone` dan menambahkannya ke user PATH, sehingga command `isitdone` bisa dipanggil dari terminal mana pun. Buka terminal baru setelah install agar PATH terbaca.
- `launcher.pyw` adalah entry point `isitdone`: menjalankan backend lewat venv, membuka browser, dan menampilkan tray. Disimpan sebagai `.pyw` agar Windows tidak menampilkan console window.
- Data tetap di SQLite di data directory user (`%APPDATA%\isitdone\data\`).
- Untuk development (frontend hot-reload), gunakan `npm run dev` seperti di atas — `isitdone` ditujukan untuk penggunaan lokal production.

---

## Backup dan Restore

Database SQLite menyimpan data utama secara permanen, tetapi backup tetap diperlukan.

### Export JSON

JSON digunakan sebagai format backup portable.

Contoh struktur file:

```json
{
  "version": 1,
  "app": "isitdone",
  "exportedAt": "2026-08-24T14:00:00Z",
  "settings": [],
  "categories": [],
  "routines": [],
  "completions": []
}
```

Keunggulan JSON:

- Mudah dibaca.
- Mudah diedit.
- Mudah dipindahkan.
- Tidak terlalu bergantung pada struktur internal SQLite.
- Cocok untuk migrasi versi.
- Dapat digunakan oleh tools lain.

### Import JSON

Proses import:

1. User memilih file JSON.
2. Backend membaca file.
3. Backend memvalidasi format.
4. Aplikasi menampilkan ringkasan data.
5. User memilih mode import.
6. Data dimasukkan ke SQLite.
7. Aplikasi menampilkan hasil import.

Mode import:

```text
Replace
```

Menghapus data aplikasi saat ini dan menggantinya dengan isi backup.

```text
Merge
```

Menggabungkan backup dengan data yang sudah ada.

### Backup database SQLite

Backup database dapat berupa salinan file:

```text
isitdone.sqlite
```

Contoh nama backup:

```text
isitdone-sqlite-backup-2026-08-24.sqlite
```

### Rekomendasi backup

- Export JSON secara berkala.
- Simpan backup di lokasi berbeda.
- Jangan hanya mengandalkan satu file database.
- Jangan commit database pribadi ke Git.
- Gunakan backup sebelum update besar.
- Tampilkan waktu backup terakhir di halaman settings.

---

## Konfigurasi

Buat file `.env` berdasarkan `.env.example`:

```env
APP_NAME=isitdone
APP_ENV=development
APP_HOST=127.0.0.1
APP_PORT=8000

ISITDONE_DATA_DIR=./data
ISITDONE_TIMEZONE=Asia/Jakarta
ISITDONE_WEEK_STARTS_ON=monday

CORS_ORIGINS=http://localhost:5173
```

### Konfigurasi production

```env
APP_ENV=production
APP_HOST=127.0.0.1
APP_PORT=8000

ISITDONE_DATA_DIR=%APPDATA%/isitdone/data
ISITDONE_TIMEZONE=Asia/Jakarta
ISITDONE_WEEK_STARTS_ON=monday
```

### Timezone

Timezone digunakan untuk menghitung:

- Tanggal daily.
- Minggu aktif.
- Bulan aktif.
- Waktu completion.
- Statistik.
- Streak.

Default project:

```text
Asia/Jakarta
```

Pengguna dapat mengubahnya melalui settings.

---

## CORS

Pada mode development, frontend dan backend berjalan pada origin yang berbeda:

```text
Frontend:
http://localhost:5173

Backend:
http://localhost:8000
```

Karena itu, CORS perlu dikonfigurasi agar frontend dapat memanggil API backend.

Contoh:

```env
CORS_ORIGINS=http://localhost:5173
```

Contoh konfigurasi FastAPI:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Production lokal

Pada mode production lokal, frontend React dibuild menjadi static files dan dilayani langsung oleh FastAPI:

```text
Frontend dan API:
http://127.0.0.1:8000
```

Karena frontend dan backend berada pada origin yang sama, CORS tidak diperlukan untuk komunikasi internal aplikasi production lokal.

Arsitektur production:

```text
Browser
   ↓
FastAPI
   ├── /api/*
   └── Static frontend files
```

CORS tetap dapat dikonfigurasi jika project nantinya digunakan dalam:

- Mode development terpisah.
- Self-hosting.
- Frontend dari origin lain.
- Deployment dengan reverse proxy.
- Integrasi aplikasi eksternal.

FastAPI menyediakan `CORSMiddleware` untuk mengatur origin yang diizinkan. [124]

---

## Period Calculation

### Daily

```text
2026-08-24
```

### Weekly

```text
2026-W35
```

Minggu mengikuti pengaturan:

```text
Monday-start
Sunday-start
```

### Monthly

```text
2026-08
```

### Aturan periode

- Routine dibuat hari ini tidak dianggap gagal pada hari sebelumnya.
- Routine yang dinonaktifkan tidak ditampilkan pada periode aktif.
- Routine yang diaktifkan kembali mengikuti periode saat ini.
- Completion lama tidak berubah ketika routine diedit.
- Mengarsipkan routine tidak menghapus histori.
- Semua tanggal dihitung berdasarkan timezone pengguna.
- Completion hanya dapat dibuat satu kali untuk satu routine pada satu periode.
- User bebas menyelesaikan routine kapan saja dalam periode aktif.

---

## Streak dan Statistik

### Current streak

Streak adalah jumlah periode berurutan terakhir yang berhasil diselesaikan.

Daily:

```text
24 Agustus ✓
23 Agustus ✓
22 Agustus ✓

Current streak: 3 hari
```

Weekly:

```text
Minggu 35 ✓
Minggu 34 ✓
Minggu 33 ✓

Current streak: 3 minggu
```

### Longest streak

Menyimpan rekor streak tertinggi sepanjang histori routine.

### Completion rate

Rumus:

```text
completion rate =
jumlah periode selesai / jumlah periode yang sudah berlalu
```

Contoh:

```text
Routine aktif sejak 1 Agustus
Jumlah periode: 24
Selesai: 20

Completion rate: 83.3%
```

Statistik tidak boleh membuat pengguna merasa gagal. Streak dan completion rate harus berfungsi sebagai informasi, bukan tekanan.

---

## Desain UI/UX

### Prinsip utama

UI harus menjawab kebutuhan utama dalam beberapa detik:

```text
Apa yang harus aku kerjakan?
Mana yang sudah selesai?
Mana yang belum?
```

### Dashboard

Dashboard utama berisi:

1. Sapaan dan tanggal saat ini.
2. Ringkasan progress.
3. Daftar routine yang belum selesai.
4. Daftar routine yang sudah selesai.
5. Pengelompokan berdasarkan kategori.
6. Tombol tambah routine.
7. Akses cepat ke histori.
8. Status database dan koneksi lokal.

Contoh:

```text
Good evening 👋
Monday, 24 August 2026

Today's progress
━━━━━━━━━━━━━━ 6/9 completed

Still to do
┌─────────────────────────────┐
│ ○ Genshin Commission         │
│   Gaming                     │
├─────────────────────────────┤
│ ○ Duolingo                   │
│   Learning                   │
└─────────────────────────────┘

Completed
┌─────────────────────────────┐
│ ✓ Shopee Check-in            │
│ ✓ Genshin Expedition         │
└─────────────────────────────┘
```

### Checklist interaction

- Seluruh row dapat diklik.
- Tidak hanya ikon checkbox yang dapat diklik.
- Ukuran target sentuh nyaman pada mobile.
- Status memiliki perubahan visual yang jelas.
- Klik ulang dapat membatalkan completion.
- Tidak menampilkan modal untuk aksi sederhana.
- Gunakan label positif seperti “Selesai”.
- Tampilkan feedback setelah menyimpan.
- Sediakan tombol undo.

### Pending-first layout

Routine yang belum selesai harus tampil lebih dahulu.

Alasannya:

- Pengguna datang untuk mengetahui apa yang belum dikerjakan.
- Routine yang sudah selesai tidak perlu mengambil perhatian utama.
- Dashboard menjadi lebih actionable.

### Kategori

Gunakan kategori dengan:

- Nama.
- Ikon.
- Warna kecil sebagai aksen.
- Jumlah routine tersisa.
- Progress kategori.

Contoh:

```text
Gaming       2 tersisa
Shopping     1 tersisa
Learning     0 tersisa
```

### Empty state

Jika semua routine selesai:

```text
Semua routine selesai 🎉

Nikmati sisa harimu.
```

Jika belum ada routine:

```text
Belum ada routine

Tambahkan aktivitas pertama yang ingin kamu pantau.
```

### Error state

Jika backend tidak berjalan:

```text
Backend belum aktif

Jalankan isitdone-server terlebih dahulu.
[ Coba lagi ]
[ Lihat panduan ]
```

Jika database bermasalah:

```text
Database tidak dapat dibuka

Data mungkin sedang digunakan oleh proses lain.
[ Coba lagi ]
[ Buka folder data ]
[ Restore backup ]
```

### Mobile-first

Aplikasi harus nyaman digunakan dengan satu tangan:

- Bottom navigation.
- Floating action button untuk menambah routine.
- Card tidak terlalu padat.
- Tombol checklist mudah ditekan.
- Filter menggunakan chip horizontal.
- Form tidak terlalu panjang.
- Header tidak memenuhi layar.
- Progress mudah dilihat tanpa scroll terlalu jauh.

### Desktop

Pada layar besar:

- Sidebar kategori.
- Dua kolom: pending dan completed.
- Kalender histori di panel samping.
- Shortcut keyboard.
- Drag and drop untuk mengurutkan routine.
- Panel backup dan status database.

---

## User Experience yang Disarankan

### Quick add

Pengguna dapat menambahkan routine tanpa mengisi terlalu banyak field:

```text
+ Tambah routine

Nama:
Duolingo

Frekuensi:
Daily

Kategori:
Learning

[ Simpan ]
```

Field lanjutan seperti deskripsi, warna, dan ikon dapat diletakkan di bagian:

```text
Advanced options
```

### One-click completion

Tujuan utama aplikasi adalah pencatatan cepat.

Jangan memerlukan:

```text
Klik routine
→ buka detail
→ pilih tanggal
→ konfirmasi
→ simpan
```

Cukup:

```text
Klik checklist
```

### Undo

Setelah completion dibuat, tampilkan toast:

```text
Genshin Commission selesai
[ Batalkan ]
```

### Filter

Sediakan filter:

```text
All
Pending
Completed
Daily
Weekly
Monthly
```

### Search

Search berguna jika jumlah routine sudah banyak:

```text
Cari routine...
```

### Pin

Routine penting dapat dipin ke bagian atas:

```text
Pinned
- Genshin Commission
- Duolingo
```

### Reorder

Urutan routine dapat diatur pengguna:

- Drag and drop di desktop.
- Tombol move up/down di mobile.
- Sort berdasarkan kategori.
- Sort berdasarkan nama.
- Sort berdasarkan status.
- Sort berdasarkan urutan custom.

### Status koneksi

Karena aplikasi memakai backend lokal, tampilkan status kecil yang tidak mengganggu:

```text
● Local server connected
```

Jika gagal:

```text
○ Local server disconnected
```

Jangan menampilkan detail teknis berlebihan kepada user awam. Sediakan detail tersebut di halaman diagnostics.

---

## PWA

PWA dapat ditambahkan untuk memberikan pengalaman yang lebih mirip aplikasi desktop atau mobile.

### Fungsi PWA pada project ini

- Desktop shortcut.
- Standalone application window.
- Cara cepat membuka `isitdone`.
- App icon.
- Splash screen.
- Caching asset frontend.
- Offline indication.
- Pengalaman pembukaan aplikasi yang lebih cepat.

### Catatan backend

PWA tetap membutuhkan backend FastAPI lokal yang aktif untuk membaca dan mengubah data SQLite.

```text
PWA frontend
        ↓
FastAPI lokal harus aktif
        ↓
SQLite lokal
```

Jika backend berhenti, frontend mungkin masih dapat menampilkan asset yang sudah dicache, tetapi tidak dapat:

- Mengambil data terbaru.
- Menyimpan completion baru.
- Membuat atau mengedit routine.
- Membaca histori dari SQLite.
- Menjalankan backup dan restore melalui API.

Contoh status ketika backend berhenti:

```text
Backend lokal tidak aktif

Data belum dapat dimuat.
Jalankan isitdone-server lalu coba lagi.

[ Coba lagi ]
[ Lihat panduan ]
```

PWA pada project ini bukan offline-first database application sepenuhnya.

PWA berfungsi sebagai standalone shortcut dan UI yang tetap membutuhkan backend lokal.

Dukungan offline penuh membutuhkan storage tambahan di sisi browser seperti IndexedDB atau SQLite WASM/OPFS, serta mekanisme sinkronisasi antara browser dan SQLite lokal. Fitur tersebut tidak menjadi bagian dari versi awal.

Service worker dapat bertindak sebagai lapisan antara aplikasi, browser, dan jaringan untuk caching asset, tetapi service worker tidak otomatis menggantikan backend atau database aplikasi. [130]

---

## Privasi dan Data

`isitdone` mengikuti pendekatan local-first:

- Data utama disimpan di perangkat pengguna.
- Aplikasi tidak memerlukan koneksi internet untuk checklist dasar.
- Pengguna tidak dipaksa membuat akun.
- Data dapat diekspor dalam format terbuka.
- Tidak ada cloud yang menjadi satu-satunya tempat penyimpanan data.
- Backend berjalan pada komputer lokal pengguna.
- Database berada di data directory aplikasi.
- Backend default hanya dapat diakses melalui komputer lokal.

### Yang tidak dikumpulkan

Versi lokal tidak mengumpulkan:

- Nama.
- Email.
- Password.
- Daftar routine.
- Riwayat completion.
- Data analytics pribadi.
- Data penggunaan ke server eksternal.

Jika analytics anonim ditambahkan di masa depan, fitur tersebut harus:

- Opt-in.
- Nonaktif secara default.
- Dijelaskan secara terbuka.
- Dapat dimatikan kapan saja.
- Tidak mengandung isi routine pribadi.

### Keamanan lokal

Backend sebaiknya hanya bind ke:

```text
127.0.0.1
```

Jangan bind ke:

```text
0.0.0.0
```

secara default, karena hal tersebut dapat membuat API dapat diakses dari perangkat lain dalam jaringan.

Jika self-hosting di jaringan lokal diaktifkan, user harus memahami konsekuensi keamanan dan dapat mengatur authentication secara terpisah.

---

## Testing

### Unit test backend

Test bagian:

- Daily period key.
- Weekly period key.
- Monthly period key.
- Timezone conversion.
- Completion status.
- Streak.
- Completion rate.
- Import validation.
- Export format.
- Database constraint.
- Data migration.
- Data directory initialization.
- Database connection.
- API health check.

Contoh test case:

```text
Routine daily yang selesai hari ini harus berstatus completed.
Routine daily yang selesai kemarin harus kembali pending hari ini.
Routine weekly yang selesai pada minggu sebelumnya harus pending pada minggu ini.
Routine baru tidak boleh memiliki histori gagal sebelum tanggal pembuatannya.
Satu routine tidak boleh memiliki dua completion pada period yang sama.
Data directory dibuat otomatis ketika belum tersedia.
```

### Unit test frontend

Test bagian:

- Routine card.
- Checkbox interaction.
- Progress summary.
- Filter.
- Search.
- Empty state.
- Error state.
- Import preview.
- Export button.
- Undo completion.
- Backend connection status.

### Integration test

Test alur:

```text
Frontend
→ FastAPI
→ SQLite
→ FastAPI response
→ Frontend update
```

### UI test

Test alur:

```text
User membuka aplikasi
→ menambahkan routine
→ melihat routine di dashboard
→ mencentang routine
→ melihat progress berubah
→ membatalkan completion
→ membuka histori
→ melakukan export data
→ melakukan import data
```

### Edge case

- Tanggal berganti tengah malam.
- Backend tidak aktif.
- Database tidak dapat dibuka.
- File JSON rusak.
- Data storage kosong.
- Dua completion untuk periode yang sama.
- Routine dinonaktifkan.
- Routine diarsipkan.
- Routine dipulihkan.
- Routine dibuat di tengah minggu.
- Tahun baru.
- Bulan Februari.
- Pergantian timezone.
- Database sedang dikunci proses lain.
- User melakukan import backup lama.
- Schema database berubah setelah update aplikasi.
- Data directory belum tersedia.
- Permission data directory ditolak.
- Port backend sedang digunakan aplikasi lain.
- Frontend build tidak tersedia.
- Backend berhenti setelah frontend terbuka.

---

## Roadmap

### Version 0.1 — Core MVP

- [ ] FastAPI backend.
- [ ] SQLite database.
- [ ] React frontend.
- [ ] Dashboard.
- [ ] Tambah routine.
- [ ] Edit routine.
- [ ] Hapus atau arsipkan routine.
- [ ] Daily routine.
- [ ] Weekly routine.
- [ ] Monthly routine.
- [ ] Checklist satu klik.
- [ ] Progress periode aktif.
- [ ] Kategori dasar.
- [ ] Automatic data directory initialization.
- [ ] Database migration.
- [ ] Error state ketika backend tidak aktif.
- [ ] Local server health check.
- [ ] Dark mode.

### Version 0.2 — History

- [ ] Kalender histori.
- [ ] Riwayat completion.
- [ ] Current streak.
- [ ] Longest streak.
- [ ] Completion rate.
- [ ] Filter histori.
- [ ] Statistik mingguan.
- [ ] Statistik bulanan.
- [ ] Heatmap aktivitas.

### Version 0.3 — Data portability

- [ ] JSON export.
- [ ] JSON import.
- [ ] Merge import.
- [ ] Replace import.
- [ ] Validasi file.
- [ ] Preview import.
- [ ] Format versioning.
- [ ] Data migration.
- [ ] Backup SQLite.
- [ ] Restore SQLite.
- [ ] Open data folder.
- [ ] Backup history.
- [ ] Backup validation.

### Version 0.4 — UX improvement

- [ ] Quick add.
- [ ] Undo completion.
- [ ] Pin routine.
- [ ] Drag and drop sorting.
- [ ] Keyboard shortcut.
- [ ] Template routine.
- [ ] Search.
- [ ] Mobile bottom navigation.
- [ ] Status local server.
- [ ] Diagnostics page.
- [ ] Better error recovery.
- [ ] Onboarding singkat.
- [ ] First-run sample routines.

### Version 0.5 — Distribution

- [ ] Production build frontend.
- [ ] FastAPI static file serving.
- [ ] Windows start script.
- [ ] Linux/macOS start script.
- [ ] PyInstaller executable.
- [ ] Portable ZIP release.
- [ ] Installer Windows.
- [ ] Automatic data directory setup.
- [ ] Graceful shutdown.
- [ ] Error logging lokal.
- [ ] Port conflict detection.
- [ ] Backend health monitoring.

### Version 0.6 — PWA and desktop-like experience

- [ ] Installable PWA.
- [ ] Standalone window mode.
- [ ] App icon.
- [ ] Splash screen.
- [ ] Offline indicator.
- [ ] Backend connection status.
- [ ] Retry request.
- [ ] Local server health monitoring.
- [ ] Graceful reconnect experience.

PWA pada versi ini berfungsi sebagai desktop shortcut dan standalone UI. PWA tetap membutuhkan backend FastAPI lokal yang aktif untuk membaca dan menulis database SQLite.

### Future

- [ ] Tauri desktop wrapper.
- [ ] Native desktop notification opsional.
- [ ] Multi-device sync opsional.
- [ ] Encrypted backup.
- [ ] Self-hosted sync server opsional.
- [ ] Telegram reminder opsional.
- [ ] Google Calendar export.
- [ ] Plugin system.
- [ ] Community template system.
- [ ] Community template marketplace.
- [ ] Mobile application.
- [ ] Cloud sync opt-in.
- [ ] Multi-user mode.
- [ ] Remote API mode.

---

## Non-Goals

Versi awal project ini tidak bertujuan menjadi:

- Kalender dengan penjadwalan jam.
- Aplikasi task management kompleks.
- Aplikasi kolaborasi.
- Platform sosial.
- Aplikasi yang wajib memiliki akun.
- Aplikasi cloud-first.
- Aplikasi yang mengumpulkan data pengguna.
- Sistem notifikasi agresif.
- Pengganti game launcher.
- Automation bot.
- Sistem yang menjalankan aktivitas secara otomatis.
- Aplikasi yang mewajibkan Docker untuk user akhir.
- Database yang digunakan bersama melalui network share.
- Akses multi-user ke satu database lokal.
- Sinkronisasi otomatis antarperangkat.
- PWA yang tetap dapat membaca SQLite ketika backend mati.
- Penyimpanan cloud otomatis.

Fokus utama tetap:

```text
Sudah dikerjakan atau belum pada periode ini?
```

---

## Keputusan Desain

### Mengapa tidak ada jam wajib?

Karena banyak routine hanya memiliki batas periode, bukan waktu pasti.

Contoh:

```text
Genshin Commission dapat dilakukan kapan saja hari ini.
```

Memaksa jam tertentu akan membuat aplikasi lebih rumit dan tidak sesuai dengan masalah sebenarnya.

### Mengapa menggunakan FastAPI?

FastAPI digunakan karena:

- Cocok dengan Python.
- Mudah dikembangkan.
- Memiliki validasi request dan response.
- Cocok untuk API lokal.
- Dapat melayani static files.
- Mudah dikemas menjadi executable.
- Memiliki dokumentasi API otomatis.

### Mengapa menggunakan SQLite?

SQLite digunakan karena:

- Tidak membutuhkan database server.
- Database tersimpan dalam satu file.
- Ringan.
- Cocok untuk aplikasi lokal.
- Mudah dibackup.
- Mendukung query terstruktur.
- Tidak membutuhkan konfigurasi database yang rumit.

### Mengapa menggunakan SQLite sejak awal?

SQLite digunakan sejak awal karena persistence merupakan kebutuhan utama project.

Data routine dan completion harus tetap tersedia setelah browser ditutup atau site data dibersihkan.

SQLite memberikan:

- File database lokal.
- Penyimpanan terstruktur.
- Query yang jelas.
- Histori yang persisten.
- Backup yang mudah.
- Tidak membutuhkan database server.

### Mengapa JSON tetap tersedia?

JSON digunakan sebagai:

- Backup portable.
- Format import/export.
- Format migrasi.
- Format yang mudah dibaca.
- Format yang tidak terlalu bergantung pada struktur internal SQLite.

### Mengapa tidak menggunakan PostgreSQL?

Project ini tidak membutuhkan PostgreSQL karena:

- Tidak ada user authentication.
- Tidak ada multi-user server.
- Tidak ada cloud sync.
- Data bersifat lokal.
- Beban data kecil.
- SQLite lebih ringan dan mudah didistribusikan.

### Mengapa tidak langsung memakai Docker?

Docker dapat digunakan untuk contributor atau self-hosting, tetapi tidak dijadikan persyaratan user akhir karena:

- Membutuhkan instalasi tambahan.
- Dapat membutuhkan virtualisasi.
- Memakai resource lebih banyak.
- Kurang nyaman untuk pengguna non-teknis.

### Mengapa aplikasi single-user?

`isitdone` dibuat untuk kebutuhan pribadi dan lokal.

Model single-user membuat aplikasi:

- Lebih sederhana.
- Lebih ringan.
- Tidak membutuhkan authentication.
- Tidak membutuhkan server publik.
- Tidak membutuhkan database server.
- Lebih mudah dibackup.
- Lebih mudah dipahami contributor.

Jika project membutuhkan multi-user atau sinkronisasi antarperangkat, arsitekturnya harus berubah menjadi server-based application.

### Mengapa database tidak diletakkan di network share?

SQLite menggunakan file locking untuk mengatur akses database. Network filesystem dapat memiliki implementasi locking yang berbeda dan berpotensi menyebabkan database terkunci, konflik, atau kerusakan data.

Database sebaiknya selalu disimpan pada local filesystem komputer yang menjalankan backend.

### Mengapa menggunakan archive?

Routine yang tidak dipakai sebaiknya diarsipkan, bukan langsung dihapus.

Dengan begitu:

- Histori lama tetap tersedia.
- Statistik tidak rusak.
- Routine dapat dipulihkan.
- Data pengguna tidak hilang secara tidak sengaja.

### Mengapa PWA tidak sepenuhnya offline?

Backend FastAPI tetap menjadi jalur utama untuk membaca dan menulis SQLite.

Service worker dapat menyimpan asset frontend, tetapi tidak otomatis membuat API dan database lokal tetap aktif ketika backend berhenti.

PWA pada versi awal diposisikan sebagai standalone shortcut, bukan pengganti backend.

### Mengapa backend hanya bind ke localhost?

Backend hanya bind ke `127.0.0.1` secara default agar API tidak dapat diakses dari perangkat lain dalam jaringan tanpa konfigurasi tambahan.

Mode network access harus menjadi pilihan eksplisit user dan tidak boleh aktif secara default.

---

## Kontribusi

Kontribusi terbuka untuk semua orang.

### Workflow

1. Fork repository.
2. Buat branch baru.
3. Implementasikan perubahan.
4. Jalankan lint dan test.
5. Pastikan migration database berjalan.
6. Pastikan tidak ada database pribadi yang ikut ter-commit.
7. Buat pull request.
8. Jelaskan perubahan dan alasan desainnya.

Contoh:

```bash
git checkout -b feat/add-routine-template

npm install
npm run lint
npm run test

git commit -m "feat: add routine templates"
git push origin feat/add-routine-template
```

### Pedoman kontribusi

- Pertahankan aplikasi tetap ringan.
- Jangan menambahkan login tanpa alasan kuat.
- Jangan mengirim data pengguna ke server eksternal.
- Jangan mengubah konsep periodic checklist tanpa diskusi.
- Utamakan aksesibilitas.
- Pertahankan keyboard usability.
- Tambahkan test untuk logic baru.
- Tambahkan migration untuk perubahan schema.
- Jangan menghapus data lama tanpa mekanisme migrasi.
- Gunakan bahasa dan nama variabel yang konsisten.
- Hindari dependency besar jika fitur dapat dibuat dengan solusi ringan.
- Jangan menambahkan scheduler jika tidak dibutuhkan oleh fitur.
- Jangan menjadikan Docker sebagai dependency user akhir.
- Jangan mengubah default bind address dari `127.0.0.1` tanpa alasan keamanan yang jelas.
- Jangan menyimpan data pribadi contributor di repository.
- Dokumentasikan perubahan pada format backup.
- Dokumentasikan perubahan schema database.

### Commit convention

Gunakan format seperti:

```text
feat: add routine archive
fix: handle weekly period boundary
docs: update installation guide
refactor: simplify completion service
test: add streak calculation tests
chore: update dependencies
```

---

## Lisensi

Project ini dirilis menggunakan lisensi MIT.

```text
MIT License

Copyright (c) 2026 isitdone contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files, to deal in the Software
without restriction, including without limitation the rights to use, copy,
modify, merge, publish, distribute, sublicense, and/or sell copies of the
Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
```

---

## Filosofi

`isitdone` dibuat untuk menyelesaikan masalah kecil yang terjadi berulang kali:

```text
Aku tahu ini harus dilakukan hari ini,
tetapi aku tidak ingat apakah sudah melakukannya.
```

Aplikasi ini tidak ingin mengatur seluruh hidup pengguna.

Aplikasi ini hanya ingin memberikan jawaban yang jelas:

```text
Routine ini sudah selesai.
Routine itu belum.
```

Simple, private, local, dan mudah digunakan.

```text
No forced schedule.
No unnecessary account.
No cloud dependency.
Just a clear view of what is done and what is not.
```