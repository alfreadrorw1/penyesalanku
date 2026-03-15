# Untuk Lina

Website penyesalan yang dramatis dan elegan — dioptimalkan khusus untuk Android dan iPhone.

---

## Deploy ke Vercel via GitHub

### 1. Upload ke GitHub

```bash
cd project-v2

git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/username/nama-repo.git
git push -u origin main
```

### 2. Connect ke Vercel (sekali saja)

1. Buka [vercel.com](https://vercel.com) dan login
2. Klik **New Project**
3. Import dari GitHub → pilih repo ini
4. Klik **Deploy**

Selesai. Website langsung live.

### 3. Update selanjutnya (otomatis)

```bash
git add .
git commit -m "deskripsi perubahan"
git push
```

Vercel otomatis detect dan deploy ulang dalam ~30–60 detik.

---

## Struktur Folder

```
project-v2/
├── index.html          ← Halaman utama
├── admin.html          ← Dashboard admin
├── manifest.json       ← PWA (bisa install ke Home Screen HP)
├── vercel.json         ← Konfigurasi Vercel
├── .gitignore
│
├── css/
│   ├── style.css       ← Style halaman utama
│   └── admin.css       ← Style dashboard admin
│
├── js/
│   ├── script.js       ← Logic halaman utama
│   └── admin.js        ← Logic dashboard admin
│
├── data/
│   └── stories.json    ← Data default (dibaca jika LocalStorage kosong)
│
├── img/                ← Taruh foto di sini
│   ├── my-photo.jpg    ← Foto kamu (tampil di popup)
│   ├── story1.jpg      ← Foto untuk cerita 1
│   ├── story2.jpg      ← dst...
│   ├── gallery1.jpg    ← Foto galeri
│   └── ...
│
├── audio/              ← Taruh file audio di sini
│   ├── background.mp3  ← Musik latar (loop otomatis)
│   ├── story1.mp3      ← Audio cerita 1 (auto-play saat scroll)
│   └── ...
│
└── icons/              ← Icon PWA (sudah ada, tidak perlu diubah)
    ├── icon-192.png
    ├── icon-512.png
    └── icon-180.png
```

---

## Cara Menambahkan Foto & Audio

### Foto

1. Taruh file di folder `/img/`
2. Beri nama sesuai konvensi:
   - `my-photo.jpg` — foto kamu untuk popup
   - `story1.jpg` sampai `story7.jpg` — foto per cerita
   - `gallery1.jpg` sampai `gallery6.jpg` — foto galeri
3. Commit dan push → otomatis update

### Audio

1. Taruh file di folder `/audio/`
2. Format yang didukung: **MP3, M4A, WAV, OGG**
3. Beri nama:
   - `background.mp3` — musik latar
   - `story1.mp3` sampai `story7.mp3` — audio per cerita
4. Commit dan push → otomatis update

> Atau upload langsung dari **Dashboard Admin** — tersimpan di LocalStorage browser Lina.

---

## Dashboard Admin

Buka: `https://yoursite.vercel.app/admin.html`

- Masuk dengan username apapun (tidak perlu password)
- **Kelola Cerita** — tambah, edit, hapus cerita + upload audio & foto
- **Kelola Galeri** — tambah, hapus foto kenangan
- **Catatan** — edit teks catatan 20 ribu yang dramatis
- **Pengaturan** — ganti judul, pesan, foto popup, token Telegram

Semua perubahan dari admin disimpan di **LocalStorage browser** — artinya perubahan hanya tampil di browser yang digunakan admin.

Untuk perubahan permanen (tampil di semua orang), edit file `data/stories.json` lalu push ke GitHub.

---

## Telegram Notification

Ketika Lina menekan tombol di popup, bot Telegram kamu akan menerima notifikasi.

Konfigurasi sudah tersimpan di:
- `data/stories.json` → field `telegramBotToken` dan `telegramChatId`
- Atau ubah dari **Pengaturan** di dashboard admin

---

## Install ke Home Screen (PWA)

### Android (Chrome)
1. Buka website di Chrome
2. Tap menu titik tiga → **"Add to Home Screen"**
3. Website tampil seperti aplikasi native

### iPhone (Safari)
1. Buka website di Safari
2. Tap tombol **Share** (kotak dengan panah ke atas)
3. Pilih **"Add to Home Screen"**

---

## Fitur Lengkap

| Fitur | Keterangan |
|---|---|
| Opening screen | Animasi cinematic saat pertama buka |
| Love bubbles | SVG heart terbang ke atas terus-menerus |
| 7 cerita penyesalan | Teks muncul per baris saat di-scroll |
| Audio auto-play | Otomatis putar saat cerita terlihat |
| Galeri foto | Grid 2 kolom + lightbox full screen |
| Catatan 20 ribu | Section khusus catatan tersembunyi |
| Popup reaksi | Lina bisa jawab Suka / Tidak → kirim ke Telegram |
| Musik latar | Tombol FAB pojok kanan bawah |
| Bottom navigation | Navigasi di bawah layar, mudah dijangkau jempol |
| Safe area aware | Notch iPhone & home bar Android ditangani otomatis |
| Dashboard admin | Kelola semua konten tanpa edit kode |
| PWA | Bisa install ke Home Screen seperti aplikasi |

---

28.07.2024 — 28.01.2025
