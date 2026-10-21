# Aktivasi anti-spam ulasan (belum production-ready sebelum konfigurasi)

Di Vercel website Jenius Education, tambahkan **server-only** environment variables:
- TURNSTILE_SITE_KEY dan TURNSTILE_SECRET_KEY dari Cloudflare Turnstile (daftarkan domain produksi dan preview yang digunakan).
- UPSTASH_REDIS_REST_URL dan UPSTASH_REDIS_REST_TOKEN dari Upstash Redis.
- SUPABASE_SERVICE_ROLE_KEY dari Supabase, **jangan** memakai prefix NEXT_PUBLIC dan jangan memasukkannya ke HTML.
- NEXT_PUBLIC_SUPABASE_URL (sudah digunakan website).

Redeploy branch preview setelah konfigurasi. Uji submit, batas 3/15 menit per IP, duplikat 24 jam, penolakan token invalid, dan moderasi admin. Setelah API berhasil, jalankan supabase/review_antispam.sql pada Supabase SQL Editor untuk menutup INSERT anon langsung. Periksa semua policies INSERT anon lain dan hapus yang masih memberi akses. Jangan jalankan SQL penutupan sebelum endpoint baru aktif di production karena formulir lama akan berhenti mengirim.

**Penting:** Kode pada branch ini belum di-merge; memerlukan pengujian preview dan konfigurasi rahasia di Vercel. Jangan pernah menempelkan service role key di chat atau repository.
