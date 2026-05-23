-- ═══════════════════════════════════════════════════════
-- FIX: Add missing columns to make all features work
-- Run this in Supabase SQL Editor if Save/Upload don't work
-- ═══════════════════════════════════════════════════════

-- 1. User profile: personal info columns
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS birth_date TEXT DEFAULT '';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT '';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS cin TEXT DEFAULT '';

-- 2. Medical profile: health + emergency + privacy columns
ALTER TABLE public.medical_profiles ADD COLUMN IF NOT EXISTS medical_history TEXT DEFAULT '';
ALTER TABLE public.medical_profiles ADD COLUMN IF NOT EXISTS weight TEXT DEFAULT '';
ALTER TABLE public.medical_profiles ADD COLUMN IF NOT EXISTS height TEXT DEFAULT '';
ALTER TABLE public.medical_profiles ADD COLUMN IF NOT EXISTS secondary_contact TEXT DEFAULT '';
ALTER TABLE public.medical_profiles ADD COLUMN IF NOT EXISTS doctor_phone TEXT DEFAULT '';
ALTER TABLE public.medical_profiles ADD COLUMN IF NOT EXISTS qr_visibility TEXT DEFAULT 'full';

-- 3. Medical documents table
CREATE TABLE IF NOT EXISTS public.medical_documents (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null references public.user_profiles(id) on delete cascade,
  file_name text not null default '',
  file_type text not null default 'pdf',
  category text not null default 'other',
  file_url text not null default '',
  file_size integer not null default 0,
  notes text not null default '',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS medical_documents_user_profile_id_idx
  ON public.medical_documents(user_profile_id);

ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (backend uses service role key)
DROP POLICY IF EXISTS "medical_documents_service_role" ON public.medical_documents;
CREATE POLICY "medical_documents_service_role"
ON public.medical_documents FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-documents', 'medical-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Allow uploads to medical-documents" ON storage.objects;
CREATE POLICY "Allow uploads to medical-documents"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'medical-documents');

DROP POLICY IF EXISTS "Allow public read medical-documents" ON storage.objects;
CREATE POLICY "Allow public read medical-documents"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'medical-documents');

DROP POLICY IF EXISTS "Allow delete medical-documents" ON storage.objects;
CREATE POLICY "Allow delete medical-documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'medical-documents');
