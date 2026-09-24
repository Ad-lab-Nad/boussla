import { CreditCard, Gift, MessageSquareText, Receipt, TrendingDown, TrendingUp, Users, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { describeSubscription } from "@/lib/admin";
import {
  cancelLastPayment,
  confirmPastPayment,
  createPlatformExpense,
  deletePlatformExpense,
  markPaymentReceived,
} from "@/lib/admin-actions";
import { getPlatformBusinessId } from "@/lib/platform-business";
import {
  PLATFORM_EXPENSE_CATEGORIES,
  PLATFORM_EXPENSE_CATEGORY_LABELS,
} from "@/lib/platform-expense-categories";
import { getAvailableMonthKeys, getExpenses, getOrders, totalsForMonth } from "@/lib/gestion/queries";
import { orderAmount } from "@/lib/gestion/calculations";
import { fmt, monthKeyFromDate, monthKeyFromDateStr, monthLabel, todayStr } from "@/lib/gestion/format";
import { KpiCard } from "@/components/gestion/KpiCard";
import { AutoSubmitSelect } from "@/components/gestion/AutoSubmitSelect";
import { ConfirmSubmitButton } from "@/components/gestion/ConfirmSubmitButton";

function formatDate(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: requestedMonth } = await searchParams;
  const businessId = await getPlatformBusinessId();

  const [users, feedback, payments, expenses, monthOptions] = await Promise.all([
    prisma.user.findMany({
      include: { subscription: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.feedback.findMany({ orderBy: { createdAt: "desc" } }),
    getOrders(businessId),
    getExpenses(businessId),
    getAvailableMonthKeys(businessId),
  ]);

  const currentMonth = monthKeyFromDateStr(todayStr());
  const month = requestedMonth && monthOptions.includes(requestedMonth) ? requestedMonth : currentMonth;
  // Same math as the users' own dashboard: revenue = paid subscription
  // payments dated this month, netProfit = that minus this month's expenses.
  const totals = totalsForMonth(month, payments, expenses, []);
  const isProfitable = totals.netProfit >= 0;

  // email -> total ever paid; a user counts as "a déjà payé" once at least
  // one payment is recorded for them.
  const paidByEmail = new Map<string, number>();
  for (const p of payments) {
    if (!p.clientName) continue;
    paidByEmail.set(p.clientName, (paidByEmail.get(p.clientName) ?? 0) + orderAmount(p));
  }
  const paidCount = users.filter((u) => paidByEmail.has(u.email)).length;
  const freeCount = users.length - paidCount;

  const expensesInMonth = expenses.filter((e) => monthKeyFromDate(e.date) === month);
  const now = new Date();

  return (
    <>
      <form method="get">
        <div className="g-month-pill">
          <span style={{ fontSize: "0.8rem", color: "var(--g-muted)" }}>Mois analysé</span>
          <AutoSubmitSelect
            name="month"
            defaultValue={month}
            options={monthOptions.map((k) => ({ value: k, label: monthLabel(k) }))}
          />
        </div>
      </form>

      <div className="g-card">
        <h2>
          {isProfitable
            ? `En ${monthLabel(month)}, tu as gagné net ${fmt(totals.netProfit)}`
            : `En ${monthLabel(month)}, tu as perdu ${fmt(-totals.netProfit)}`}
        </h2>
        <div className="g-hint" style={{ marginBottom: 0 }}>
          Bénéfice net = paiements reçus ce mois-ci − tes dépenses du mois.
        </div>
      </div>

      <div className="g-kpi-grid">
        <KpiCard label="Chiffre d'affaires du mois" value={fmt(totals.revenue)} icon={Wallet} tone="blue" />
        <KpiCard label="Dépenses du mois" value={fmt(totals.expensesTotal)} icon={Receipt} tone="orange" />
        <KpiCard
          label="Bénéfice net du mois"
          value={fmt(totals.netProfit)}
          icon={isProfitable ? TrendingUp : TrendingDown}
          tone={isProfitable ? "good" : "critical"}
        />
      </div>

      <div className="g-kpi-grid">
        <KpiCard label="Inscrites au total" value={String(users.length)} icon={Users} tone="violet" />
        <KpiCard label="Gratuites (jamais payé)" value={String(freeCount)} icon={Gift} tone="aqua" />
        <KpiCard label="Ont déjà payé" value={String(paidCount)} icon={CreditCard} tone="good" />
      </div>

      <div className="g-card">
        <h2>Utilisatrices</h2>
        <div className="g-hint">
          « Marquer payé » enregistre un paiement reçu aujourd&apos;hui et prolonge l&apos;accès (à
          partir de la fin de la période en cours si elle n&apos;est pas encore terminée). Pour une
          utilisatrice déjà en « payant » avant l&apos;enregistrement des paiements, « Elle avait
          déjà payé » l&apos;ajoute au CA sans changer son accès.
        </div>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Inscrite le</th>
                <th>Paiement</th>
                <th>Accès</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const { label, badge } = describeSubscription(u.subscription, now);
                const totalPaid = paidByEmail.get(u.email);
                const canConfirmPast = totalPaid === undefined && u.subscription?.status === "ACTIVE";
                return (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td className="num">{formatDate(u.createdAt)}</td>
                    <td>
                      {totalPaid !== undefined ? (
                        <span className="g-badge status-valid">Payé · {fmt(totalPaid)}</span>
                      ) : (
                        <span className="g-badge status-warning">Gratuit</span>
                      )}
                    </td>
                    <td>
                      <span className={`g-badge ${badge}`}>{label}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                        <form
                          action={markPaymentReceived}
                          style={{ display: "flex", gap: 6, alignItems: "center" }}
                        >
                          <input type="hidden" name="userId" value={u.id} />
                          <select name="tier" defaultValue="PALIER_2" className="g-status-select">
                            <option value="PALIER_1">Palier 1 (19 DT)</option>
                            <option value="PALIER_2">Palier 2 (39 DT)</option>
                          </select>
                          <select name="billingInterval" defaultValue="MONTHLY" className="g-status-select">
                            <option value="MONTHLY">Mensuel</option>
                            <option value="ANNUAL">Annuel</option>
                          </select>
                          <button type="submit" className="g-btn small">
                            Marquer payé
                          </button>
                        </form>
                        {canConfirmPast && (
                          <form action={confirmPastPayment}>
                            <input type="hidden" name="userId" value={u.id} />
                            <button type="submit" className="g-btn secondary small">
                              Elle avait déjà payé
                            </button>
                          </form>
                        )}
                        {totalPaid !== undefined && (
                          <form action={cancelLastPayment}>
                            <input type="hidden" name="userId" value={u.id} />
                            <ConfirmSubmitButton
                              confirmMessage={`Annuler le dernier paiement enregistré pour ${u.email} ? Son accès ne change pas.`}
                              title="Annuler le dernier paiement"
                            />
                          </form>
                        )}
                      </div>
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
        <h2>Mes dépenses</h2>
        <div className="g-hint">Campagnes publicitaires, abonnements aux outils, hébergement…</div>
        <form action={createPlatformExpense} className="g-field-grid" style={{ marginBottom: 18 }}>
          <div className="g-field">
            <label htmlFor="exp-date">Date</label>
            <input id="exp-date" type="date" name="date" defaultValue={todayStr()} required />
          </div>
          <div className="g-field">
            <label htmlFor="exp-desc">Description</label>
            <input id="exp-desc" name="description" placeholder="Campagne Facebook" required />
          </div>
          <div className="g-field">
            <label htmlFor="exp-cat">Catégorie</label>
            <select id="exp-cat" name="category" defaultValue="ADVERTISING">
              {PLATFORM_EXPENSE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="g-field">
            <label htmlFor="exp-amount">Montant (DT)</label>
            <input id="exp-amount" type="number" name="amount" min="0.01" step="0.01" required />
          </div>
          <button type="submit" className="g-btn">
            Ajouter
          </button>
        </form>

        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Catégorie</th>
                <th>Montant</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expensesInMonth.map((e) => (
                <tr key={e.id}>
                  <td className="num">{formatDate(e.date)}</td>
                  <td>{e.description}</td>
                  <td>{PLATFORM_EXPENSE_CATEGORY_LABELS[e.category] ?? e.category}</td>
                  <td className="num">{fmt(e.amount)}</td>
                  <td>
                    <form action={deletePlatformExpense}>
                      <input type="hidden" name="id" value={e.id} />
                      <ConfirmSubmitButton confirmMessage={`Supprimer la dépense « ${e.description} » ?`} />
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {expensesInMonth.length === 0 && (
          <div className="g-empty">Aucune dépense en {monthLabel(month)}.</div>
        )}
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
