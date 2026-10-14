import { prisma } from "@/lib/prisma";

// Coarse on purpose: one write per user every few minutes is plenty to
// tell "opened the app today" from "signed up and never came back". The
// app's language is noted at the same time (or right away if it changed).
const MIN_INTERVAL_MS = 10 * 60 * 1000;

export async function recordLastSeen(
  user: { id: string; lastSeenAt: Date | null; locale: string | null },
  locale: string
): Promise<void> {
  const now = new Date();
  const recent = user.lastSeenAt && now.getTime() - user.lastSeenAt.getTime() < MIN_INTERVAL_MS;
  if (recent && user.locale === locale) return;
  await prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: now, locale } });
}
