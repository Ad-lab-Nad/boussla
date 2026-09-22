"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { fmt, todayStr } from "@/lib/gestion/format";
import { fmtPrice } from "@/lib/gestion/product-units";
import { useLocale } from "@/components/i18n/LocaleProvider";

type Product = { id: string; name: string; sellPrice: number; unitCost: number; sellUnit: string };
type Line = { id: string; productId: string; quantity: number };

function newLine(products: Product[]): Line {
  return {
    id: Math.random().toString(36).slice(2),
    productId: products[0]?.id ?? "",
    quantity: 1,
  };
}

export function OrderForm({
  products,
  createOrderAction,
  isServices = false,
}: {
  products: Product[];
  createOrderAction: (formData: FormData) => Promise<void>;
  isServices?: boolean;
}) {
  const { t } = useLocale();
  const [lines, setLines] = useState<Line[]>(() =>
    products.length > 0 ? [newLine(products)] : []
  );
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const total = lines.reduce((sum, l) => {
    const product = products.find((p) => p.id === l.productId);
    return sum + (product ? product.sellPrice * (l.quantity || 0) : 0);
  }, 0);

  if (products.length === 0) {
    return (
      <div className="g-hint">
        {isServices ? t("gestion.commandes.emptyCatalogServices") : t("gestion.commandes.emptyCatalogProducts")}
      </div>
    );
  }

  return (
    <form
      action={async (formData) => {
        formData.set("linesJson", JSON.stringify(lines));
        await createOrderAction(formData);
        setLines([newLine(products)]);
        setPaymentMethod("CASH");
      }}
    >
      <div className="g-field-grid">
        <div className="g-field">
          <label>{t("gestion.editCommon.dateLabel")}</label>
          <input type="date" name="date" defaultValue={todayStr()} required />
        </div>
        <div className="g-field">
          <label>{t("gestion.commandes.clientOptionalLabel")}</label>
          <input type="text" name="clientName" placeholder={t("gestion.commandes.namePlaceholder")} />
        </div>
        <div className="g-field">
          <label>{t("gestion.clients.statusLabel")}</label>
          <select name="status" defaultValue="IN_PROGRESS">
            <option value="IN_PROGRESS">{t("gestion.commandes.statusInProgress")}</option>
            <option value="DELIVERED">{t("gestion.commandes.statusDelivered")}</option>
            <option value="RETURNED">{t("gestion.commandes.statusReturned")}</option>
          </select>
        </div>
        <div className="g-field">
          <label>{t("gestion.commandes.paymentColumn")}</label>
          <select name="paymentStatus" defaultValue="PENDING">
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
            <input type="date" name="checkDueDate" />
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
          onClick={() => setLines((prev) => [...prev, newLine(products)])}
        >
          <Plus size={13} /> {isServices ? t("gestion.commandes.addServiceLine") : t("gestion.commandes.addProductLine")}
        </button>
      </div>

      <div
        style={{
          marginTop: 18,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "0.85rem", color: "var(--g-muted)" }}>
          {isServices ? t("gestion.commandes.totalSale") : t("gestion.commandes.totalOrder")} :{" "}
          <strong className="num">{fmt(total)}</strong>
        </span>
        <button type="submit" className="g-btn">
          {isServices ? t("gestion.commandes.registerSale") : t("gestion.commandes.registerOrder")}
        </button>
      </div>
    </form>
  );
}
