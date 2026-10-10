import { prisma } from "@/lib/prisma";

// Last 8 digits: "+216 20 123 456", "20123456" and "20 123 456" all match.
function phoneKey(phone: string | null | undefined): string {
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
