import { prisma } from "@/lib/prisma";
import {
  computeDashboardTotals,
  stockTotals,
  type OrderLike,
} from "@/lib/gestion/calculations";
import { buildMonthOptions, monthKeyFromDate } from "@/lib/gestion/format";

export async function getProducts(userId: string) {
  return prisma.product.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function getStockItems(userId: string) {
  const items = await prisma.stockItem.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: { purchases: true, usages: true },
  });
  return items.map((item) => ({ item, totals: stockTotals(item.purchases, item.usages) }));
}

export async function getExpenses(userId: string) {
  return prisma.expense.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
}

export async function getOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    include: { lines: true },
  });
}

export async function getProductionBatches(userId: string) {
  return prisma.productionBatch.findMany({
    where: { product: { userId } },
    orderBy: { date: "desc" },
    include: { product: true },
  });
}

/** Total produced / sold (delivered) / available, per product. */
export async function getFinishedStock(userId: string) {
  const [products, batches, orders] = await Promise.all([
    getProducts(userId),
    prisma.productionBatch.findMany({ where: { product: { userId } } }),
    prisma.order.findMany({
      where: { userId, status: "DELIVERED" },
      include: { lines: true },
    }),
  ]);

  return products.map((product) => {
    const totalProduced = batches
      .filter((b) => b.productId === product.id)
      .reduce((sum, b) => sum + b.quantity, 0);
    const totalSold = orders.reduce(
      (sum, o) =>
        sum +
        o.lines
          .filter((l) => l.productId === product.id)
          .reduce((s, l) => s + l.quantity, 0),
      0
    );
    return { product, totalProduced, totalSold, available: totalProduced - totalSold };
  });
}

export async function getAvailableMonthKeys(userId: string) {
  const [orders, expenses] = await Promise.all([
    prisma.order.findMany({ where: { userId }, select: { date: true } }),
    prisma.expense.findMany({ where: { userId }, select: { date: true } }),
  ]);
  const existing = [...orders, ...expenses].map((r) => monthKeyFromDate(r.date));
  return buildMonthOptions(existing);
}

export async function getDashboardData(userId: string, month: string) {
  const [orders, expenses, stockItems] = await Promise.all([
    getOrders(userId),
    getExpenses(userId),
    getStockItems(userId),
  ]);

  const ordersInMonth: OrderLike[] = orders
    .filter((o) => monthKeyFromDate(o.date) === month)
    .map((o) => ({
      id: o.id,
      date: o.date,
      status: o.status,
      paymentStatus: o.paymentStatus,
      lines: o.lines,
    }));

  const expensesInMonth = expenses
    .filter((e) => monthKeyFromDate(e.date) === month)
    .reduce((sum, e) => sum + e.amount, 0);

  const stockPurchasesCostInMonth = stockItems.reduce((sum, { item }) => {
    return (
      sum +
      item.purchases
        .filter((p) => monthKeyFromDate(p.date) === month)
        .reduce((s, p) => s + p.quantity * p.unitCost, 0)
    );
  }, 0);

  const totals = computeDashboardTotals({
    ordersInMonth,
    expensesInMonth,
    stockPurchasesCostInMonth,
  });

  const stockAlerts = stockItems
    .filter(({ item, totals: t }) => t.remaining <= (item.alertThreshold || 0))
    .map(({ item, totals: t }) => ({ item, remaining: t.remaining }));

  return { totals, stockAlerts };
}
