import { Plus } from "lucide-react";
import { getCurrentBusiness } from "@/lib/current-business";
import { getStockItems, getStockPurchases, getStockUsages } from "@/lib/gestion/queries";
import {
  createStockItem,
  createStockPurchase,
  createStockUsage,
  deleteStockItem,
  deleteStockPurchase,
  deleteStockUsage,
  updateStockItem,
  updateStockPurchase,
  updateStockUsage,
} from "@/lib/gestion/actions";
import { fmt, fmtNumber, todayStr } from "@/lib/gestion/format";
import { ConfirmSubmitButton } from "@/components/gestion/ConfirmSubmitButton";
import { EditStockItemButton } from "@/components/gestion/EditStockItemButton";
import { EditStockPurchaseButton } from "@/components/gestion/EditStockPurchaseButton";
import { EditStockUsageButton } from "@/components/gestion/EditStockUsageButton";

export default async function StockPage() {
  const business = await getCurrentBusiness();
  const [stockItems, purchases, usages] = await Promise.all([
    getStockItems(business.id),
    getStockPurchases(business.id),
    getStockUsages(business.id),
  ]);

  return (
    <>
      <div className="g-card">
        <h2>Nouvelle matière / fourniture</h2>
        <div className="g-hint">
          Ex : Pots en verre, Étiquettes, Sacs carton, Figue fraîche...
        </div>
        <form action={createStockItem} className="g-field-grid">
          <div className="g-field">
            <label>Nom</label>
            <input type="text" name="name" placeholder="ex: Étiquettes" required />
          </div>
          <div className="g-field">
            <label>Unité</label>
            <input type="text" name="unit" placeholder="ex: unité, kg" defaultValue="unité" />
          </div>
          <div className="g-field">
            <label>Seuil d&apos;alerte</label>
            <input type="number" name="alertThreshold" min="0" step="1" defaultValue={10} />
          </div>
          <button type="submit" className="g-btn">
            <Plus size={15} /> Créer
          </button>
        </form>
      </div>

      <div className="g-card">
        <h2>Enregistrer un achat de stock</h2>
        <form action={createStockPurchase} className="g-field-grid">
          <div className="g-field">
            <label>Date</label>
            <input type="date" name="date" defaultValue={todayStr()} required />
          </div>
          <div className="g-field">
            <label>Matière</label>
            <select name="stockItemId" required>
              {stockItems.map(({ item }) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="g-field">
            <label>Quantité achetée</label>
            <input type="number" name="quantity" min="0" step="0.01" required />
          </div>
          <div className="g-field">
            <label>Coût unitaire (DT)</label>
            <input type="number" name="unitCost" min="0" step="0.01" required />
          </div>
          <button type="submit" className="g-btn" disabled={stockItems.length === 0}>
            <Plus size={15} /> Enregistrer l&apos;achat
          </button>
        </form>
      </div>

      <div className="g-card">
        <h2>Enregistrer une utilisation</h2>
        <form action={createStockUsage} className="g-field-grid">
          <div className="g-field">
            <label>Date</label>
            <input type="date" name="date" defaultValue={todayStr()} required />
          </div>
          <div className="g-field">
            <label>Matière</label>
            <select name="stockItemId" required>
              {stockItems.map(({ item }) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="g-field">
            <label>Quantité utilisée</label>
            <input type="number" name="quantity" min="0" step="0.01" required />
          </div>
          <button
            type="submit"
            className="g-btn secondary"
            disabled={stockItems.length === 0}
          >
            Enregistrer l&apos;utilisation
          </button>
        </form>
      </div>

      <div className="g-card">
        <h2>État du stock</h2>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>Matière</th>
                <th className="right">Achetée</th>
                <th className="right">Utilisée</th>
                <th className="right">Restante</th>
                <th className="right">Valeur restante</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {stockItems.map(({ item, totals }) => {
                const lowStock = totals.remaining <= (item.alertThreshold || 0);
                return (
                  <tr key={item.id}>
                    <td>
                      {item.name}{" "}
                      <span style={{ color: "var(--g-muted)", fontSize: "0.75rem" }}>
                        ({item.unit})
                      </span>
                    </td>
                    <td className="right num">{fmtNumber(totals.purchased)}</td>
                    <td className="right num">{fmtNumber(totals.used)}</td>
                    <td
                      className="right num"
                      style={lowStock ? { color: "var(--g-critical)", fontWeight: 700 } : undefined}
                    >
                      {fmtNumber(totals.remaining)}
                    </td>
                    <td className="right num">{fmt(totals.remainingValue)}</td>
                    <td style={{ display: "flex", gap: 2 }}>
                      <EditStockItemButton item={item} updateStockItemAction={updateStockItem} />
                      <form action={deleteStockItem}>
                        <input type="hidden" name="id" value={item.id} />
                        <ConfirmSubmitButton confirmMessage="Supprimer cette matière et son historique ?" />
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {stockItems.length === 0 && <div className="g-empty">Aucune matière enregistrée.</div>}
      </div>

      <div className="g-card">
        <h2>Historique des achats</h2>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Matière</th>
                <th className="right">Quantité</th>
                <th className="right">Coût unitaire</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id}>
                  <td className="num">{p.date.toISOString().slice(0, 10)}</td>
                  <td>{p.stockItem.name}</td>
                  <td className="right num">{fmtNumber(p.quantity)}</td>
                  <td className="right num">{fmt(p.unitCost)}</td>
                  <td style={{ display: "flex", gap: 2 }}>
                    <EditStockPurchaseButton purchase={p} updateStockPurchaseAction={updateStockPurchase} />
                    <form action={deleteStockPurchase}>
                      <input type="hidden" name="id" value={p.id} />
                      <ConfirmSubmitButton confirmMessage="Supprimer cet achat ?" />
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {purchases.length === 0 && <div className="g-empty">Aucun achat enregistré.</div>}
      </div>

      <div className="g-card">
        <h2>Historique des utilisations</h2>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Matière</th>
                <th className="right">Quantité</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {usages.map((u) => (
                <tr key={u.id}>
                  <td className="num">{u.date.toISOString().slice(0, 10)}</td>
                  <td>{u.stockItem.name}</td>
                  <td className="right num">{fmtNumber(u.quantity)}</td>
                  <td style={{ display: "flex", gap: 2 }}>
                    <EditStockUsageButton usage={u} updateStockUsageAction={updateStockUsage} />
                    <form action={deleteStockUsage}>
                      <input type="hidden" name="id" value={u.id} />
                      <ConfirmSubmitButton confirmMessage="Supprimer cette utilisation ?" />
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {usages.length === 0 && <div className="g-empty">Aucune utilisation enregistrée.</div>}
      </div>
    </>
  );
}
