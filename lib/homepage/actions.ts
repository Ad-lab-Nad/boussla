"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  HeroContent,
  ArgumentaireContent,
  OffresContent,
  Offer,
  TemoignagesContent,
  Testimonial,
} from "@/lib/homepage/types";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function revalidateHomepage() {
  revalidatePath("/");
  revalidatePath("/admin/accueil");
}

async function swapOrder(id: string, direction: "up" | "down") {
  const blocks = await prisma.homepageBlock.findMany({ orderBy: [{ order: "asc" }, { id: "asc" }] });
  const index = blocks.findIndex((b) => b.id === id);
  if (index === -1) return;
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= blocks.length) return; // already at the edge

  const a = blocks[index];
  const b = blocks[swapIndex];
  await prisma.$transaction([
    prisma.homepageBlock.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.homepageBlock.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);
}

export async function moveHomepageBlockUp(formData: FormData) {
  await requireAdmin();
  await swapOrder(str(formData, "id"), "up");
  revalidateHomepage();
}

export async function moveHomepageBlockDown(formData: FormData) {
  await requireAdmin();
  await swapOrder(str(formData, "id"), "down");
  revalidateHomepage();
}

export async function toggleHomepageBlockActive(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const block = await prisma.homepageBlock.findUnique({ where: { id } });
  if (!block) return;
  await prisma.homepageBlock.update({ where: { id }, data: { active: !block.active } });
  revalidateHomepage();
}

export async function updateHeroBlock(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const block = await prisma.homepageBlock.findUnique({ where: { id } });
  if (!block || block.type !== "HERO") throw new Error("Bloc introuvable.");

  const title = str(formData, "title");
  const ctaLabel = str(formData, "ctaLabel");
  if (!title || !ctaLabel) throw new Error("Indique au moins un titre et un texte de bouton.");

  const content: HeroContent = {
    title,
    subtitle: str(formData, "subtitle"),
    solutionText: str(formData, "solutionText"),
    ctaLabel,
    imageUrl: str(formData, "imageUrl") || null,
  };
  await prisma.homepageBlock.update({ where: { id }, data: { content } });
  revalidateHomepage();
}

export async function updateArgumentaireBlock(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const block = await prisma.homepageBlock.findUnique({ where: { id } });
  if (!block || block.type !== "ARGUMENTAIRE") throw new Error("Bloc introuvable.");

  const sectionTitle = str(formData, "sectionTitle");
  const text = str(formData, "text");
  if (!sectionTitle || !text) throw new Error("Indique au moins un titre et un texte.");

  const content: ArgumentaireContent = {
    sectionTitle,
    text,
    imageUrl: str(formData, "imageUrl") || null,
  };
  await prisma.homepageBlock.update({ where: { id }, data: { content } });
  revalidateHomepage();
}

export async function updateOffresBlock(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const block = await prisma.homepageBlock.findUnique({ where: { id } });
  if (!block || block.type !== "OFFRES") throw new Error("Bloc introuvable.");

  const offers: Offer[] = [0, 1, 2].map((i) => ({
    name: str(formData, `offer${i}Name`),
    price: str(formData, `offer${i}Price`),
    features: str(formData, `offer${i}Features`)
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean),
    ctaLabel: str(formData, `offer${i}CtaLabel`) || "Essayer gratuitement",
  }));
  if (offers.some((o) => !o.name || !o.price)) {
    throw new Error("Chaque offre a besoin d'un nom et d'un prix.");
  }

  const content: OffresContent = { offers };
  await prisma.homepageBlock.update({ where: { id }, data: { content } });
  revalidateHomepage();
}

export async function updateTemoignagesBlock(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const block = await prisma.homepageBlock.findUnique({ where: { id } });
  if (!block || block.type !== "TEMOIGNAGES") throw new Error("Bloc introuvable.");

  let rawItems: Testimonial[] = [];
  try {
    rawItems = JSON.parse(str(formData, "itemsJson") || "[]");
  } catch {
    rawItems = [];
  }
  const items = rawItems
    .filter(
      (t) =>
        t && typeof t.quote === "string" && t.quote.trim() && typeof t.name === "string" && t.name.trim()
    )
    .map((t) => ({
      quote: t.quote.trim(),
      name: t.name.trim(),
      photoUrl: typeof t.photoUrl === "string" && t.photoUrl ? t.photoUrl : null,
    }));

  const content: TemoignagesContent = { items };
  await prisma.homepageBlock.update({ where: { id }, data: { content } });
  revalidateHomepage();
}

/**
 * Uploads through the admin's own authenticated Supabase session (never a
 * public key), so it's subject to the "Admin write homepage images" storage
 * policy from the 20260919113600 migration — no separate public-write hole.
 */
export async function uploadHomepageImage(formData: FormData): Promise<{ url: string }> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Choisis une image.");

  const supabase = await createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("homepage")
    .upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (error) throw new Error(`Échec de l'upload : ${error.message}`);

  const { data } = supabase.storage.from("homepage").getPublicUrl(path);
  return { url: data.publicUrl };
}
