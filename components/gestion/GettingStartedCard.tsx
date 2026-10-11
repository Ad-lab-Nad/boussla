import Link from "next/link";
import { Check, MessageCircle } from "lucide-react";
import type { TFunction } from "@/lib/i18n/translate";

const WHATSAPP_NUMBER = "21623958603";

/** Top of the dashboard until the first product, sale and expense exist:
 * a brand-new account otherwise lands on a wall of "0,00 DT" with no hint
 * of where to start. Each step ticks itself off from the real data. */
export function GettingStartedCard({
  progress,
  isServices,
  t,
}: {
  progress: { hasProduct: boolean; hasOrder: boolean; hasExpense: boolean };
  isServices: boolean;
  t: TFunction;
}) {
  const steps = [
    {
      done: progress.hasProduct,
      label: t(isServices ? "gestion.gettingStarted.step1Services" : "gestion.gettingStarted.step1"),
      cta: t(isServices ? "gestion.gettingStarted.step1CtaServices" : "gestion.gettingStarted.step1Cta"),
      href: "/gestion/produits",
    },
    {
      done: progress.hasOrder,
      label: t("gestion.gettingStarted.step2"),
      cta: t("gestion.gettingStarted.step2Cta"),
      href: "/gestion/commandes",
    },
    {
      done: progress.hasExpense,
      label: t("gestion.gettingStarted.step3"),
      cta: t("gestion.gettingStarted.step3Cta"),
      href: "/gestion/depenses",
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null;
  // The first unfinished step gets the filled button.
  const nextIndex = steps.findIndex((s) => !s.done);
  const help = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t("gestion.gettingStarted.helpMessage"))}`;

  return (
    <div className="g-card g-start">
      <div className="g-start__head">
        <h2>{t("gestion.gettingStarted.title")}</h2>
        <span className="g-start__count">{t("gestion.gettingStarted.progress", { done: doneCount })}</span>
      </div>
      <div className="g-hint">{t("gestion.gettingStarted.subtitle")}</div>
      <ol className="g-start__steps">
        {steps.map((s, i) => (
          <li key={s.href} className={s.done ? "is-done" : undefined}>
            <span className="g-start__dot" aria-hidden="true">
              {s.done ? <Check size={14} strokeWidth={3} /> : i + 1}
            </span>
            <span className="g-start__label">{s.label}</span>
            {!s.done && (
              <Link href={s.href} className={i === nextIndex ? "g-btn" : "g-btn secondary"}>
                {s.cta}
              </Link>
            )}
          </li>
        ))}
      </ol>
      <a className="g-start__help" href={help} target="_blank" rel="noopener noreferrer">
        <MessageCircle size={15} aria-hidden="true" /> {t("gestion.gettingStarted.help")}
      </a>
    </div>
  );
}
