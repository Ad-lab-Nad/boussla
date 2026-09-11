import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { getStockItems } from "@/lib/gestion/queries";
import {
  createStockItem,
  createStockPurchase,
  createStockUsage,
  deleteStockItem,
} from "@/lib/gestion/actions";
import { fmt, fmtNumber, todayStr } from "@/lib/gestion/format";
import { ConfirmSubmitButton } from "@/components/gestion/ConfirmSubmitButton";

export default async function StockPage() {
  const user = await getCurrentUser();
  const stockItems = await getStockItems(user.id);

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
                    <td>
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
    </>
  );
}
