import { getCurrentUser } from "@/lib/current-user";
import { getFinishedStock, getProductionBatches, getProducts } from "@/lib/gestion/queries";
import { createProductionBatch, deleteProductionBatch } from "@/lib/gestion/actions";
import { todayStr } from "@/lib/gestion/format";
import { ConfirmSubmitButton } from "@/components/gestion/ConfirmSubmitButton";

export default async function ProduitsFinisPage() {
  const user = await getCurrentUser();
  const [products, batches, finishedStock] = await Promise.all([
    getProducts(user.id),
    getProductionBatches(user.id),
    getFinishedStock(user.id),
  ]);

  return (
    <>
      <div className="card">
        <h2>Enregistrer un lot produit</h2>
        <div className="hint">
          À chaque session de production, notez ici ce que vous avez fait — le stock disponible
          se calcule tout seul en comparant à vos commandes livrées.
        </div>
        <form action={createProductionBatch} className="field-grid">
          <div className="field">
            <label>Date</label>
            <input type="date" name="date" defaultValue={todayStr()} required />
          </div>
          <div className="field">
            <label>Produit</label>
            <select name="productId" required>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Quantité produite</label>
            <input type="number" name="quantity" min="1" step="1" required />
          </div>
          <button type="submit" className="btn" disabled={products.length === 0}>
            Ajouter le lot
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Stock disponible par produit</h2>
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th className="right">Produit au total</th>
              <th className="right">Vendu (livré)</th>
              <th className="right">Stock disponible</th>
            </tr>
          </thead>
          <tbody>
            {finishedStock.map(({ product, totalProduced, totalSold, available }) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td className="right num">{totalProduced}</td>
                <td className="right num">{totalSold}</td>
                <td
                  className="right num"
                  style={available <= 0 ? { color: "var(--red)", fontWeight: 700 } : undefined}
                >
                  {available}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="empty">Aucun lot enregistré pour l&apos;instant.</div>
        )}
      </div>

      <div className="card">
        <h2>Historique des lots produits</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Produit</th>
              <th className="right">Quantité</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b.id}>
                <td className="num">{b.date.toISOString().slice(0, 10)}</td>
                <td>{b.product.name}</td>
                <td className="right num">{b.quantity}</td>
                <td>
                  <form action={deleteProductionBatch}>
                    <input type="hidden" name="id" value={b.id} />
                    <ConfirmSubmitButton confirmMessage="Supprimer ce lot ?" />
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {batches.length === 0 && <div className="empty">Aucun lot enregistré.</div>}
      </div>
    </>
  );
}
