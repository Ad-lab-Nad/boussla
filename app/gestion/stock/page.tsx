import { Plus } from "lucide-react";
import { getCurrentBusiness } from "@/lib/current-business";
import { requirePalier2Page } from "@/lib/subscription-access";
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
import { getServerT } from "@/lib/i18n/server";
import { ConfirmSubmitButton } from "@/components/gestion/ConfirmSubmitButton";
import { EditStockItemButton } from "@/components/gestion/EditStockItemButton";
import { EditStockPurchaseButton } from "@/components/gestion/EditStockPurchaseButton";
import { EditStockUsageButton } from "@/components/gestion/EditStockUsageButton";

export default async function StockPage() {
  await requirePalier2Page();
  const { t } = await getServerT();
  const business = await getCurrentBusiness();
  const [stockItems, purchases, usages] = await Promise.all([
    getStockItems(business.id),
    getStockPurchases(business.id),
    getStockUsages(business.id),
  ]);

  return (
    <>
      <div className="g-card">
        <h2>{t("gestion.stock.newItemTitle")}</h2>
        <div className="g-hint">{t("gestion.stock.newItemHint")}</div>
        <form action={createStockItem} className="g-field-grid">
          <div className="g-field">
            <label>{t("gestion.stock.nameLabel")}</label>
            <input type="text" name="name" placeholder={t("gestion.stock.namePlaceholder")} required />
          </div>
          <div className="g-field">
            <label>{t("gestion.stock.unitLabel")}</label>
            <input type="text" name="unit" placeholder={t("gestion.stock.unitPlaceholder")} defaultValue="unité" />
          </div>
          <div className="g-field">
            <label>{t("gestion.stock.alertThresholdLabel")}</label>
            <input type="number" name="alertThreshold" min="0" step="1" defaultValue={10} />
          </div>
          <button type="submit" className="g-btn">
            <Plus size={15} /> {t("gestion.stock.createButton")}
          </button>
        </form>
      </div>

      <div className="g-card">
        <h2>{t("gestion.stock.newPurchaseTitle")}</h2>
        <form action={createStockPurchase} className="g-field-grid">
          <div className="g-field">
            <label>{t("gestion.editCommon.dateLabel")}</label>
            <input type="date" name="date" defaultValue={todayStr()} required />
          </div>
          <div className="g-field">
            <label>{t("gestion.stock.materialLabel")}</label>
            <select name="stockItemId" required>
              {stockItems.map(({ item }) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="g-field">
            <label>{t("gestion.stock.quantityPurchasedLabel")}</label>
            <input type="number" name="quantity" min="0" step="0.01" required />
          </div>
          <div className="g-field">
            <label>{t("gestion.stock.unitCostLabel")}</label>
            <input type="number" name="unitCost" min="0" step="0.01" required />
          </div>
          <button type="submit" className="g-btn" disabled={stockItems.length === 0}>
            <Plus size={15} /> {t("gestion.stock.registerPurchaseButton")}
          </button>
        </form>
      </div>

      <div className="g-card">
        <h2>{t("gestion.stock.newUsageTitle")}</h2>
        <form action={createStockUsage} className="g-field-grid">
          <div className="g-field">
            <label>{t("gestion.editCommon.dateLabel")}</label>
            <input type="date" name="date" defaultValue={todayStr()} required />
          </div>
          <div className="g-field">
            <label>{t("gestion.stock.materialLabel")}</label>
            <select name="stockItemId" required>
              {stockItems.map(({ item }) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="g-field">
            <label>{t("gestion.stock.quantityUsedLabel")}</label>
            <input type="number" name="quantity" min="0" step="0.01" required />
          </div>
          <button
            type="submit"
            className="g-btn secondary"
            disabled={stockItems.length === 0}
          >
            {t("gestion.stock.registerUsageButton")}
          </button>
        </form>
      </div>

      <div className="g-card">
        <h2>{t("gestion.stock.stateTitle")}</h2>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>{t("gestion.stock.materialLabel")}</th>
                <th className="right">{t("gestion.stock.purchasedColumn")}</th>
                <th className="right">{t("gestion.stock.usedColumn")}</th>
                <th className="right">{t("gestion.stock.remainingColumn")}</th>
                <th className="right">{t("gestion.stock.remainingValueColumn")}</th>
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
                        <ConfirmSubmitButton confirmMessage={t("gestion.confirm.deleteMaterialAndHistory")} title={t("common.delete")} />
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {stockItems.length === 0 && <div className="g-empty">{t("gestion.stock.emptyItems")}</div>}
      </div>

      <div className="g-card">
        <h2>{t("gestion.stock.purchaseHistoryTitle")}</h2>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>{t("gestion.editCommon.dateLabel")}</th>
                <th>{t("gestion.stock.materialLabel")}</th>
                <th className="right">{t("gestion.commandes.quantityLabel")}</th>
                <th className="right">{t("gestion.stock.unitCostLabel")}</th>
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
                      <ConfirmSubmitButton confirmMessage={t("gestion.confirm.deletePurchase")} title={t("common.delete")} />
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {purchases.length === 0 && <div className="g-empty">{t("gestion.stock.emptyPurchases")}</div>}
      </div>

      <div className="g-card">
        <h2>{t("gestion.stock.usageHistoryTitle")}</h2>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>{t("gestion.editCommon.dateLabel")}</th>
                <th>{t("gestion.stock.materialLabel")}</th>
                <th className="right">{t("gestion.commandes.quantityLabel")}</th>
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
                      <ConfirmSubmitButton confirmMessage={t("gestion.confirm.deleteUsage")} title={t("common.delete")} />
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {usages.length === 0 && <div className="g-empty">{t("gestion.stock.emptyUsages")}</div>}
      </div>
    </>
  );
}
