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
import { ConfirmSubmitButton } from "@/components/gestion/ConfirmSubmitButton";
import { EditClientButton } from "@/components/gestion/EditClientButton";
import { EditReceivableButton } from "@/components/gestion/EditReceivableButton";

export default async function ClientsPage() {
  await requirePalier2Page();
  const business = await getCurrentBusiness();
  const [clients, receivables] = await Promise.all([
    getClients(business.id),
    getReceivables(business.id),
  ]);
  const now = new Date();

  return (
    <>
      <div className="g-card">
        <h2>Nouveau client</h2>
        <form action={createClient} className="g-field-grid">
          <div className="g-field">
            <label>Nom</label>
            <input type="text" name="name" placeholder="ex: Sami Trabelsi" required />
          </div>
          <div className="g-field">
            <label>Téléphone</label>
            <input type="text" name="phone" placeholder="ex: 20 123 456" />
          </div>
          <div className="g-field">
            <label>Email</label>
            <input type="email" name="email" />
          </div>
          <button type="submit" className="g-btn">
            <Plus size={15} /> Ajouter
          </button>
        </form>
      </div>

      <div className="g-card">
        <h2>Enregistrer une créance</h2>
        <div className="g-hint">
          Un montant qu&apos;un client te doit — pas besoin qu&apos;elle soit liée à une commande
          enregistrée.
        </div>
        <form action={createReceivable} className="g-field-grid">
          <div className="g-field">
            <label>Client</label>
            <select name="clientId" required>
              {clients.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="g-field">
            <label>Montant (DT)</label>
            <input type="number" name="amount" min="0.01" step="0.01" required />
          </div>
          <div className="g-field">
            <label>Échéance</label>
            <input type="date" name="dueDate" defaultValue={todayStr()} required />
          </div>
          <div className="g-field">
            <label>Note (optionnelle)</label>
            <input type="text" name="note" />
          </div>
          <button type="submit" className="g-btn" disabled={clients.length === 0}>
            <Plus size={15} /> Enregistrer
          </button>
        </form>
        {clients.length === 0 && (
          <div className="g-empty">Ajoute d&apos;abord un client ci-dessus.</div>
        )}
      </div>

      <div className="g-card">
        <h2>Clients</h2>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Contact</th>
                <th className="right">Total dû</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const totalDue = client.receivables.reduce(
                  (sum, r) => sum + describeReceivable(r, now).remaining,
                  0
                );
                const hasLate = client.receivables.some((r) => describeReceivable(r, now).isLate);
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
                        <ConfirmSubmitButton confirmMessage="Supprimer ce client et ses créances ?" />
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {clients.length === 0 && <div className="g-empty">Aucun client enregistré.</div>}
      </div>

      <div className="g-card">
        <h2>Créances</h2>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>Client</th>
                <th className="right">Montant</th>
                <th className="right">Reste dû</th>
                <th>Échéance</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {receivables.map((r) => {
                const { label, badge, remaining } = describeReceivable(r, now);
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
                            Marquer payée
                          </button>
                        </form>
                      )}
                      <EditReceivableButton receivable={r} updateReceivableAction={updateReceivable} />
                      <form action={deleteReceivable}>
                        <input type="hidden" name="id" value={r.id} />
                        <ConfirmSubmitButton confirmMessage="Supprimer cette créance ?" />
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {receivables.length === 0 && <div className="g-empty">Aucune créance enregistrée.</div>}
      </div>
    </>
  );
}
