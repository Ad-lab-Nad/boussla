import { CreditCard, MessageSquareText, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { describeSubscription, isActivePaying, isActiveTrial } from "@/lib/admin";
import { markPaymentReceived } from "@/lib/admin-actions";
import { KpiCard } from "@/components/gestion/KpiCard";

function formatDate(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminPage() {
  const [users, feedback] = await Promise.all([
    prisma.user.findMany({
      include: { subscription: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.feedback.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const now = new Date();
  const activeTrialCount = users.filter((u) => isActiveTrial(u.subscription, now)).length;
  const activePayingCount = users.filter((u) => isActivePaying(u.subscription, now)).length;

  return (
    <>
      <div className="g-kpi-grid">
        <KpiCard label="Inscrits au total" value={String(users.length)} icon={Users} tone="blue" />
        <KpiCard label="Essai actif" value={String(activeTrialCount)} icon={CreditCard} tone="aqua" />
        <KpiCard label="Payant actif" value={String(activePayingCount)} icon={CreditCard} tone="good" />
      </div>

      <div className="g-card">
        <h2>Utilisateurs</h2>
        <div className="g-hint">
          Marquer un paiement reçu prolonge l&apos;accès à partir d&apos;aujourd&apos;hui, ou à
          partir de la fin de la période en cours si elle n&apos;est pas encore terminée.
        </div>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Inscrit le</th>
                <th>Statut abonnement</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const { label, badge } = describeSubscription(u.subscription, now);
                return (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td className="num">{formatDate(u.createdAt)}</td>
                    <td>
                      <span className={`g-badge ${badge}`}>{label}</span>
                    </td>
                    <td>
                      <form
                        action={markPaymentReceived}
                        style={{ display: "flex", gap: 6, alignItems: "center" }}
                      >
                        <input type="hidden" name="userId" value={u.id} />
                        <select name="billingInterval" defaultValue="MONTHLY" className="g-status-select">
                          <option value="MONTHLY">Mensuel (39 DT)</option>
                          <option value="ANNUAL">Annuel (390 DT)</option>
                        </select>
                        <button type="submit" className="g-btn small">
                          Marquer payé
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {users.length === 0 && <div className="g-empty">Aucun utilisateur inscrit.</div>}
      </div>

      <div className="g-card">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <MessageSquareText size={17} />
          <h2 style={{ margin: 0 }}>Messages de feedback</h2>
        </div>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Email</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((f) => (
                <tr key={f.id}>
                  <td className="num">{formatDate(f.createdAt)}</td>
                  <td>{f.email}</td>
                  <td>{f.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {feedback.length === 0 && <div className="g-empty">Aucun message reçu.</div>}
      </div>
    </>
  );
}
