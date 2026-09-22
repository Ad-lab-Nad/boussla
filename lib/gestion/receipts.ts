import { createAdminClient } from "@/lib/supabase/admin";

const RECEIPTS_BUCKET = "receipts";
const SIGNED_URL_TTL_SECONDS = 600;

/** Uploads a receipt photo, scoped under the owning business's own folder. */
export async function uploadReceipt(businessId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${businessId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await createAdminClient()
    .storage.from(RECEIPTS_BUCKET)
    .upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (error) throw new Error(`Échec de l'upload du reçu : ${error.message}`);
  return path;
}

/**
 * Mints a short-lived signed URL for a receipt. `businessId` must match the
 * path's own prefix — defense-in-depth even though the path was only ever
 * written by trusted server code scoped to the same business.
 */
export async function getReceiptSignedUrl(path: string, businessId: string): Promise<string | null> {
  if (!path.startsWith(`${businessId}/`)) return null;
  const { data, error } = await createAdminClient()
    .storage.from(RECEIPTS_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error || !data) return null;
  return data.signedUrl;
}
