import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { getCurrentBusiness } from "@/lib/current-business";
import { getOrCreateSubscription } from "@/lib/subscription";
import { canAccessPalier2 } from "@/lib/subscription-access";
import { getOrders, getPalier1Overview, getProducts, type Palier1HistoryEntry } from "@/lib/gestion/queries";
import { orderAmount } from "@/lib/gestion/calculations";
import {
  createOrder,
  createQuickSale,
  deleteOrder,
  updateOrder,
  updateOrderPaymentStatus,
  updateOrderStatus,
} from "@/lib/gestion/actions";
import { fmt, todayStr } from "@/lib/gestion/format";
import { fmtQty } from "@/lib/gestion/product-units";
import { getServerT } from "@/lib/i18n/server";
import type { TFunction } from "@/lib/i18n/translate";
import { ConfirmSubmitButton } from "@/components/gestion/ConfirmSubmitButton";
import { AutoSubmitSelect } from "@/components/gestion/AutoSubmitSelect";
import { EditOrderButton } from "@/components/gestion/EditOrderButton";
import { Palier1History, type Palier1HistoryEntryView } from "@/components/gestion/Palier1History";
import { OrderForm } from "./OrderForm";

/** Quick sales never carry a receipt, so this mapping is synchronous —
 * unlike Palier1Dashboard's history resolution, which also handles
 * expenses' receiptPath via a signed-URL lookup. */
function toSalesHistory(
  historyByMonth: Record<string, Palier1HistoryEntry[]>
): Record<string, Palier1HistoryEntryView[]> {
  return Object.fromEntries(
    Object.entries(historyByMonth).map(([month, entries]) => [
      month,
      entries
        .filter((e) => e.type === "sale")
        .map((e) => ({ type: e.type, id: e.id, dateIso: e.date.toISOString(), label: e.label, amount: e.amount })),
    ])
  );
}

function statusOptions(t: TFunction) {
  return [
    { value: "IN_PROGRESS", label: t("gestion.commandes.statusInProgress") },
    { value: "DELIVERED", label: t("gestion.commandes.statusDelivered") },
    { value: "RETURNED", label: t("gestion.commandes.statusReturned") },
  ];
}
const STATUS_BADGE_CLASS: Record<string, string> = {
  IN_PROGRESS: "in_progress",
  DELIVERED: "delivered",
  RETURNED: "returned",
};

function paymentOptions(t: TFunction) {
  return [
    { value: "PENDING", label: t("gestion.commandes.paymentPending") },
    { value: "PAID", label: t("gestion.commandes.paymentPaid") },
    { value: "UNPAID", label: t("gestion.commandes.paymentUnpaid") },
  ];
}
const PAYMENT_BADGE_CLASS: Record<string, string> = {
  PAID: "paid",
  PENDING: "pending",
  UNPAID: "unpaid",
};

function paymentMethodLabels(t: TFunction): Record<string, string> {
  return {
    CASH: t("gestion.commandes.methodCash"),
    CHECK: t("gestion.commandes.methodCheck"),
    TRANSFER: t("gestion.commandes.methodTransfer"),
    OTHER: t("gestion.commandes.methodOther"),
  };
}
function paymentMethodFilterOptions(t: TFunction) {
  return [
    { value: "ALL", label: t("gestion.commandes.methodFilterAll") },
    { value: "CASH", label: t("gestion.commandes.methodCash") },
    { value: "CHECK", label: t("gestion.commandes.methodCheck") },
    { value: "TRANSFER", label: t("gestion.commandes.methodTransfer") },
    { value: "OTHER", label: t("gestion.commandes.methodOther") },
  ];
}

export default async function CommandesPage({
  searchParams,
}: {
  searchParams: Promise<{ method?: string }>;
}) {
  const { t } = await getServerT();
  const user = await getCurrentUser();
  const business = await getCurrentBusiness();
  const subscription = await getOrCreateSubscription(user.id);

  if (!canAccessPalier2(subscription)) {
    const overview = await getPalier1Overview(business.id);
    return (
      <>
        <div className="g-card">
          <h2>{t("gestion.palier1.newSaleTitle")}</h2>
          <form action={createQuickSale} className="g-field-grid">
            <div className="g-field">
              <label>{t("gestion.palier1.dateLabel")}</label>
              <input type="date" name="date" defaultValue={todayStr()} required />
            </div>
            <div className="g-field">
              <label>{t("gestion.palier1.amountLabel")}</label>
              <input type="number" name="amount" min="0.01" step="0.01" required />
            </div>
            <button type="submit" className="g-btn">
              <Plus size={15} /> {t("gestion.palier1.registerSale")}
            </button>
          </form>
        </div>
        <Palier1History monthKeys={overview.monthKeys} historyByMonth={toSalesHistory(overview.historyByMonth)} />
      </>
    );
  }

  const { method } = await searchParams;
  const [allOrders, products] = await Promise.all([getOrders(business.id), getProducts(business.id)]);
  const isServices = user.activityType === "SERVICES";
  const methodLabels = paymentMethodLabels(t);

  const methodFilter =
    method && method in methodLabels ? method : "ALL";
  const orders =
    methodFilter === "ALL" ? allOrders : allOrders.filter((o) => o.paymentMethod === methodFilter);

  const now = new Date().getTime();
  const unpaidDelivered = allOrders
    .filter((o) => o.status === "DELIVERED" && o.paymentStatus !== "PAID")
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <>
      <div className="g-card">
        <h2>{isServices ? t("gestion.commandes.newSaleTitle") : t("gestion.commandes.newOrderTitle")}</h2>
        <div className="g-hint">
          {isServices ? t("gestion.commandes.newSaleHint") : t("gestion.commandes.newOrderHint")}
        </div>
        <OrderForm products={products} createOrderAction={createOrder} isServices={isServices} />
      </div>

      <div className="g-card">
        <h2>{t("gestion.commandes.unpaidDeliveredTitle")}</h2>
        <div className="g-hint">{t("gestion.commandes.unpaidDeliveredHint")}</div>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>{t("gestion.editCommon.dateLabel")}</th>
                <th>{t("gestion.commandes.clientColumn")}</th>
                <th className="right">{t("gestion.editCommon.amountLabel")}</th>
                <th className="right">{t("gestion.commandes.daysSinceColumn")}</th>
                <th>{t("gestion.commandes.paymentColumn")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {unpaidDelivered.map((order) => {
                const daysSince = Math.floor((now - order.date.getTime()) / 86_400_000);
                return (
                  <tr key={order.id}>
                    <td className="num">{order.date.toISOString().slice(0, 10)}</td>
                    <td>{order.clientName || "—"}</td>
                    <td className="right num">{fmt(orderAmount(order))}</td>
                    <td className="right num">{daysSince}</td>
                    <td>
                      <span className={`g-badge ${PAYMENT_BADGE_CLASS[order.paymentStatus]}`}>
                        {order.paymentStatus === "PENDING" ? t("gestion.commandes.paymentPending") : t("gestion.commandes.paymentUnpaid")}
                      </span>
                    </td>
                    <td>
                      <form action={updateOrderPaymentStatus}>
                        <input type="hidden" name="id" value={order.id} />
                        <input type="hidden" name="paymentStatus" value="PAID" />
                        <button type="submit" className="g-btn secondary small">
                          {t("gestion.commandes.markPaidButton")}
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {unpaidDelivered.length === 0 && <div className="g-empty">{t("gestion.commandes.unpaidDeliveredEmpty")}</div>}
      </div>

      <div className="g-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <h2 style={{ margin: 0 }}>{isServices ? t("gestion.commandes.allSalesTitle") : t("gestion.commandes.allOrdersTitle")}</h2>
          <form method="get">
            <AutoSubmitSelect
              name="method"
              defaultValue={methodFilter}
              options={paymentMethodFilterOptions(t)}
              className="g-status-select"
            />
          </form>
        </div>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>{t("gestion.editCommon.dateLabel")}</th>
                <th>{t("gestion.commandes.clientColumn")}</th>
                <th>{isServices ? t("gestion.nav.services") : t("gestion.nav.products")}</th>
                <th className="right">{t("gestion.editCommon.amountLabel")}</th>
                <th>{t("gestion.clients.statusLabel")}</th>
                <th>{t("gestion.commandes.paymentColumn")}</th>
                <th>{t("gestion.commandes.methodColumn")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const label = order.lines
                  .map((l) => `${l.productNameSnapshot} ×${fmtQty(l.quantity, l.sellUnitSnapshot)}`)
                  .join(", ");
                return (
                  <tr key={order.id}>
                    <td className="num">{order.date.toISOString().slice(0, 10)}</td>
                    <td>{order.clientName || "—"}</td>
                    <td>{label}</td>
                    <td className="right num">{fmt(orderAmount(order))}</td>
                    <td>
                      <form action={updateOrderStatus}>
                        <input type="hidden" name="id" value={order.id} />
                        <AutoSubmitSelect
                          name="status"
                          defaultValue={order.status}
                          options={statusOptions(t)}
                          className={`g-status-select g-badge ${STATUS_BADGE_CLASS[order.status]}`}
                        />
                      </form>
                    </td>
                    <td>
                      <form action={updateOrderPaymentStatus}>
                        <input type="hidden" name="id" value={order.id} />
                        <AutoSubmitSelect
                          name="paymentStatus"
                          defaultValue={order.paymentStatus}
                          options={paymentOptions(t)}
                          className={`g-status-select g-badge ${PAYMENT_BADGE_CLASS[order.paymentStatus]}`}
                        />
                      </form>
                    </td>
                    <td>
                      {methodLabels[order.paymentMethod]}
                      {order.paymentMethod === "CHECK" && order.checkDueDate && (
                        <div style={{ fontSize: "0.72rem", color: "var(--g-muted)" }}>
                          {t("gestion.commandes.checkDueDate", { date: order.checkDueDate.toISOString().slice(0, 10) })}
                        </div>
                      )}
                    </td>
                    <td style={{ display: "flex", gap: 2 }}>
                      <EditOrderButton
                        order={order}
                        products={products}
                        updateOrderAction={updateOrder}
                        isServices={isServices}
                      />
                      <form action={deleteOrder}>
                        <input type="hidden" name="id" value={order.id} />
                        <ConfirmSubmitButton
                          confirmMessage={isServices ? t("gestion.confirm.deleteSale") : t("gestion.confirm.deleteOrder")}
                          title={t("common.delete")}
                        />
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <div className="g-empty">
            {methodFilter !== "ALL"
              ? t("gestion.commandes.emptyForMethod")
              : isServices
                ? t("gestion.commandes.emptySales")
                : t("gestion.commandes.emptyOrders")}
          </div>
        )}
      </div>
    </>
  );
}
