"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, X } from "lucide-react";
import { fmt } from "@/lib/gestion/format";
import { fmtPrice } from "@/lib/gestion/product-units";
import { useLocale } from "@/components/i18n/LocaleProvider";

type Product = { id: string; name: string; sellPrice: number; unitCost: number; sellUnit: string };
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
  const { t } = useLocale();
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
      setError(isServices ? t("gestion.commandes.saveSaleError") : t("gestion.commandes.saveOrderError"));
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
      <button type="button" className="g-del-btn" title={t("gestion.editCommon.edit")} onClick={openModal}>
        <Pencil size={15} />
      </button>

      {open && (
        <div className="g-modal-overlay" onClick={closeModal}>
          <div className="g-modal" onClick={(e) => e.stopPropagation()}>
            <div className="g-modal__header">
              <h2>{isServices ? t("gestion.commandes.editSaleTitle") : t("gestion.commandes.editOrderTitle")}</h2>
              <button type="button" className="g-modal__close" onClick={closeModal} aria-label={t("gestion.editCommon.close")}>
                <X size={18} />
              </button>
            </div>

            <form action={handleSubmit}>
              <div className="g-modal__body">
                <input type="hidden" name="id" value={order.id} />
                <div className="g-field-grid">
                  <div className="g-field">
                    <label>{t("gestion.editCommon.dateLabel")}</label>
                    <input
                      type="date"
                      name="date"
                      defaultValue={order.date.toISOString().slice(0, 10)}
                      required
                    />
                  </div>
                  <div className="g-field">
                    <label>{t("gestion.commandes.clientOptionalLabel")}</label>
                    <input type="text" name="clientName" defaultValue={order.clientName ?? ""} />
                  </div>
                  <div className="g-field">
                    <label>{t("gestion.clients.statusLabel")}</label>
                    <select name="status" defaultValue={order.status}>
                      <option value="IN_PROGRESS">{t("gestion.commandes.statusInProgress")}</option>
                      <option value="DELIVERED">{t("gestion.commandes.statusDelivered")}</option>
                      <option value="RETURNED">{t("gestion.commandes.statusReturned")}</option>
                    </select>
                  </div>
                  <div className="g-field">
                    <label>{t("gestion.commandes.paymentColumn")}</label>
                    <select name="paymentStatus" defaultValue={order.paymentStatus}>
                      <option value="PENDING">{t("gestion.commandes.paymentPending")}</option>
                      <option value="PAID">{t("gestion.commandes.paymentPaid")}</option>
                      <option value="UNPAID">{t("gestion.commandes.paymentUnpaid")}</option>
                    </select>
                  </div>
                  <div className="g-field">
                    <label>{t("gestion.commandes.methodColumn")}</label>
                    <select
                      name="paymentMethod"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="CASH">{t("gestion.commandes.methodCash")}</option>
                      <option value="CHECK">{t("gestion.commandes.methodCheck")}</option>
                      <option value="TRANSFER">{t("gestion.commandes.methodTransfer")}</option>
                      <option value="OTHER">{t("gestion.commandes.methodOther")}</option>
                    </select>
                  </div>
                  {paymentMethod === "CHECK" && (
                    <div className="g-field">
                      <label>{t("gestion.commandes.checkDueDateOptionalLabel")}</label>
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
                    <label>{isServices ? t("gestion.commandes.lineServiceLabel") : t("gestion.commandes.lineProductLabel")}</label>
                    <label>{t("gestion.commandes.quantityLabel")}</label>
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
                            {p.name} — {fmtPrice(p.sellPrice, p.sellUnit)}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="0.001"
                        step="any"
                        value={line.quantity}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((l) =>
                              l.id === line.id
                                ? { ...l, quantity: parseFloat(e.target.value) || 0 }
                                : l
                            )
                          )
                        }
                      />
                      <button
                        type="button"
                        className="g-del-btn"
                        title={t("gestion.commandes.removeLine")}
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
                    <Plus size={13} /> {isServices ? t("gestion.commandes.addServiceLine") : t("gestion.commandes.addProductLine")}
                  </button>
                </div>

                <div
                  style={{
                    marginTop: 16,
                    fontSize: "0.85rem",
                    color: "var(--g-muted)",
                  }}
                >
                  {isServices ? t("gestion.commandes.totalSale") : t("gestion.commandes.totalOrder")} :{" "}
                  <strong className="num">{fmt(total)}</strong>
                </div>

                <div className="g-hint" style={{ marginTop: 12, marginBottom: 0 }}>
                  {t("gestion.commandes.editSnapshotHint")}
                </div>
                {error && (
                  <div className="g-auth-error" style={{ marginTop: 12 }}>
                    {error}
                  </div>
                )}
              </div>
              <div className="g-modal__footer">
                <button type="button" className="g-btn secondary" onClick={closeModal}>
                  {t("gestion.editCommon.cancel")}
                </button>
                <button type="submit" className="g-btn" disabled={submitting}>
                  {submitting ? t("gestion.editCommon.saving") : t("gestion.editCommon.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
