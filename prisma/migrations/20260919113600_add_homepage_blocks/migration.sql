-- CreateEnum
CREATE TYPE "HomepageBlockType" AS ENUM ('HERO', 'ARGUMENTAIRE', 'OFFRES', 'TEMOIGNAGES', 'FAQ');

-- CreateTable
CREATE TABLE "homepage_blocks" (
    "id" TEXT NOT NULL,
    "type" "HomepageBlockType" NOT NULL,
    "order" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_blocks_pkey" PRIMARY KEY ("id")
);

-- New table defaults to RLS off — keep it consistent with every other table
-- (Prisma connects as "postgres", which has BYPASSRLS, so this has no
-- effect on the app itself; it only closes the public PostgREST API).
ALTER TABLE "homepage_blocks" ENABLE ROW LEVEL SECURITY;

-- Supabase Storage bucket for homepage images (hero/argumentaire images,
-- témoignage photos). Public read so images actually display on the public
-- site; write restricted to the admin's own Supabase Auth session — see
-- lib/homepage/actions.ts's uploadHomepageImage, which uploads through
-- lib/supabase/server.ts's authenticated client, never a public key.
INSERT INTO storage.buckets (id, name, public)
VALUES ('homepage', 'homepage', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read homepage images" ON storage.objects
  FOR SELECT USING (bucket_id = 'homepage');

CREATE POLICY "Admin write homepage images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'homepage' AND auth.jwt() ->> 'email' = 'dna.nada.abidi@gmail.com');

CREATE POLICY "Admin update homepage images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'homepage' AND auth.jwt() ->> 'email' = 'dna.nada.abidi@gmail.com');

CREATE POLICY "Admin delete homepage images" ON storage.objects
  FOR DELETE USING (bucket_id = 'homepage' AND auth.jwt() ->> 'email' = 'dna.nada.abidi@gmail.com');
