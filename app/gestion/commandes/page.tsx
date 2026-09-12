import { getCurrentUser } from "@/lib/current-user";
import { getOrders, getProducts } from "@/lib/gestion/queries";
import { orderAmount } from "@/lib/gestion/calculations";
import {
  createOrder,
  deleteOrder,
  updateOrderPaymentStatus,
  updateOrderStatus,
} from "@/lib/gestion/actions";
import { fmt } from "@/lib/gestion/format";
import { ConfirmSubmitButton } from "@/components/gestion/ConfirmSubmitButton";
import { AutoSubmitSelect } from "@/components/gestion/AutoSubmitSelect";
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

export default async function CommandesPage() {
  const user = await getCurrentUser();
  const [orders, products] = await Promise.all([getOrders(user.id), getProducts(user.id)]);
  const isServices = user.activityType === "SERVICES";

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
        <h2>{isServices ? "Toutes les ventes" : "Toutes les commandes"}</h2>
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const label = order.lines
                  .map((l) => `${l.productNameSnapshot} ×${l.quantity}`)
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
            {isServices ? "Aucune vente enregistrée." : "Aucune commande enregistrée."}
          </div>
        )}
      </div>
    </>
  );
}
