import { setIndustry } from "@/lib/gestion/actions";
import { INDUSTRIES } from "@/lib/industries";
import type { TFunction } from "@/lib/i18n/translate";

/** "Tu travailles dans quel domaine ?" — one tap, then it's gone. The
 * answer feeds the back office's breakdown, so the founder knows who uses
 * Flux without looking at anyone's data. */
export function IndustryQuestion({ t }: { t: TFunction }) {
  return (
    <div className="g-card g-industry">
      <h2>{t("gestion.industry.question")}</h2>
      <div className="g-hint">{t("gestion.industry.hint")}</div>
      <form action={setIndustry} className="g-industry__choices">
        {INDUSTRIES.map((i) => (
          <button key={i.key} type="submit" name="industry" value={i.key} className="g-industry__chip">
            <span aria-hidden="true">{i.emoji}</span> {t(`gestion.industry.${i.key}`)}
          </button>
        ))}
      </form>
    </div>
  );
}
