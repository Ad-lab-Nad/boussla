import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { getProducts } from "@/lib/gestion/queries";
import { createProduct, deleteProduct } from "@/lib/gestion/actions";
import { fmt } from "@/lib/gestion/format";
import { ConfirmSubmitButton } from "@/components/gestion/ConfirmSubmitButton";

export default async function ProduitsPage() {
  const user = await getCurrentUser();
  const products = await getProducts(user.id);

  return (
    <>
      <div className="g-card">
        <h2>Nouveau produit</h2>
        <div className="g-hint">
          Le coût unitaire vient de votre calculateur de prix (fruit + sucre + pot + étiquette
          + emballage + pub).
        </div>
        <form action={createProduct} className="g-field-grid">
          <div className="g-field">
            <label>Nom</label>
            <input type="text" name="name" placeholder="ex: Confiture Figue" required />
          </div>
          <div className="g-field">
            <label>Prix de vente (DT)</label>
            <input type="number" name="sellPrice" min="0" step="0.01" required />
          </div>
          <div className="g-field">
            <label>Coût unitaire (DT)</label>
            <input type="number" name="unitCost" min="0" step="0.01" required />
          </div>
          <button type="submit" className="g-btn">
            <Plus size={15} /> Ajouter
          </button>
        </form>
      </div>

      <div className="g-card">
        <h2>Catalogue produits</h2>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th className="right">Prix vente</th>
                <th className="right">Coût unitaire</th>
                <th className="right">Marge/unité</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td className="right num">{fmt(p.sellPrice)}</td>
                  <td className="right num">{fmt(p.unitCost)}</td>
                  <td className="right num">{fmt(p.sellPrice - p.unitCost)}</td>
                  <td>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <ConfirmSubmitButton confirmMessage="Supprimer ce produit ?" />
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && <div className="g-empty">Aucun produit enregistré.</div>}
      </div>
    </>
  );
}
