"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, X } from "lucide-react";
import { fmt } from "@/lib/gestion/format";

type Product = { id: string; name: string; sellPrice: number; unitCost: number };
type OrderLine = { productId: string | null; quantity: number };
type Order = {
  id: string;
  date: Date;
  clientName: string | null;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  checkDueDate: Date | null;
  lines: OrderLine[];
};
type Line = { id: string; productId: string; quantity: number };

function toLines(order: Order, products: Product[]): Line[] {
  const fallbackId = products[0]?.id ?? "";
  return order.lines.length > 0
    ? order.lines.map((l) => ({
        id: Math.random().toString(36).slice(2),
        productId: l.productId ?? fallbackId,
        quantity: l.quantity,
      }))
    : [{ id: Math.random().toString(36).slice(2), productId: fallbackId, quantity: 1 }];
}

export function EditOrderButton({
  order,
  products,
  updateOrderAction,
  isServices = false,
}: {
  order: Order;
  products: Product[];
  updateOrderAction: (formData: FormData) => Promise<void>;
  isServices?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>(() => toLines(order, products));
  const [paymentMethod, setPaymentMethod] = useState(order.paymentMethod);

  function closeModal() {
    setOpen(false);
    setError(null);
  }

  function openModal() {
    setLines(toLines(order, products));
    setPaymentMethod(order.paymentMethod);
    setOpen(true);
  }

  async function handleSubmit(formData: FormData) {
    formData.set("linesJson", JSON.stringify(lines));
    setSubmitting(true);
    setError(null);
    try {
      await updateOrderAction(formData);
      setOpen(false);
      router.refresh();
    } catch {
      setError(
        isServices
          ? "Impossible d'enregistrer cette vente. Réessaie."
          : "Impossible d'enregistrer cette commande. Réessaie."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const total = lines.reduce((sum, l) => {
    const product = products.find((p) => p.id === l.productId);
    return sum + (product ? product.sellPrice * (l.quantity || 0) : 0);
  }, 0);

  return (
    <>
      <button type="button" className="g-del-btn" title="Modifier" onClick={openModal}>
        <Pencil size={15} />
      </button>

      {open && (
        <div className="g-modal-overlay" onClick={closeModal}>
          <div className="g-modal" onClick={(e) => e.stopPropagation()}>
            <div className="g-modal__header">
              <h2>{isServices ? "Modifier la vente" : "Modifier la commande"}</h2>
              <button type="button" className="g-modal__close" onClick={closeModal} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>

            <form action={handleSubmit}>
              <div className="g-modal__body">
                <input type="hidden" name="id" value={order.id} />
                <div className="g-field-grid">
                  <div className="g-field">
                    <label>Date</label>
                    <input
                      type="date"
                      name="date"
                      defaultValue={order.date.toISOString().slice(0, 10)}
                      required
                    />
                  </div>
                  <div className="g-field">
                    <label>Client (optionnel)</label>
                    <input type="text" name="clientName" defaultValue={order.clientName ?? ""} />
                  </div>
                  <div className="g-field">
                    <label>Statut</label>
                    <select name="status" defaultValue={order.status}>
                      <option value="IN_PROGRESS">En cours</option>
                      <option value="DELIVERED">Livré</option>
                      <option value="RETURNED">Retour</option>
                    </select>
                  </div>
                  <div className="g-field">
                    <label>Paiement</label>
                    <select name="paymentStatus" defaultValue={order.paymentStatus}>
                      <option value="PENDING">En attente</option>
                      <option value="PAID">Payé</option>
                      <option value="UNPAID">Impayé</option>
                    </select>
                  </div>
                  <div className="g-field">
                    <label>Moyen de paiement</label>
                    <select
                      name="paymentMethod"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="CASH">Espèces</option>
                      <option value="CHECK">Chèque</option>
                      <option value="TRANSFER">Virement</option>
                      <option value="OTHER">Autre</option>
                    </select>
                  </div>
                  {paymentMethod === "CHECK" && (
                    <div className="g-field">
                      <label>Date d&apos;échéance (optionnel)</label>
                      <input
                        type="date"
                        name="checkDueDate"
                        defaultValue={order.checkDueDate ? order.checkDueDate.toISOString().slice(0, 10) : ""}
                      />
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 16 }}>
                  <div className="g-line-header">
                    <label>{isServices ? "Prestation" : "Parfum / produit"}</label>
                    <label>Quantité</label>
                    <span></span>
                  </div>

                  {lines.map((line) => (
                    <div className="g-line-row" key={line.id}>
                      <select
                        value={line.productId}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((l) =>
                              l.id === line.id ? { ...l, productId: e.target.value } : l
                            )
                          )
                        }
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={line.quantity}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((l) =>
                              l.id === line.id
                                ? { ...l, quantity: parseInt(e.target.value, 10) || 0 }
                                : l
                            )
                          )
                        }
                      />
                      <button
                        type="button"
                        className="g-del-btn"
                        title="Retirer"
                        disabled={lines.length <= 1}
                        onClick={() => setLines((prev) => prev.filter((l) => l.id !== line.id))}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="g-btn secondary small"
                    style={{ marginTop: 8 }}
                    onClick={() =>
                      setLines((prev) => [
                        ...prev,
                        {
                          id: Math.random().toString(36).slice(2),
                          productId: products[0]?.id ?? "",
                          quantity: 1,
                        },
                      ])
                    }
                  >
                    <Plus size={13} /> {isServices ? "Ajouter une prestation" : "Ajouter un parfum"}
                  </button>
                </div>

                <div
                  style={{
                    marginTop: 16,
                    fontSize: "0.85rem",
                    color: "var(--g-muted)",
                  }}
                >
                  {isServices ? "Total vente" : "Total commande"} :{" "}
                  <strong className="num">{fmt(total)}</strong>
                </div>

                <div className="g-hint" style={{ marginTop: 12, marginBottom: 0 }}>
                  Les prix et coûts des lignes sont repris depuis le catalogue au moment de
                  l&apos;enregistrement — les autres commandes ne sont pas affectées.
                </div>
                {error && (
                  <div className="g-auth-error" style={{ marginTop: 12 }}>
                    {error}
                  </div>
                )}
              </div>
              <div className="g-modal__footer">
                <button type="button" className="g-btn secondary" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="g-btn" disabled={submitting}>
                  {submitting ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
