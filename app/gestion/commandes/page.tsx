import { getCurrentUser } from "@/lib/current-user";
import { getCurrentBusiness } from "@/lib/current-business";
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
import { ConfirmSubmitButton } from "@/components/gestion/ConfirmSubmitButton";
import { AutoSubmitSelect } from "@/components/gestion/AutoSubmitSelect";
import { EditOrderButton } from "@/components/gestion/EditOrderButton";
import { OrderForm } from "./OrderForm";

const STATUS_OPTIONS = [
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "DELIVERED", label: "Livré" },
  { value: "RETURNED", label: "Retour" },
];
const STATUS_BADGE_CLASS: Record<string, string> = {
  IN_PROGRESS: "in_progress",
  DELIVERED: "delivered",
  RETURNED: "returned",
};

const PAYMENT_OPTIONS = [
  { value: "PENDING", label: "En attente" },
  { value: "PAID", label: "Payé" },
  { value: "UNPAID", label: "Impayé" },
];
const PAYMENT_BADGE_CLASS: Record<string, string> = {
  PAID: "paid",
  PENDING: "pending",
  UNPAID: "unpaid",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Espèces",
  CHECK: "Chèque",
  TRANSFER: "Virement",
  OTHER: "Autre",
};
const PAYMENT_METHOD_FILTER_OPTIONS = [
  { value: "ALL", label: "Tous les moyens de paiement" },
  { value: "CASH", label: "Espèces" },
  { value: "CHECK", label: "Chèque" },
  { value: "TRANSFER", label: "Virement" },
  { value: "OTHER", label: "Autre" },
];

export default async function CommandesPage({
  searchParams,
}: {
  searchParams: Promise<{ method?: string }>;
}) {
  const { method } = await searchParams;
  const user = await getCurrentUser();
  const business = await getCurrentBusiness();
  const [allOrders, products] = await Promise.all([getOrders(business.id), getProducts(business.id)]);
  const isServices = user.activityType === "SERVICES";

  const methodFilter =
    method && method in PAYMENT_METHOD_LABELS ? method : "ALL";
  const orders =
    methodFilter === "ALL" ? allOrders : allOrders.filter((o) => o.paymentMethod === methodFilter);

  return (
    <>
      <div className="g-card">
        <h2>{isServices ? "Nouvelle vente" : "Nouvelle commande"}</h2>
        <div className="g-hint">
          {isServices
            ? "Une vente peut contenir plusieurs prestations différentes — ajoutez une ligne par prestation."
            : "Une commande peut contenir plusieurs parfums différents — ajoutez une ligne par parfum."}
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
          <h2 style={{ margin: 0 }}>{isServices ? "Toutes les ventes" : "Toutes les commandes"}</h2>
          <form method="get">
            <AutoSubmitSelect
              name="method"
              defaultValue={methodFilter}
              options={PAYMENT_METHOD_FILTER_OPTIONS}
              className="g-status-select"
            />
          </form>
        </div>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Client</th>
                <th>{isServices ? "Prestations" : "Produits"}</th>
                <th className="right">Montant</th>
                <th>Statut</th>
                <th>Paiement</th>
                <th>Mode</th>
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
                          options={STATUS_OPTIONS}
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
                          options={PAYMENT_OPTIONS}
                          className={`g-status-select g-badge ${PAYMENT_BADGE_CLASS[order.paymentStatus]}`}
                        />
                      </form>
                    </td>
                    <td>
                      {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                      {order.paymentMethod === "CHECK" && order.checkDueDate && (
                        <div style={{ fontSize: "0.72rem", color: "var(--g-muted)" }}>
                          échéance {order.checkDueDate.toISOString().slice(0, 10)}
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
                          confirmMessage={isServices ? "Supprimer cette vente ?" : "Supprimer cette commande ?"}
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
              ? "Aucune commande pour ce moyen de paiement."
              : isServices
                ? "Aucune vente enregistrée."
                : "Aucune commande enregistrée."}
          </div>
        )}
      </div>
    </>
  );
}
