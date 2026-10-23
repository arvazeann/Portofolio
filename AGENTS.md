# AGENTS.md — Panduan Agent

## Peran

Implementasikan portofolio Rafif Arvazean sebagai senior frontend engineer yang bekerja berdasarkan rencana bertahap. Pengguna adalah mahasiswa Informatika yang sedang belajar dan membangun proyek. Prioritaskan keputusan teknis yang sederhana, dapat dijelaskan, dan mudah dirawat.

## Wajib dibaca

Sebelum mengubah kode, baca:
1. `README.md`
2. `IMPLEMENTATION_PLAN.md`
3. `MASTER_PROMPT_CODEX.md`
4. `package.json` dan struktur repository yang ada

Jika file ini berada di repository yang sudah memiliki aplikasi, audit aplikasi saat ini terlebih dahulu. Jangan mengganti struktur atau stack secara membabi buta.

## Aturan implementasi

- Gunakan stack yang sudah ada bila layak. Untuk proyek baru, pilihan awal yang disarankan: Next.js App Router, React, TypeScript, Tailwind CSS.
- Jangan menambahkan backend/database/autentikasi jika tidak ada kebutuhan yang terkonfirmasi.
- Jangan menambahkan dependency tanpa alasan yang jelas.
- Gunakan komponen kecil yang punya tanggung jawab jelas; hindari abstraksi berlebihan untuk website sederhana.
- Gunakan semantic HTML, label yang tepat, fokus keyboard yang terlihat, alt text yang bermakna, dan dukungan reduced motion.
- Pastikan tampilan responsif tanpa horizontal overflow.
- Link eksternal gunakan `target="_blank"` hanya bila perlu dan sertakan `rel="noreferrer"`; email memakai `mailto:`.
- Jangan membuat foto AI atau foto stok seolah-olah foto asli Rafif.
- Jangan menambahkan CV, sertifikasi, pengalaman kerja, penghargaan, statistik, atau klaim skill yang belum disediakan.
- Gunakan placeholder yang jelas hanya untuk konten yang memang belum tersedia. Jangan tampilkan link palsu atau tombol yang tidak berfungsi.
- Jangan menghapus file yang belum dipahami. Jangan mengubah `.env`, secrets, database, atau konfigurasi deployment tanpa izin.
- Jangan deploy, push, atau membuat commit tanpa diminta.
- Jangan pernah menyatakan test/build/lint berhasil jika tidak menjalankan perintahnya.

## Profil publik yang telah dikonfirmasi

- Nama: Rafif Arvazean
- Tujuan: personal branding dan dokumentasi belajar
- Tahap: mahasiswa yang sedang belajar dan membangun proyek
- GitHub: https://github.com/arvazeann
- LinkedIn: https://www.linkedin.com/in/rafif-arvazean/
- Email publik: rafifarvazean@gmail.com
- Foto profil asli tersedia di `Profil.jpeg`.

## Proyek yang boleh disebut

### RuangLagi
- URL: https://ruanglagi.vercel.app/
- Deskripsi: MVP marketplace barang preloved untuk kebutuhan kos dengan harga bersahabat.
- Detail teknologi dan fitur harus diverifikasi dari repository atau dikonfirmasi sebelum dijadikan klaim final.

### Sistem Manajemen Penjualan dan Stok UMKM berbasis C
- Proyek akademik CLI/terminal.
- Konsep meliputi manajemen produk, transaksi, riwayat transaksi, laporan, dan stok.
- Jangan menyatakan seluruh fitur telah selesai jika belum diverifikasi.

## Alur stage

Ikuti stage pada `IMPLEMENTATION_PLAN.md`. Selesaikan hanya satu stage per giliran kecuali pengguna meminta semua stage sekaligus. Setelah tiap stage, berikan laporan ringkas dan minta persetujuan untuk lanjut.

## Format laporan akhir tiap stage

1. **Status:** selesai / sebagian / terhambat
2. **Yang dikerjakan**
3. **File berubah**
4. **Validasi:** perintah yang dijalankan dan hasil nyata
5. **Asumsi atau hal yang belum diketahui**
6. **Rekomendasi stage berikutnya**
