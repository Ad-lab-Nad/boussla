"use client";

import { useState } from "react";
import { fmt, todayStr } from "@/lib/gestion/format";

type Product = { id: string; name: string; sellPrice: number; unitCost: number };
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
}: {
  products: Product[];
  createOrderAction: (formData: FormData) => Promise<void>;
}) {
  const [lines, setLines] = useState<Line[]>(() =>
    products.length > 0 ? [newLine(products)] : []
  );

  const total = lines.reduce((sum, l) => {
    const product = products.find((p) => p.id === l.productId);
    return sum + (product ? product.sellPrice * (l.quantity || 0) : 0);
  }, 0);

  if (products.length === 0) {
    return (
      <div className="hint">
        Créez d&apos;abord un produit dans l&apos;onglet Produits.
      </div>
    );
  }

  return (
    <form
      action={async (formData) => {
        formData.set("linesJson", JSON.stringify(lines));
        await createOrderAction(formData);
        setLines([newLine(products)]);
      }}
    >
      <div className="field-grid">
        <div className="field">
          <label>Date</label>
          <input type="date" name="date" defaultValue={todayStr()} required />
        </div>
        <div className="field">
          <label>Client (optionnel)</label>
          <input type="text" name="clientName" placeholder="Nom" />
        </div>
        <div className="field">
          <label>Statut</label>
          <select name="status" defaultValue="IN_PROGRESS">
            <option value="IN_PROGRESS">En cours</option>
            <option value="DELIVERED">Livré</option>
            <option value="RETURNED">Retour</option>
          </select>
        </div>
        <div className="field">
          <label>Paiement</label>
          <select name="paymentStatus" defaultValue="PENDING">
            <option value="PENDING">En attente</option>
            <option value="PAID">Payé</option>
            <option value="UNPAID">Impayé</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="cmd-lines-header">
          <label
            style={{
              fontSize: "0.68rem",
              fontWeight: 600,
              color: "var(--ink-soft)",
              textTransform: "uppercase",
            }}
          >
            Parfum / produit
          </label>
          <label
            style={{
              fontSize: "0.68rem",
              fontWeight: 600,
              color: "var(--ink-soft)",
              textTransform: "uppercase",
            }}
          >
            Quantité
          </label>
          <span></span>
        </div>

        {lines.map((line) => (
          <div className="cmd-line-row" key={line.id}>
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
              className="del-btn"
              title="Retirer"
              disabled={lines.length <= 1}
              onClick={() => setLines((prev) => prev.filter((l) => l.id !== line.id))}
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          className="btn secondary small"
          style={{ marginTop: 8 }}
          onClick={() => setLines((prev) => [...prev, newLine(products)])}
        >
          + Ajouter un parfum
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
        <span style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>
          Total commande : <strong className="num">{fmt(total)}</strong>
        </span>
        <button type="submit" className="btn">
          Enregistrer la commande
        </button>
      </div>
    </form>
  );
}
