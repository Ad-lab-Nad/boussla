"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { fmt, todayStr } from "@/lib/gestion/format";
import { fmtPrice } from "@/lib/gestion/product-units";

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
        {isServices
          ? "Créez d'abord une prestation dans l'onglet Prestations."
          : "Créez d'abord un produit dans l'onglet Produits."}
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
          <label>Date</label>
          <input type="date" name="date" defaultValue={todayStr()} required />
        </div>
        <div className="g-field">
          <label>Client (optionnel)</label>
          <input type="text" name="clientName" placeholder="Nom" />
        </div>
        <div className="g-field">
          <label>Statut</label>
          <select name="status" defaultValue="IN_PROGRESS">
            <option value="IN_PROGRESS">En cours</option>
            <option value="DELIVERED">Livré</option>
            <option value="RETURNED">Retour</option>
          </select>
        </div>
        <div className="g-field">
          <label>Paiement</label>
          <select name="paymentStatus" defaultValue="PENDING">
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
            <input type="date" name="checkDueDate" />
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
          onClick={() => setLines((prev) => [...prev, newLine(products)])}
        >
          <Plus size={13} /> {isServices ? "Ajouter une prestation" : "Ajouter un parfum"}
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
          {isServices ? "Total vente" : "Total commande"} :{" "}
          <strong className="num">{fmt(total)}</strong>
        </span>
        <button type="submit" className="g-btn">
          {isServices ? "Enregistrer la vente" : "Enregistrer la commande"}
        </button>
      </div>
    </form>
  );
}
