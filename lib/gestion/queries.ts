import { prisma } from "@/lib/prisma";
import {
  computeDashboardTotals,
  expenseAccrualForMonth,
  orderCashDate,
  rankAndFoldCategories,
  stockTotals,
  type CategoryOption,
  type OrderLike,
} from "@/lib/gestion/calculations";
import {
  buildMonthOptions,
  monthKeyFromDate,
  monthKeyFromDateStr,
  shiftMonthKey,
  todayStr,
} from "@/lib/gestion/format";
import { EXPENSE_CATEGORY_OPTIONS } from "@/lib/gestion/expense-categories";

export async function getProducts(userId: string) {
  return prisma.product.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

/** Simple mean of sellPrice across the catalog — null with an empty catalog. */
export async function getAverageSellPrice(userId: string): Promise<number | null> {
  const products = await getProducts(userId);
  if (products.length === 0) return null;
  return products.reduce((sum, p) => sum + p.sellPrice, 0) / products.length;
}

export async function getMonthlyGoal(userId: string, month: string) {
  return prisma.monthlyGoal.findUnique({ where: { userId_month: { userId, month } } });
}

export async function getStockItems(userId: string) {
  const items = await prisma.stockItem.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: { purchases: true, usages: true },
  });
  return items.map((item) => ({ item, totals: stockTotals(item.purchases, item.usages) }));
}

export async function getStockPurchases(userId: string) {
  return prisma.stockPurchase.findMany({
    where: { stockItem: { userId } },
    orderBy: { date: "desc" },
    include: { stockItem: true },
  });
}

export async function getStockUsages(userId: string) {
  return prisma.stockUsage.findMany({
    where: { stockItem: { userId } },
    orderBy: { date: "desc" },
    include: { stockItem: true },
  });
}

export async function getExpenses(userId: string) {
  return prisma.expense.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
}

export async function getClients(userId: string) {
  return prisma.client.findMany({
    where: { userId },
    include: { receivables: true },
    orderBy: { name: "asc" },
  });
}

export async function getReceivables(userId: string) {
  return prisma.receivable.findMany({
    where: { client: { userId } },
    include: { client: true },
    orderBy: { dueDate: "asc" },
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

/**
 * Per-product movement for one specific month: quantity sold and produced
 * *that month*, plus the stock balance as it stood at the end of that month
 * (cumulative produced minus cumulative sold up to and including it) — a
 * historical snapshot, not "as of now" like getFinishedStock.
 */
export async function getProductMovement(userId: string, month: string) {
  const [products, batches, orders] = await Promise.all([
    getProducts(userId),
    prisma.productionBatch.findMany({ where: { product: { userId } } }),
    prisma.order.findMany({
      where: { userId, status: "DELIVERED" },
      include: { lines: true },
    }),
  ]);

  return products.map((product) => {
    const soldThisMonth = orders
      .filter((o) => monthKeyFromDate(o.date) === month)
      .reduce(
        (sum, o) =>
          sum + o.lines.filter((l) => l.productId === product.id).reduce((s, l) => s + l.quantity, 0),
        0
      );

    const producedThisMonth = batches
      .filter((b) => b.productId === product.id && monthKeyFromDate(b.date) === month)
      .reduce((sum, b) => sum + b.quantity, 0);

    const totalProducedToDate = batches
      .filter((b) => b.productId === product.id && monthKeyFromDate(b.date) <= month)
      .reduce((sum, b) => sum + b.quantity, 0);

    const totalSoldToDate = orders
      .filter((o) => monthKeyFromDate(o.date) <= month)
      .reduce(
        (sum, o) =>
          sum + o.lines.filter((l) => l.productId === product.id).reduce((s, l) => s + l.quantity, 0),
        0
      );

    return {
      product,
      soldThisMonth,
      producedThisMonth,
      availableAtMonthEnd: totalProducedToDate - totalSoldToDate,
    };
  });
}

export async function getAvailableMonthKeys(userId: string) {
  const [orders, expenses] = await Promise.all([
    prisma.order.findMany({ where: { userId }, select: { date: true } }),
    prisma.expense.findMany({ where: { userId }, select: { date: true, spreadMonths: true } }),
  ]);
  const existing = orders.map((r) => monthKeyFromDate(r.date));
  // A spread expense's later months need to be selectable too, even ones
  // further out than buildMonthOptions's own +6-month buffer.
  for (const e of expenses) {
    const startMonth = monthKeyFromDate(e.date);
    const months = e.spreadMonths && e.spreadMonths > 1 ? e.spreadMonths : 1;
    for (let i = 0; i < months; i++) existing.push(shiftMonthKey(startMonth, i));
  }
  return buildMonthOptions(existing);
}

function toOrderLike(o: Awaited<ReturnType<typeof getOrders>>[number]): OrderLike {
  return {
    id: o.id,
    date: o.date,
    status: o.status,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    checkDueDate: o.checkDueDate,
    lines: o.lines,
  };
}

function totalsForMonth(
  month: string,
  orders: Awaited<ReturnType<typeof getOrders>>,
  expenses: Awaited<ReturnType<typeof getExpenses>>,
  stockItems: Awaited<ReturnType<typeof getStockItems>>
) {
  const allOrders = orders.map(toOrderLike);
  const ordersInMonth = allOrders.filter((o) => monthKeyFromDate(o.date) === month);
  // A postdated check's cash can land in a different month than the order
  // itself, so this is filtered separately by orderCashDate — see
  // computeDashboardTotals.
  const cashOrdersInMonth = allOrders.filter(
    (o) => monthKeyFromDate(orderCashDate(o)) === month
  );

  const expensesAccrualInMonth = expenses.reduce(
    (sum, e) => sum + expenseAccrualForMonth(e, month),
    0
  );
  const expensesCashInMonth = expenses
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

  return computeDashboardTotals({
    ordersInMonth,
    cashOrdersInMonth,
    expensesAccrualInMonth,
    expensesCashInMonth,
    stockPurchasesCostInMonth,
  });
}

const TREND_MONTHS = 6;

export async function getDashboardData(userId: string, month: string) {
  const [orders, expenses, stockItems] = await Promise.all([
    getOrders(userId),
    getExpenses(userId),
    getStockItems(userId),
  ]);

  const totals = totalsForMonth(month, orders, expenses, stockItems);
  const previousTotals = totalsForMonth(
    shiftMonthKey(month, -1),
    orders,
    expenses,
    stockItems
  );

  const trend = Array.from({ length: TREND_MONTHS }, (_, i) => {
    const key = shiftMonthKey(month, i - (TREND_MONTHS - 1));
    const t = totalsForMonth(key, orders, expenses, stockItems);
    return { month: key, revenue: t.revenue, netProfit: t.netProfit };
  });

  const stockAlerts = stockItems
    .filter(({ item, totals: t }) => t.remaining <= (item.alertThreshold || 0))
    .map(({ item, totals: t }) => ({ item, remaining: t.remaining }));

  return { totals, previousTotals, trend, stockAlerts };
}

export type AnalysisPeriod = "3" | "6" | "12" | "all";

export type AnalysisMonthRow = {
  month: string;
  revenue: number;
  cost: number;
  expensesTotal: number;
  netProfit: number;
};

export type ExpenseCategoryPoint = { month: string } & Record<string, number | string>;

function monthRange(startKey: string, endKey: string): string[] {
  const keys: string[] = [];
  let k = startKey;
  // month keys are zero-padded "YYYY-MM" so string comparison sorts correctly
  while (k <= endKey) {
    keys.push(k);
    k = shiftMonthKey(k, 1);
  }
  return keys;
}

export async function getAnalysisData(userId: string, period: AnalysisPeriod) {
  const [orders, expenses, stockItems] = await Promise.all([
    getOrders(userId),
    getExpenses(userId),
    getStockItems(userId),
  ]);

  const currentMonth = monthKeyFromDateStr(todayStr());

  let monthKeys: string[];
  if (period === "all") {
    const allDates = [...orders.map((o) => o.date), ...expenses.map((e) => e.date)];
    const earliestKey =
      allDates.length > 0
        ? monthKeyFromDate(allDates.reduce((min, d) => (d < min ? d : min), allDates[0]))
        : currentMonth;
    monthKeys = monthRange(earliestKey, currentMonth);
  } else {
    const n = Number(period);
    monthKeys = Array.from({ length: n }, (_, i) => shiftMonthKey(currentMonth, i - (n - 1)));
  }

  const monthlyTotals: AnalysisMonthRow[] = monthKeys.map((month) => {
    const t = totalsForMonth(month, orders, expenses, stockItems);
    return {
      month,
      revenue: t.revenue,
      cost: t.cost,
      expensesTotal: t.expensesTotal,
      netProfit: t.netProfit,
    };
  });

  // The category list can grow well past what a multi-line chart can show
  // clearly (dataviz soft cap is ~5-6 series) — fold whatever doesn't rank
  // into the top 5 by spend into "Autre" rather than a fixed slice. See
  // rankAndFoldCategories's own doc comment for why.
  const monthKeySet = new Set(monthKeys);
  const totalsByCategory: Record<string, number> = {};
  for (const opt of EXPENSE_CATEGORY_OPTIONS) totalsByCategory[opt.value] = 0;
  for (const e of expenses) {
    if (monthKeySet.has(monthKeyFromDate(e.date))) {
      totalsByCategory[e.category] += e.amount;
    }
  }

  const { folded: foldedValues, chartCategories } = rankAndFoldCategories(
    EXPENSE_CATEGORY_OPTIONS as unknown as CategoryOption[],
    totalsByCategory,
    5,
    "OTHER"
  );

  const categoryByMonth: ExpenseCategoryPoint[] = monthKeys.map((month) => {
    const point: ExpenseCategoryPoint = { month };
    for (const opt of chartCategories) point[opt.value] = 0;
    for (const e of expenses) {
      if (monthKeyFromDate(e.date) !== month) continue;
      const key = foldedValues.has(e.category) ? "OTHER" : e.category;
      point[key] = (point[key] as number) + e.amount;
    }
    return point;
  });

  return { monthlyTotals, categoryByMonth, chartCategories };
}
