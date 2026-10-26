# Soal & Pembahasan: website utama

Menu murid berada di `Bimbel-Jenius-Education/teman-belajar.html`, sesudah Hasil Belajar. Panel Guru tetap berada di `panel-baru`; keduanya memanggil RPC pada proyek Supabase yang sama. Pengaturan URL proyek dan publishable key di kedua deployment harus tetap menunjuk proyek yang sama. Tidak ada akun murid kedua atau data ujian duplikat.

## Aktivasi guru

1. Terapkan `short_answer_autograding.sql`, kemudian `exam_review.sql` pada Supabase bersama.
2. Isi kunci dan Pembahasan saat membuat/mengimpor soal. Penjelasan diambil dari snapshot saat ujian dibuat, sehingga perubahan bank soal setelah itu tidak mengubah ujian lama.
3. Setelah sesi selesai, tutup ujian melalui Detail Ujian (atau tunggu jadwal ujian berakhir).
4. Selesaikan penilaian uraian panjang yang masih pending, lalu aktifkan Tampilkan Nilai.

Murid membuka Soal & Pembahasan untuk melihat ujian yang telah dikumpulkan. Daftar menampilkan alasan jika masih terkunci. Setelah dibuka, setiap soal menampilkan pertanyaan, opsi bila pilihan ganda, jawaban sendiri, jawaban benar/acuan, status Benar/Perlu diperbaiki/Sebagian benar/Tidak dijawab, penjelasan dan poin. Ada filter jawaban yang perlu dipelajari serta pencarian soal. Penjelasan kosong menampilkan arahan untuk berdiskusi dengan guru, tidak mengarang penjelasan baru.

## Akses data

RPC `jenius_exam_reviews()` dan `jenius_exam_review(p_id)` memverifikasi akun Murid aktif melalui `jenius_exam_student_id`. Detail hanya dapat dibaca peserta yang memiliki jawaban terkumpul, ujian non-draf, hasil dirilis, jadwal sudah selesai atau ujian ditutup, serta tidak ada penilaian pending. Daftar terkunci tidak mengirim kunci atau jawaban. Mengganti ID ujian, memakai akun lain/staf, atau melewati tombol browser tidak membuka detail. Mencabut Tampilkan Nilai menolak request berikutnya; halaman yang sudah dibuka/dilihat tidak dapat ditarik dari ingatan atau salinan pengguna.

Penilaian isian menggunakan fungsi yang sama dengan skor akhir; MCQ dan uraian manual memakai kunci/grades snapshot. Tidak mengubah nilai, jawaban atau status pengumpulan saat membaca. Jawaban/kunci tidak dimasukkan ke runner ujian.

Terapkan kode website utama dan backend SQL bersama. Tanpa SQL baru, menu memberi keterangan fitur sedang disiapkan. Tidak ada SQL yang dijalankan otomatis pada Supabase nyata. Pengujian lokal: `tests/exam-review.cjs` pada PGlite. Pengujian antarmuka website utama ada pada `tests/student-review-ui.cjs` di repository website.
