import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { getExpenses } from "@/lib/gestion/queries";
import { createExpense, deleteExpense } from "@/lib/gestion/actions";
import { fmt, todayStr } from "@/lib/gestion/format";
import { ConfirmSubmitButton } from "@/components/gestion/ConfirmSubmitButton";

export default async function DepensesPage() {
  const user = await getCurrentUser();
  const expenses = await getExpenses(user.id);

  return (
    <>
      <div className="g-card">
        <h2>Nouvelle dépense (hors stock)</h2>
        <div className="g-hint">
          Publicité, charges fixes, transport... tout ce qui n&apos;est pas une matière de
          stock.
        </div>
        <form action={createExpense} className="g-field-grid">
          <div className="g-field">
            <label>Date</label>
            <input type="date" name="date" defaultValue={todayStr()} required />
          </div>
          <div className="g-field">
            <label>Description</label>
            <input type="text" name="description" placeholder="ex: Ads Facebook" required />
          </div>
          <div className="g-field">
            <label>Montant (DT)</label>
            <input type="number" name="amount" min="0.01" step="0.01" required />
          </div>
          <button type="submit" className="g-btn">
            <Plus size={15} /> Ajouter
          </button>
        </form>
      </div>

      <div className="g-card">
        <h2>Toutes les dépenses</h2>
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th className="right">Montant</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((d) => (
                <tr key={d.id}>
                  <td className="num">{d.date.toISOString().slice(0, 10)}</td>
                  <td>{d.description}</td>
                  <td className="right num">{fmt(d.amount)}</td>
                  <td>
                    <form action={deleteExpense}>
                      <input type="hidden" name="id" value={d.id} />
                      <ConfirmSubmitButton confirmMessage="Supprimer cette dépense ?" />
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {expenses.length === 0 && <div className="g-empty">Aucune dépense enregistrée.</div>}
      </div>
    </>
  );
}
