import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { getCurrentBusiness } from "@/lib/current-business";
import { requirePalier2Page } from "@/lib/subscription-access";
import { getProducts } from "@/lib/gestion/queries";
import { createProduct, deleteProduct, updateProduct } from "@/lib/gestion/actions";
import { sellUnitLabels, sellUnitOptions, fmtPrice } from "@/lib/gestion/product-units";
import { getServerT } from "@/lib/i18n/server";
import { ConfirmSubmitButton } from "@/components/gestion/ConfirmSubmitButton";
import { ImportProductsButton } from "@/components/gestion/ImportProductsButton";
import { EditProductButton } from "@/components/gestion/EditProductButton";

export default async function ProduitsPage() {
  await requirePalier2Page();
  const { t } = await getServerT();
  const user = await getCurrentUser();
  const business = await getCurrentBusiness();
  const products = await getProducts(business.id);
  const isServices = user.activityType === "SERVICES";
  const deleteConfirmMessage = isServices
    ? t("gestion.confirm.deleteService")
    : t("gestion.confirm.deleteProduct");
  const unitLabels = sellUnitLabels(t);

  return (
    <>
      <div className="g-card">
        <h2>{isServices ? t("gestion.produits.newServiceTitle") : t("gestion.produits.newProductTitle")}</h2>
        <div className="g-hint">
          {isServices ? t("gestion.produits.newServiceHint") : t("gestion.produits.newProductHint")}
        </div>
        <form action={createProduct} className="g-field-grid">
          <div className="g-field">
            <label>{t("gestion.clients.nameLabel")}</label>
            <input
              type="text"
              name="name"
              placeholder={isServices ? t("gestion.produits.namePlaceholderServices") : t("gestion.produits.namePlaceholder")}
              required
            />
          </div>
          <div className="g-field">
            <label>{t("gestion.produits.sellPriceLabel")}</label>
            <input type="number" name="sellPrice" min="0" step="0.01" required />
          </div>
          <div className="g-field">
            <label>{t("gestion.editCommon.unitCostLabel")}</label>
            <input type="number" name="unitCost" min="0" step="0.01" required />
          </div>
          {!isServices && (
            <div className="g-field">
              <label>{t("gestion.produits.sellUnitLabel")}</label>
              <select name="sellUnit" defaultValue="PIECE">
                {sellUnitOptions(t).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button type="submit" className="g-btn">
            <Plus size={15} /> {t("common.add")}
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
          <h2 style={{ margin: 0 }}>{isServices ? t("gestion.produits.catalogServicesTitle") : t("gestion.produits.catalogProductsTitle")}</h2>
          <ImportProductsButton />
        </div>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>{isServices ? t("gestion.produits.serviceColumn") : t("gestion.produits.productColumn")}</th>
                {!isServices && <th>{t("gestion.produits.sellUnitLabel")}</th>}
                <th className="right">{t("gestion.produits.sellPriceColumn")}</th>
                <th className="right">{t("gestion.editCommon.unitCostLabel")}</th>
                <th className="right">{t("gestion.produits.marginColumn")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  {!isServices && <td>{unitLabels[p.sellUnit]}</td>}
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
                      <ConfirmSubmitButton confirmMessage={deleteConfirmMessage} title={t("common.delete")} />
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="g-empty">
            {isServices ? t("gestion.produits.emptyServices") : t("gestion.produits.emptyProducts")}
          </div>
        )}
      </div>
    </>
  );
}
