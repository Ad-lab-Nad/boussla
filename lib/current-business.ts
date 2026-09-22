import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

/**
 * The signed-in user's Business — every Gestion business-data table
 * (Product/StockItem/Order/Client/Expense/MonthlyGoal) is scoped by
 * businessId, not userId, so this is what every Gestion query/action should
 * use to scope its data. Phase 1 is one user per business (no invite UI
 * yet), so this always resolves to exactly one membership.
 *
 * Self-healing fallback (mirrors getOrCreateSubscription): creates a
 * Business + OWNER membership on the fly for any account that somehow
 * doesn't have one yet, rather than failing outright.
 */
export const getCurrentBusiness = cache(async function getCurrentBusiness() {
  const user = await getCurrentUser();

  const membership = await prisma.businessMembership.findFirst({
    where: { userId: user.id },
    include: { business: true },
  });
  if (membership) return membership.business;

  return prisma.business.create({
    data: {
      name: user.email.split("@")[0] || "Mon entreprise",
      memberships: { create: { userId: user.id, role: "OWNER" } },
    },
  });
});
