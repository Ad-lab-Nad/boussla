import { Plus } from "lucide-react";
import { getCurrentBusiness } from "@/lib/current-business";
import { requirePalier2Page } from "@/lib/subscription-access";
import { getClients, getReceivables } from "@/lib/gestion/queries";
import {
  createClient,
  createReceivable,
  deleteClient,
  deleteReceivable,
  markReceivablePaid,
  updateClient,
  updateReceivable,
} from "@/lib/gestion/actions";
import { describeReceivable } from "@/lib/gestion/calculations";
import { fmt, todayStr } from "@/lib/gestion/format";
import { getServerT } from "@/lib/i18n/server";
import { ConfirmSubmitButton } from "@/components/gestion/ConfirmSubmitButton";
import { EditClientButton } from "@/components/gestion/EditClientButton";
import { EditReceivableButton } from "@/components/gestion/EditReceivableButton";

export default async function ClientsPage() {
  await requirePalier2Page();
  const { t } = await getServerT();
  const business = await getCurrentBusiness();
  const [clients, receivables] = await Promise.all([
    getClients(business.id),
    getReceivables(business.id),
  ]);
  const now = new Date();

  return (
    <>
      <div className="g-card">
        <h2>{t("gestion.clients.newClientTitle")}</h2>
        <form action={createClient} className="g-field-grid">
          <div className="g-field">
            <label>{t("gestion.clients.nameLabel")}</label>
            <input type="text" name="name" placeholder={t("gestion.clients.namePlaceholder")} required />
          </div>
          <div className="g-field">
            <label>{t("gestion.clients.phoneLabel")}</label>
            <input type="text" name="phone" placeholder={t("gestion.clients.phonePlaceholder")} />
          </div>
          <div className="g-field">
            <label>{t("gestion.clients.emailLabel")}</label>
            <input type="email" name="email" />
          </div>
          <button type="submit" className="g-btn">
            <Plus size={15} /> {t("common.add")}
          </button>
        </form>
      </div>

      <div className="g-card">
        <h2>{t("gestion.clients.newReceivableTitle")}</h2>
        <div className="g-hint">{t("gestion.clients.newReceivableHint")}</div>
        <form action={createReceivable} className="g-field-grid">
          <div className="g-field">
            <label>{t("gestion.clients.clientLabel")}</label>
            <select name="clientId" required>
              {clients.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="g-field">
            <label>{t("gestion.editCommon.amountLabel")}</label>
            <input type="number" name="amount" min="0.01" step="0.01" required />
          </div>
          <div className="g-field">
            <label>{t("gestion.clients.dueDateLabel")}</label>
            <input type="date" name="dueDate" defaultValue={todayStr()} required />
          </div>
          <div className="g-field">
            <label>{t("gestion.clients.noteOptionalLabel")}</label>
            <input type="text" name="note" />
          </div>
          <button type="submit" className="g-btn" disabled={clients.length === 0}>
            <Plus size={15} /> {t("common.save")}
          </button>
        </form>
        {clients.length === 0 && (
          <div className="g-empty">{t("gestion.clients.addClientFirstHint")}</div>
        )}
      </div>

      <div className="g-card">
        <h2>{t("gestion.clients.clientsTitle")}</h2>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>{t("gestion.clients.nameLabel")}</th>
                <th>{t("gestion.clients.contactColumn")}</th>
                <th className="right">{t("gestion.clients.totalDueColumn")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const totalDue = client.receivables.reduce(
                  (sum, r) => sum + describeReceivable(r, now, t).remaining,
                  0
                );
                const hasLate = client.receivables.some((r) => describeReceivable(r, now, t).isLate);
                return (
                  <tr key={client.id}>
                    <td>{client.name}</td>
                    <td>{[client.phone, client.email].filter(Boolean).join(" · ") || "—"}</td>
                    <td
                      className="right num"
                      style={hasLate ? { color: "var(--g-critical)", fontWeight: 700 } : undefined}
                    >
                      {fmt(totalDue)}
                    </td>
                    <td style={{ display: "flex", gap: 2 }}>
                      <EditClientButton client={client} updateClientAction={updateClient} />
                      <form action={deleteClient}>
                        <input type="hidden" name="id" value={client.id} />
                        <ConfirmSubmitButton confirmMessage={t("gestion.confirm.deleteClient")} title={t("common.delete")} />
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {clients.length === 0 && <div className="g-empty">{t("gestion.clients.emptyClients")}</div>}
      </div>

      <div className="g-card">
        <h2>{t("gestion.clients.receivablesTitle")}</h2>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>{t("gestion.clients.clientLabel")}</th>
                <th className="right">{t("gestion.editCommon.amountLabel")}</th>
                <th className="right">{t("gestion.clients.remainingDueColumn")}</th>
                <th>{t("gestion.clients.dueDateLabel")}</th>
                <th>{t("gestion.clients.statusLabel")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {receivables.map((r) => {
                const { label, badge, remaining } = describeReceivable(r, now, t);
                return (
                  <tr key={r.id}>
                    <td>{r.client.name}</td>
                    <td className="right num">{fmt(r.amount)}</td>
                    <td className="right num">{fmt(remaining)}</td>
                    <td className="num">{r.dueDate.toISOString().slice(0, 10)}</td>
                    <td>
                      <span className={`g-badge ${badge}`}>{label}</span>
                    </td>
                    <td style={{ display: "flex", gap: 2 }}>
                      {r.status !== "PAID" && (
                        <form action={markReceivablePaid}>
                          <input type="hidden" name="id" value={r.id} />
                          <button type="submit" className="g-btn secondary small">
                            {t("gestion.clients.markPaidButton")}
                          </button>
                        </form>
                      )}
                      <EditReceivableButton receivable={r} updateReceivableAction={updateReceivable} />
                      <form action={deleteReceivable}>
                        <input type="hidden" name="id" value={r.id} />
                        <ConfirmSubmitButton confirmMessage={t("gestion.confirm.deleteReceivable")} title={t("common.delete")} />
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {receivables.length === 0 && <div className="g-empty">{t("gestion.clients.emptyReceivables")}</div>}
      </div>
    </>
  );
}
