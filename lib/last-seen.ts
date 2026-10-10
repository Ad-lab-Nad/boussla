import { prisma } from "@/lib/prisma";

// Coarse on purpose: one write per user every few minutes is plenty to
// tell "opened the app today" from "signed up and never came back".
const MIN_INTERVAL_MS = 10 * 60 * 1000;

export async function recordLastSeen(user: { id: string; lastSeenAt: Date | null }): Promise<void> {
  const now = new Date();
  if (user.lastSeenAt && now.getTime() - user.lastSeenAt.getTime() < MIN_INTERVAL_MS) return;
  await prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: now } });
}
