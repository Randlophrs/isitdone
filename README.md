# isitdone

Aplikasi checklist periodik lokal untuk rutinitas harian, mingguan, dan bulanan. Kamu sering lupa apakah sesuatu sudah dikerjakan di periode ini. `isitdone` mencatatnya dengan satu klik.

Tidak ada login. Tidak ada cloud. Datamu tetap di komputermu sendiri sebagai file SQLite.

## Kenapa ini ada

Setiap hari aku bolak-balik nanya: "Olahraga pagi ini sudah? Baca buku sudah? Belajar hal baru hari ini?" Jawabannya selalu "kayaknya sudah, tapi lupa." Aplikasi ini lahir dari pertanyaan itu. Ia tidak memaksamu kerja di jam tertentu. Selama rutinitas selesai dalam periodenya, centang saja.

## Fitur

- Rutin harian, mingguan, bulanan.
- Centang sekali klik, dengan tombol undo.
- Kategori, warna, ikon, pin, dan urutan custom.
- Streak, longest streak, dan completion rate.
- Heatmap histori tahunan.
- Skip hari tanpa memutus streak.
- Backup dan restore ke JSON atau salinan SQLite.
- Mode gelap, mobile-friendly.

## Tech

Backend FastAPI + SQLModel + SQLite. Frontend React + Vite + TanStack Query. System tray pakai pystray.

## Instalasi

Butuh **Python 3.11+** dan **Git**. Node.js hanya dipakai saat install untuk membangun frontend.

Buka PowerShell, jalankan satu baris:

```powershell
irm https://raw.githubusercontent.com/Randlophrs/isitdone/main/install.ps1 | iex
```

Script meng-clone repo, menyiapkan virtual environment, menginstal dependensi, membangun frontend, lalu mendaftarkan perintah `isitdone` ke PATH.

Buka terminal baru, ketik:

```bash
isitdone
```

Server berjalan di background di `http://127.0.0.1:8000`. Ikon tray centang hijau muncul dan browser otomatis kebuka. Quit dari menu tray untuk menghentikan server.

Cara lain, clone manual lalu jalankan `install.ps1` dari dalam folder repo.

## Uninstall

Buka PowerShell:

```powershell
irm https://raw.githubusercontent.com/Randlophrs/isitdone/main/uninstall.ps1 | iex
```

Perintah ini hapus perintah `isitdone`, shim, entry PATH, dan folder clone `%LOCALAPPDATA%\isitdone-repo` beserta venv-nya. Riwayatmu di `%APPDATA%\isitdone\data` tetap utuh.

## Data

Datamu tersimpan di `%APPDATA%\isitdone\data\isitdone.sqlite`. Uninstall tidak menghapus folder ini, jadi riwayatmu aman.

## Lisensi

MIT.
