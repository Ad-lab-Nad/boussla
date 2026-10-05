import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact — Flux",
  description: "Une question, un problème, une idée ? Écris-nous, on te répond rapidement.",
};

export default function ContactPage() {
  return (
    <div className="l-page__narrow">
      <h1 className="l-page__title">Nous contacter</h1>
      <p className="l-page__lead">
        Une question sur Flux, un souci technique, une idée d&apos;amélioration ? Écris-nous : on lit
        chaque message et on te répond rapidement.
      </p>

      <div className="l-contact-grid">
        <div className="g-card">
          <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MessageCircle size={17} /> Envoyer un message
          </h2>
          <ContactForm />
        </div>
        <div className="g-card">
          <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Mail size={17} /> Par email
          </h2>
          <p style={{ fontSize: "0.9rem", color: "var(--g-ink-2)", margin: "0 0 8px" }}>
            Tu préfères écrire directement ?
          </p>
          <a href={`mailto:${SITE.contactEmail}`} className="l-contact-mail">
            {SITE.contactEmail}
          </a>
        </div>
      </div>
    </div>
  );
}
