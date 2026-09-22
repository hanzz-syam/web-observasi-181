-- ============================================================
-- SI-OBSERVASI-181: Fitur Manajemen Metode Pembelajaran
-- Jalankan script ini di Supabase SQL Editor
-- ============================================================

-- ============================================================
-- BAGIAN 1: TABEL metode_pembelajaran
-- ============================================================
CREATE TABLE IF NOT EXISTS public.metode_pembelajaran (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  guru_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  judul       text        NOT NULL,
  mapel       text        NOT NULL,
  deskripsi   text,
  file_path   text,         -- path di Supabase Storage (uid/filename)
  file_name   text,         -- nama asli file yang diunggah
  file_type   text,         -- mime type (application/pdf, image/png, dll.)
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Index untuk mempercepat query berdasarkan guru
CREATE INDEX IF NOT EXISTS idx_metode_guru_id ON public.metode_pembelajaran (guru_id);

-- ============================================================
-- BAGIAN 2: ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.metode_pembelajaran ENABLE ROW LEVEL SECURITY;

-- Guru hanya bisa SELECT/INSERT/UPDATE/DELETE data miliknya sendiri
CREATE POLICY "guru_manage_own"
  ON public.metode_pembelajaran
  FOR ALL
  USING (auth.uid() = guru_id)
  WITH CHECK (auth.uid() = guru_id);

-- Kepala Sekolah bisa SELECT semua metode dari semua guru
CREATE POLICY "kepsek_read_all"
  ON public.metode_pembelajaran
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'kepsek'
    )
  );

-- ============================================================
-- BAGIAN 3: TRIGGER auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_metode_updated_at ON public.metode_pembelajaran;
CREATE TRIGGER trg_metode_updated_at
  BEFORE UPDATE ON public.metode_pembelajaran
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- BAGIAN 4: STORAGE BUCKET "metode-pembelajaran"
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'metode-pembelajaran',
  'metode-pembelajaran',
  false,
  20971520,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Policy Storage: Guru bisa UPLOAD ke folder miliknya ({uid}/...)
CREATE POLICY "guru_upload_own_folder"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'metode-pembelajaran'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy Storage: Guru bisa SELECT (download) file miliknya
CREATE POLICY "guru_download_own"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'metode-pembelajaran'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy Storage: Kepala Sekolah bisa SELECT semua file
CREATE POLICY "kepsek_download_all"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'metode-pembelajaran'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'kepsek'
    )
  );

-- Policy Storage: Guru bisa DELETE file miliknya
CREATE POLICY "guru_delete_own"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'metode-pembelajaran'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
