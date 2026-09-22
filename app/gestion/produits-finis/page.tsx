import { Plus } from "lucide-react";
import { getCurrentBusiness } from "@/lib/current-business";
import { requirePalier2Page } from "@/lib/subscription-access";
import { getFinishedStock, getProductionBatches, getProducts } from "@/lib/gestion/queries";
import { createProductionBatch, deleteProductionBatch, updateProductionBatch } from "@/lib/gestion/actions";
import { todayStr } from "@/lib/gestion/format";
import { fmtQty } from "@/lib/gestion/product-units";
import { getServerT } from "@/lib/i18n/server";
import { ConfirmSubmitButton } from "@/components/gestion/ConfirmSubmitButton";
import { EditProductionBatchButton } from "@/components/gestion/EditProductionBatchButton";

export default async function ProduitsFinisPage() {
  await requirePalier2Page();
  const { t } = await getServerT();
  const business = await getCurrentBusiness();
  const [products, batches, finishedStock] = await Promise.all([
    getProducts(business.id),
    getProductionBatches(business.id),
    getFinishedStock(business.id),
  ]);

  return (
    <>
      <div className="g-card">
        <h2>{t("gestion.produitsFinis.newBatchTitle")}</h2>
        <div className="g-hint">{t("gestion.produitsFinis.newBatchHint")}</div>
        <form action={createProductionBatch} className="g-field-grid">
          <div className="g-field">
            <label>{t("gestion.editCommon.dateLabel")}</label>
            <input type="date" name="date" defaultValue={todayStr()} required />
          </div>
          <div className="g-field">
            <label>{t("gestion.produits.productColumn")}</label>
            <select name="productId" required>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="g-field">
            <label>{t("gestion.produitsFinis.quantityProducedLabel")}</label>
            <input type="number" name="quantity" min="0.001" step="any" required />
          </div>
          <button type="submit" className="g-btn" disabled={products.length === 0}>
            <Plus size={15} /> {t("gestion.produitsFinis.addBatchButton")}
          </button>
        </form>
      </div>

      <div className="g-card">
        <h2>{t("gestion.produitsFinis.availableStockTitle")}</h2>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>{t("gestion.produits.productColumn")}</th>
                <th className="right">{t("gestion.produitsFinis.totalProducedColumn")}</th>
                <th className="right">{t("gestion.produitsFinis.soldColumn")}</th>
                <th className="right">{t("gestion.produitsFinis.availableColumn")}</th>
              </tr>
            </thead>
            <tbody>
              {finishedStock.map(({ product, totalProduced, totalSold, available }) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td className="right num">{fmtQty(totalProduced, product.sellUnit)}</td>
                  <td className="right num">{fmtQty(totalSold, product.sellUnit)}</td>
                  <td
                    className="right num"
                    style={available <= 0 ? { color: "var(--g-critical)", fontWeight: 700 } : undefined}
                  >
                    {fmtQty(available, product.sellUnit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="g-empty">{t("gestion.produitsFinis.emptyStock")}</div>
        )}
      </div>

      <div className="g-card">
        <h2>{t("gestion.produitsFinis.batchHistoryTitle")}</h2>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>{t("gestion.editCommon.dateLabel")}</th>
                <th>{t("gestion.produits.productColumn")}</th>
                <th className="right">{t("gestion.commandes.quantityLabel")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id}>
                  <td className="num">{b.date.toISOString().slice(0, 10)}</td>
                  <td>{b.product.name}</td>
                  <td className="right num">{fmtQty(b.quantity, b.product.sellUnit)}</td>
                  <td style={{ display: "flex", gap: 2 }}>
                    <EditProductionBatchButton
                      batch={b}
                      products={products}
                      updateProductionBatchAction={updateProductionBatch}
                    />
                    <form action={deleteProductionBatch}>
                      <input type="hidden" name="id" value={b.id} />
                      <ConfirmSubmitButton confirmMessage={t("gestion.confirm.deleteBatch")} title={t("common.delete")} />
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {batches.length === 0 && <div className="g-empty">{t("gestion.produitsFinis.emptyBatches")}</div>}
      </div>
    </>
  );
}
