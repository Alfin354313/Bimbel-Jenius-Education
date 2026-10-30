# Gambar soal dan pilihan di Teman Belajar

Perubahan pendamping Bank Soal Guru pada repo panel-baru. Memuat `js/question-media.js` sebelum skrip ujian/pembahasan di teman-belajar.html; renderer teks dan gambar menggunakan DOM yang aman, tanpa HTML dari dokumen. Pertanyaan, pilihan A–E, jawaban yang dipilih, kunci pada pembahasan, dan penjelasan bergambar ikut ditampilkan.

Aktifkan `panel-baru/supabase/question_images.sql` pada database bersama setelah migrasi Bank Soal, ujian, dan isian otomatis yang sudah digunakan. Tidak ada SQL tambahan untuk dijalankan dari repo ini. Kebijakan akun, akses ujian, dan pembukaan hasil/pembahasan tetap diperiksa server. Preview saja, belum merge. Uji bersama preview Panel Guru.

Jalankan `node tests/question-images-review.cjs` dengan Playwright; `CHROMIUM_PATH` opsional. Pengujian memakai mock RPC, bukan akun murid aktif.
