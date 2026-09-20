import Link from "next/link";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { getAllHomepageBlocks } from "@/lib/homepage/queries";
import { moveHomepageBlockDown, moveHomepageBlockUp, toggleHomepageBlockActive } from "@/lib/homepage/actions";
import {
  parseArgumentaireContent,
  parseHeroContent,
  parseOffresContent,
  parseTemoignagesContent,
} from "@/lib/homepage/types";
import { EditHeroBlockModal } from "@/components/homepage/EditHeroBlockModal";
import { EditArgumentaireBlockModal } from "@/components/homepage/EditArgumentaireBlockModal";
import { EditOffresBlockModal } from "@/components/homepage/EditOffresBlockModal";
import { EditTemoignagesBlockModal } from "@/components/homepage/EditTemoignagesBlockModal";

const TYPE_LABELS: Record<string, string> = {
  HERO: "Hero",
  ARGUMENTAIRE: "Argumentaire",
  OFFRES: "Offres",
  TEMOIGNAGES: "Témoignages",
  FAQ: "FAQ (réservé, pas encore éditable)",
};

function blockPreview(block: { type: string; content: unknown }): string {
  switch (block.type) {
    case "HERO":
      return parseHeroContent(block.content).title || "(titre vide)";
    case "ARGUMENTAIRE":
      return parseArgumentaireContent(block.content).sectionTitle || "(titre vide)";
    case "OFFRES":
      return parseOffresContent(block.content)
        .offers.map((o) => o.name || "(sans nom)")
        .join(" · ");
    case "TEMOIGNAGES": {
      const count = parseTemoignagesContent(block.content).items.length;
      return count === 0 ? "Aucun témoignage" : `${count} témoignage${count > 1 ? "s" : ""}`;
    }
    default:
      return "";
  }
}

export default async function AdminAccueilPage() {
  const blocks = await getAllHomepageBlocks();

  return (
    <div className="g-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <h2 style={{ margin: 0 }}>Blocs de la page d&apos;accueil</h2>
        <Link href="/?preview=1" target="_blank" className="g-btn secondary small">
          <ExternalLink size={14} /> Aperçu
        </Link>
      </div>
      <div className="g-hint">
        Réordonne avec les flèches, active/désactive un bloc, ou clique le crayon pour modifier son
        contenu. Un bloc désactivé n&apos;apparaît plus sur la page publique — pratique pour préparer
        du contenu avant de le publier.
      </div>

      <div className="g-table-wrap">
        <table className="g-table">
          <thead>
            <tr>
              <th></th>
              <th>Type</th>
              <th>Aperçu</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((block, index) => (
              <tr key={block.id}>
                <td>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <form action={moveHomepageBlockUp}>
                      <input type="hidden" name="id" value={block.id} />
                      <button type="submit" className="g-del-btn" disabled={index === 0} title="Monter">
                        <ChevronUp size={15} />
                      </button>
                    </form>
                    <form action={moveHomepageBlockDown}>
                      <input type="hidden" name="id" value={block.id} />
                      <button
                        type="submit"
                        className="g-del-btn"
                        disabled={index === blocks.length - 1}
                        title="Descendre"
                      >
                        <ChevronDown size={15} />
                      </button>
                    </form>
                  </div>
                </td>
                <td>{TYPE_LABELS[block.type] ?? block.type}</td>
                <td>{blockPreview(block)}</td>
                <td>
                  <span className={`g-badge ${block.active ? "status-valid" : "status-warning"}`}>
                    {block.active ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <form action={toggleHomepageBlockActive}>
                      <input type="hidden" name="id" value={block.id} />
                      <button type="submit" className="g-btn secondary small">
                        {block.active ? "Désactiver" : "Activer"}
                      </button>
                    </form>
                    {block.type === "HERO" && (
                      <EditHeroBlockModal id={block.id} content={parseHeroContent(block.content)} />
                    )}
                    {block.type === "ARGUMENTAIRE" && (
                      <EditArgumentaireBlockModal
                        id={block.id}
                        content={parseArgumentaireContent(block.content)}
                      />
                    )}
                    {block.type === "OFFRES" && (
                      <EditOffresBlockModal id={block.id} content={parseOffresContent(block.content)} />
                    )}
                    {block.type === "TEMOIGNAGES" && (
                      <EditTemoignagesBlockModal
                        id={block.id}
                        content={parseTemoignagesContent(block.content)}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {blocks.length === 0 && <div className="g-empty">Aucun bloc pour l&apos;instant.</div>}
    </div>
  );
}
