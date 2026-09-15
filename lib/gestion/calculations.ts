// Pure calculation helpers for the Gestion module — no I/O, so they mirror
// the original prototype's math 1:1 and stay easy to unit test.

import { monthKeyFromDate, shiftMonthKey } from "@/lib/gestion/format";

export type ExpenseLike = { date: Date; amount: number; spreadMonths: number | null };

/**
 * How much of this expense counts toward `month` on an accrual basis — the
 * figure net profit should use. Not spread (spreadMonths null or <= 1): the
 * full amount, in the expense's own month only, same as before this field
 * existed. Spread: an equal share of the amount across `spreadMonths`
 * consecutive months starting at the expense's own month, so a durable
 * purchase doesn't fully hit the month it was bought in.
 */
export function expenseAccrualForMonth(expense: ExpenseLike, month: string): number {
  const months = expense.spreadMonths && expense.spreadMonths > 1 ? expense.spreadMonths : 1;
  const startMonth = monthKeyFromDate(expense.date);
  if (months === 1) return month === startMonth ? expense.amount : 0;
  const endMonth = shiftMonthKey(startMonth, months - 1);
  return month >= startMonth && month <= endMonth ? expense.amount / months : 0;
}

export type StockTotals = {
  purchased: number;
  used: number;
  remaining: number;
  avgCost: number;
  remainingValue: number;
};

export function stockTotals(
  purchases: { quantity: number; unitCost: number }[],
  usages: { quantity: number }[]
): StockTotals {
  const purchased = purchases.reduce((sum, a) => sum + a.quantity, 0);
  const used = usages.reduce((sum, u) => sum + u.quantity, 0);
  const remaining = purchased - used;
  const totalPurchaseCost = purchases.reduce(
    (sum, a) => sum + a.quantity * a.unitCost,
    0
  );
  const avgCost = purchased > 0 ? totalPurchaseCost / purchased : 0;
  const remainingValue = remaining * avgCost;
  return { purchased, used, remaining, avgCost, remainingValue };
}

export type OrderLineLike = {
  productId: string | null;
  productNameSnapshot: string;
  quantity: number;
  sellPriceSnapshot: number;
  unitCostSnapshot: number;
  sellUnitSnapshot: string;
};

export type OrderLike = {
  id: string;
  date: Date;
  status: "IN_PROGRESS" | "DELIVERED" | "RETURNED";
  paymentStatus: "PAID" | "PENDING" | "UNPAID";
  paymentMethod: "CASH" | "CHECK" | "TRANSFER" | "OTHER";
  checkDueDate: Date | null;
  lines: OrderLineLike[];
};

export function orderAmount(order: OrderLike): number {
  return order.lines.reduce(
    (sum, l) => sum + l.sellPriceSnapshot * l.quantity,
    0
  );
}

/**
 * The month an order's cash actually lands in, for trésorerie purposes.
 * A postdated check (common in Tunisia) doesn't clear on the order date —
 * it clears on its due date. Every other payment method is assumed
 * immediate, same as before this field existed.
 */
export function orderCashDate(order: Pick<OrderLike, "date" | "paymentMethod" | "checkDueDate">): Date {
  if (order.paymentMethod === "CHECK" && order.checkDueDate) return order.checkDueDate;
  return order.date;
}

export type TopProductRow = {
  key: string;
  name: string;
  quantity: number;
  revenue: number;
  sellUnit: string;
};

export type DashboardTotals = {
  revenue: number; // CA (livré)
  cost: number; // coût réel
  expensesTotal: number; // accrual basis — spread expenses count only their monthly share
  netProfit: number; // CA - coût - dépenses (accrual)
  cashFlow: number; // CA cash - achats stock du mois - dépenses (cash, jamais étalées)
  inProgressCount: number;
  returnedCount: number;
  unpaidAmount: number; // livrées avec paymentStatus PENDING ou UNPAID
  topProducts: TopProductRow[];
};

export function computeDashboardTotals(params: {
  ordersInMonth: OrderLike[];
  /** Delivered orders whose cash date (orderCashDate) falls in this month —
   * usually the same orders as ordersInMonth, except a postdated check
   * pushes an order out to its due-date month instead. Used only for
   * cashFlow, never for revenue/cost (those stay on an accrual basis). */
  cashOrdersInMonth: OrderLike[];
  /** Accrual-basis expense total (see expenseAccrualForMonth) — a spread
   * expense contributes only its share of this month. Feeds netProfit. */
  expensesAccrualInMonth: number;
  /** Cash-basis expense total — always the full amount of whatever was
   * actually paid in this month, regardless of spreading, because that's
   * when the money actually left the account. Feeds cashFlow. */
  expensesCashInMonth: number;
  stockPurchasesCostInMonth: number;
}): DashboardTotals {
  const {
    ordersInMonth,
    cashOrdersInMonth,
    expensesAccrualInMonth,
    expensesCashInMonth,
    stockPurchasesCostInMonth,
  } = params;

  const delivered = ordersInMonth.filter((o) => o.status === "DELIVERED");
  const inProgress = ordersInMonth.filter((o) => o.status === "IN_PROGRESS");
  const returned = ordersInMonth.filter((o) => o.status === "RETURNED");

  let revenue = 0;
  let cost = 0;
  let unpaidAmount = 0;
  const byProduct = new Map<string, TopProductRow>();

  for (const order of delivered) {
    const amount = orderAmount(order);
    if (order.paymentStatus === "PENDING" || order.paymentStatus === "UNPAID") {
      unpaidAmount += amount;
    }
    for (const line of order.lines) {
      const lineAmount = line.sellPriceSnapshot * line.quantity;
      const lineCost = line.unitCostSnapshot * line.quantity;
      revenue += lineAmount;
      cost += lineCost;
      const key = line.productId ?? line.productNameSnapshot;
      const row = byProduct.get(key) ?? {
        key,
        name: line.productNameSnapshot,
        quantity: 0,
        revenue: 0,
        sellUnit: line.sellUnitSnapshot,
      };
      row.quantity += line.quantity;
      row.revenue += lineAmount;
      byProduct.set(key, row);
    }
  }

  const cashRevenue = cashOrdersInMonth
    .filter((o) => o.status === "DELIVERED")
    .reduce((sum, o) => sum + orderAmount(o), 0);

  const netProfit = revenue - cost - expensesAccrualInMonth;
  const cashFlow = cashRevenue - stockPurchasesCostInMonth - expensesCashInMonth;

  return {
    revenue,
    cost,
    expensesTotal: expensesAccrualInMonth,
    netProfit,
    cashFlow,
    inProgressCount: inProgress.length,
    returnedCount: returned.length,
    unpaidAmount,
    topProducts: [...byProduct.values()].sort((a, b) => b.quantity - a.quantity),
  };
}

export type CategoryOption = { value: string; label: string };

/**
 * Ranks categories by total spend and keeps only the top `maxShown` as
 * individual series, folding the rest into `fallbackValue` — a category list
 * that grows past a chart's readable series count (dataviz soft cap ~5-6)
 * without either hiding a category actually in use or wasting a line on one
 * that isn't.
 */
export function rankAndFoldCategories(
  categoryOptions: CategoryOption[],
  totalsByCategory: Record<string, number>,
  maxShown: number,
  fallbackValue: string
): { shown: CategoryOption[]; folded: Set<string>; chartCategories: CategoryOption[] } {
  const ranked = categoryOptions
    .filter((o) => o.value !== fallbackValue && (totalsByCategory[o.value] ?? 0) > 0)
    .sort((a, b) => (totalsByCategory[b.value] ?? 0) - (totalsByCategory[a.value] ?? 0));

  const shown = ranked.slice(0, maxShown);
  const folded = new Set(ranked.slice(maxShown).map((o) => o.value));
  const fallbackOption = categoryOptions.find((o) => o.value === fallbackValue);

  return {
    shown,
    folded,
    chartCategories: fallbackOption ? [...shown, fallbackOption] : shown,
  };
}
