import { prisma } from "@/lib/prisma";

export type UserActivity = {
  products: number;
  orders: number;
  expenses: number;
  lastEntryAt: Date | null;
  status: "active" | "inactive" | "never";
};

const ACTIVE_DAYS = 7;

/** What each user has entered in the app — products, orders, expenses —
 * and when last, for the back office's "who actually uses it" column. */
export async function getUserActivity(userIds: string[]): Promise<Map<string, UserActivity>> {
  const memberships = await prisma.businessMembership.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, businessId: true },
  });
  const businessIds = memberships.map((m) => m.businessId);
  const where = { businessId: { in: businessIds } };
  const agg = { _count: { _all: true }, _max: { createdAt: true } } as const;
  const [products, orders, expenses] = await Promise.all([
    prisma.product.groupBy({ by: ["businessId"], where, ...agg }),
    prisma.order.groupBy({ by: ["businessId"], where, ...agg }),
    prisma.expense.groupBy({ by: ["businessId"], where, ...agg }),
  ]);
  type Row = { businessId: string; _count: { _all: number }; _max: { createdAt: Date | null } };
  const index = (rows: Row[]) => new Map(rows.map((r) => [r.businessId, r]));
  const [p, o, e] = [index(products), index(orders), index(expenses)];

  const cutoff = Date.now() - ACTIVE_DAYS * 24 * 60 * 60 * 1000;
  const result = new Map<string, UserActivity>();
  for (const userId of userIds) {
    const a: UserActivity = { products: 0, orders: 0, expenses: 0, lastEntryAt: null, status: "never" };
    for (const m of memberships.filter((x) => x.userId === userId)) {
      for (const [rows, key] of [[p, "products"], [o, "orders"], [e, "expenses"]] as const) {
        const row = rows.get(m.businessId);
        if (!row) continue;
        a[key] += row._count._all;
        const last = row._max.createdAt;
        if (last && (!a.lastEntryAt || last > a.lastEntryAt)) a.lastEntryAt = last;
      }
    }
    if (a.lastEntryAt) a.status = a.lastEntryAt.getTime() >= cutoff ? "active" : "inactive";
    result.set(userId, a);
  }
  return result;
}
