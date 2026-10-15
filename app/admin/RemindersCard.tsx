import { MessageCircle } from "lucide-react";
import { markWhatsappReminderSent } from "@/lib/admin-actions";
import { WHATSAPP_REMINDERS, type DueReminder } from "@/lib/reminders";
import { waLink, waNumber } from "@/lib/whatsapp";
import { mailerConfigured } from "@/lib/mailer";

const STEP_LABELS: Record<string, string> = { D1: "J+1", D3: "J+3", D7: "J+7" };

function formatDay(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", timeZone: "Africa/Tunis" });
}

/** "À relancer aujourd'hui": phone accounts due a reminder, one tap to
 * open WhatsApp with the message ready, then "Envoyé" to log it. Email
 * accounts are handled by the daily job — counted here for context. */
export function RemindersCard({ due, emailsSentToday }: { due: DueReminder[]; emailsSentToday: number }) {
  const whatsapp = due.filter((r) => !r.email && r.phone);
  const byEmail = due.filter((r) => r.email).length;
  return (
    <div className="g-card">
      <h2>💬 À relancer aujourd&apos;hui</h2>
      <div className="g-hint">
        Inscrits par téléphone qui n&apos;ont pas encore enregistré de vente (J+1, J+3, J+7). Touche « WhatsApp »,
        envoie le message, puis « Envoyé ». Les inscrits par e-mail reçoivent leurs rappels automatiquement chaque
        matin à 10h{mailerConfigured() ? "" : " (en attente : SMTP_USER / SMTP_PASSWORD pas encore ajoutés dans Vercel)"}.
        Aujourd&apos;hui : {emailsSentToday} e-mail(s) envoyé(s), {byEmail} en attente d&apos;envoi.
      </div>
      {whatsapp.length === 0 ? (
        <div className="g-empty">Personne à relancer sur WhatsApp aujourd&apos;hui.</div>
      ) : (
        <div className="g-table-wrap">
          <table className="g-table">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Inscrit le</th>
                <th>Rappel</th>
                <th>Produits</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {whatsapp.map((r) => {
                const number = waNumber(r.phone);
                return (
                  <tr key={`${r.userId}-${r.step}`}>
                    <td className="num">{r.phone}</td>
                    <td className="num">{formatDay(r.createdAt)}</td>
                    <td>
                      <span className="g-badge pending">{STEP_LABELS[r.step]}</span>
                    </td>
                    <td className="num">{r.products}</td>
                    <td style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {number && (
                        <a className="g-wa-btn" href={waLink(number, WHATSAPP_REMINDERS[r.step])} target="_blank" rel="noopener noreferrer">
                          <MessageCircle size={14} aria-hidden="true" /> WhatsApp
                        </a>
                      )}
                      <form action={markWhatsappReminderSent}>
                        <input type="hidden" name="userId" value={r.userId} />
                        <input type="hidden" name="step" value={r.step} />
                        <button type="submit" className="g-btn secondary small">
                          Envoyé ✓
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
