-- Jalankan setelah environment variables dan endpoint /api/submit-review aktif.
-- Menutup jalur bypass langsung dari browser; insert hanya melalui server.
REVOKE INSERT ON TABLE public.review_submissions FROM anon;
-- Pastikan tidak ada kebijakan INSERT anon yang tetap berlaku.
DROP POLICY IF EXISTS "Allow anonymous review submissions" ON public.review_submissions;
-- Periksa kebijakan lama melalui Supabase Dashboard > Authentication > Policies.
