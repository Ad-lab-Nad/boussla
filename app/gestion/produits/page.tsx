import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { getCurrentBusiness } from "@/lib/current-business";
import { getProducts } from "@/lib/gestion/queries";
import { createProduct, deleteProduct, updateProduct } from "@/lib/gestion/actions";
import { SELL_UNIT_LABELS, SELL_UNIT_OPTIONS, fmtPrice } from "@/lib/gestion/product-units";
import { ConfirmSubmitButton } from "@/components/gestion/ConfirmSubmitButton";
import { ImportProductsButton } from "@/components/gestion/ImportProductsButton";
import { EditProductButton } from "@/components/gestion/EditProductButton";

export default async function ProduitsPage() {
  const user = await getCurrentUser();
  const business = await getCurrentBusiness();
  const products = await getProducts(business.id);
  const isServices = user.activityType === "SERVICES";
  const deleteConfirmMessage = isServices
    ? "Supprimer cette prestation ?"
    : "Supprimer ce produit ?";

  return (
    <>
      <div className="g-card">
        <h2>{isServices ? "Nouvelle prestation" : "Nouveau produit"}</h2>
        <div className="g-hint">
          {isServices
            ? "Le coût unitaire correspond au coût de revient de votre prestation (temps, matériel, sous-traitance...)."
            : "Le coût unitaire vient de votre calculateur de prix (fruit + sucre + pot + étiquette + emballage + pub)."}
        </div>
        <form action={createProduct} className="g-field-grid">
          <div className="g-field">
            <label>Nom</label>
            <input
              type="text"
              name="name"
              placeholder={isServices ? "ex: Consultation 1h" : "ex: Confiture Figue"}
              required
            />
          </div>
          <div className="g-field">
            <label>Prix de vente (DT)</label>
            <input type="number" name="sellPrice" min="0" step="0.01" required />
          </div>
          <div className="g-field">
            <label>Coût unitaire (DT)</label>
            <input type="number" name="unitCost" min="0" step="0.01" required />
          </div>
          {!isServices && (
            <div className="g-field">
              <label>Unité de vente</label>
              <select name="sellUnit" defaultValue="PIECE">
                {SELL_UNIT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button type="submit" className="g-btn">
            <Plus size={15} /> Ajouter
          </button>
        </form>
      </div>

      <div className="g-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <h2 style={{ margin: 0 }}>{isServices ? "Catalogue prestations" : "Catalogue produits"}</h2>
          <ImportProductsButton />
        </div>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>{isServices ? "Prestation" : "Produit"}</th>
                {!isServices && <th>Unité</th>}
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
                  {!isServices && <td>{SELL_UNIT_LABELS[p.sellUnit]}</td>}
                  <td className="right num">{fmtPrice(p.sellPrice, p.sellUnit)}</td>
                  <td className="right num">{fmtPrice(p.unitCost, p.sellUnit)}</td>
                  <td className="right num">{fmtPrice(p.sellPrice - p.unitCost, p.sellUnit)}</td>
                  <td style={{ display: "flex", gap: 2 }}>
                    <EditProductButton
                      product={p}
                      updateProductAction={updateProduct}
                      isServices={isServices}
                    />
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <ConfirmSubmitButton confirmMessage={deleteConfirmMessage} />
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="g-empty">
            {isServices ? "Aucune prestation enregistrée." : "Aucun produit enregistré."}
          </div>
        )}
      </div>
    </>
  );
}
