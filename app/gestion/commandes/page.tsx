import { getCurrentUser } from "@/lib/current-user";
import { getCurrentBusiness } from "@/lib/current-business";
import { requirePalier2Page } from "@/lib/subscription-access";
import { getOrders, getProducts } from "@/lib/gestion/queries";
import { orderAmount } from "@/lib/gestion/calculations";
import {
  createOrder,
  deleteOrder,
  updateOrder,
  updateOrderPaymentStatus,
  updateOrderStatus,
} from "@/lib/gestion/actions";
import { fmt } from "@/lib/gestion/format";
import { fmtQty } from "@/lib/gestion/product-units";
import { getServerT } from "@/lib/i18n/server";
import type { TFunction } from "@/lib/i18n/translate";
import { ConfirmSubmitButton } from "@/components/gestion/ConfirmSubmitButton";
import { AutoSubmitSelect } from "@/components/gestion/AutoSubmitSelect";
import { EditOrderButton } from "@/components/gestion/EditOrderButton";
import { OrderForm } from "./OrderForm";

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
  await requirePalier2Page();
  const { t } = await getServerT();
  const { method } = await searchParams;
  const user = await getCurrentUser();
  const business = await getCurrentBusiness();
  const [allOrders, products] = await Promise.all([getOrders(business.id), getProducts(business.id)]);
  const isServices = user.activityType === "SERVICES";
  const methodLabels = paymentMethodLabels(t);

  const methodFilter =
    method && method in methodLabels ? method : "ALL";
  const orders =
    methodFilter === "ALL" ? allOrders : allOrders.filter((o) => o.paymentMethod === methodFilter);

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
