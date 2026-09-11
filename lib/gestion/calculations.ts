// Pure calculation helpers for the Gestion module — no I/O, so they mirror
// the original prototype's math 1:1 and stay easy to unit test.

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
};

export type OrderLike = {
  id: string;
  date: Date;
  status: "IN_PROGRESS" | "DELIVERED" | "RETURNED";
  paymentStatus: "PAID" | "PENDING" | "UNPAID";
  lines: OrderLineLike[];
};

export function orderAmount(order: OrderLike): number {
  return order.lines.reduce(
    (sum, l) => sum + l.sellPriceSnapshot * l.quantity,
    0
  );
}

export type TopProductRow = { key: string; name: string; quantity: number; revenue: number };

export type DashboardTotals = {
  revenue: number; // CA (livré)
  cost: number; // coût réel
  expensesTotal: number;
  netProfit: number; // CA - coût - dépenses
  cashFlow: number; // CA - achats stock du mois - dépenses
  inProgressCount: number;
  returnedCount: number;
  unpaidAmount: number; // livrées avec paymentStatus PENDING ou UNPAID
  topProducts: TopProductRow[];
};

export function computeDashboardTotals(params: {
  ordersInMonth: OrderLike[];
  expensesInMonth: number;
  stockPurchasesCostInMonth: number;
}): DashboardTotals {
  const { ordersInMonth, expensesInMonth, stockPurchasesCostInMonth } = params;

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
      };
      row.quantity += line.quantity;
      row.revenue += lineAmount;
      byProduct.set(key, row);
    }
  }

  const netProfit = revenue - cost - expensesInMonth;
  const cashFlow = revenue - stockPurchasesCostInMonth - expensesInMonth;

  return {
    revenue,
    cost,
    expensesTotal: expensesInMonth,
    netProfit,
    cashFlow,
    inProgressCount: inProgress.length,
    returnedCount: returned.length,
    unpaidAmount,
    topProducts: [...byProduct.values()].sort((a, b) => b.quantity - a.quantity),
  };
}
