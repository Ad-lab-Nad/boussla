import { prisma } from "@/lib/prisma";
import { orderAmount, type OrderLike } from "@/lib/gestion/calculations";

// Last 8 digits: "+216 20 123 456", "20123456" and "20 123 456" all match.
export function phoneKey(phone: string | null | undefined): string {
  return (phone ?? "").replace(/\D/g, "").slice(-8);
}

/** A delivered order's client lands in the Clients page on its own: matched
 * by phone first, then by name (case-insensitive); created if new. An
 * existing client only gets a missing phone filled in — never overwritten. */
export async function syncDeliveredOrderClient(
  businessId: string,
  order: { status: string; clientName: string | null; clientPhone: string | null }
) {
  if (order.status !== "DELIVERED") return;
  const name = order.clientName?.trim() || null;
  const phone = order.clientPhone?.trim() || null;
  if (!name && !phone) return;

  const key = phoneKey(phone);
  let client = null;
  if (key.length >= 8) {
    const withPhone = await prisma.client.findMany({
      where: { businessId, phone: { not: null } },
      select: { id: true, phone: true },
    });
    client = withPhone.find((c) => phoneKey(c.phone) === key) ?? null;
  }
  if (!client && name) {
    client = await prisma.client.findFirst({
      where: { businessId, name: { equals: name, mode: "insensitive" } },
      select: { id: true, phone: true },
    });
  }

  if (!client) {
    await prisma.client.create({ data: { businessId, name: name ?? phone!, phone } });
  } else if (phone && !client.phone) {
    await prisma.client.update({ where: { id: client.id }, data: { phone } });
  }
}

/** What each client still owes on delivered, not-yet-paid orders — matched
 * to the Clients page the same way syncDeliveredOrderClient does (phone,
 * then name), so each order counts for at most one client. */
export function unpaidOrdersByClient(
  clients: { id: string; name: string; phone: string | null }[],
  orders: (OrderLike & { clientName: string | null; clientPhone: string | null })[]
): Map<string, number> {
  const byPhone = new Map<string, string>();
  const byName = new Map<string, string>();
  for (const c of clients) {
    const key = phoneKey(c.phone);
    if (key.length >= 8 && !byPhone.has(key)) byPhone.set(key, c.id);
    const name = c.name.trim().toLowerCase();
    if (!byName.has(name)) byName.set(name, c.id);
  }
  const owed = new Map<string, number>();
  for (const o of orders) {
    if (o.status !== "DELIVERED" || o.paymentStatus === "PAID") continue;
    const key = phoneKey(o.clientPhone);
    const clientId =
      (key.length >= 8 ? byPhone.get(key) : undefined) ??
      (o.clientName ? byName.get(o.clientName.trim().toLowerCase()) : undefined);
    if (clientId) owed.set(clientId, (owed.get(clientId) ?? 0) + orderAmount(o));
  }
  return owed;
}
