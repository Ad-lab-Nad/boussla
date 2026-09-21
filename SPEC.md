# GiraView — Cahier des charges technique

Document de brief destiné à Claude Code (ou tout développeur) pour construire GiraView : un outil de gestion simple pour commerçantes et petites entreprises tunisiennes, structuré en 3 paliers qui suivent le parcours réel d'une commerçante qui grandit.

**Positionnement produit** : à l'opposé des logiciels comptables classiques (Iberis, Hesabi, OneMag) — simple, sans jargon, pensé pour une utilisatrice seule qui n'a ni le temps ni l'envie d'apprendre un outil compliqué.

---

## 1. Les 3 paliers

| Palier | Prix | Besoin auquel il répond |
|---|---|---|
| **Palier 1 — Calcul du chiffre d'affaires** | 19 TND/mois | "Est-ce que je gagne vraiment de l'argent ?" |
| **Palier 2 — Analyse et suivi** | 39 TND/mois | "Où va mon argent, qui me doit encore quelque chose, mon stock tient-il ?" |
| **Palier 3 — Pro** | 79 TND/mois | "Je dois émettre des factures et suivre mes fournisseurs." |

**Plan de lancement en 2 phases** :
- **Phase 1 (maintenant)** : Paliers 1 et 2 seulement.
- **Phase 2 (plus tard)** : ajout du Palier 3, qui demande un travail de développement et de conformité légale nettement plus lourd (détaillé en section 6).

---

## 2. Architecture des données — à construire dès le Palier 1

Point le plus important de ce document : même si le multi-utilisateur et la facturation n'arrivent qu'au Palier 3, **la structure de données doit être pensée pour ça dès le premier jour**. Migrer un système mono-utilisateur vers du multi-utilisateur après coup est un chantier de réécriture coûteux ; concevoir le schéma correctement dès le départ ne coûte presque rien de plus.

### Entités principales

- **Business** (l'entreprise/commerce) — entité racine. Tout le reste s'y rattache (`business_id` sur chaque table). Même en Phase 1 où un compte = une utilisatrice, modéliser `Business` et `User` comme deux entités séparées liées par une table `BusinessMembership` (business_id, user_id, role). Ça prépare le multi-utilisateur du Palier 3 sans aucune migration de schéma plus tard — seule l'interface pour inviter un second utilisateur reste à construire.
- **User** — identité, authentification, palier d'abonnement actif (`subscription_tier`, `subscription_status`).
- **Transaction** — vente ou dépense : montant, type (revenu/dépense), catégorie, date, note. C'est la table centrale du Palier 1.
- **Client** — pour le suivi des impayés (Palier 2) : nom, contact, et une sous-table `Receivable` (créance) avec montant dû, date d'échéance, statut (payé/partiel/en retard).
- **Product/Stock** — pour les alertes de stock (Palier 2) : nom, quantité actuelle, seuil d'alerte, prix.
- **Supplier** — fournisseur (Palier 3) : nom, contact, matricule fiscal.
- **Invoice** — facture émise (Palier 3) : numéro séquentiel (obligatoire légalement, voir section 6), client, lignes, montants HT/TVA/TTC, statut.
- **SupplierInvoice** — facture fournisseur scannée (Palier 3) : image source, données extraites par OCR, statut de validation manuelle.

### Pourquoi ce découpage

Chaque palier n'ajoute pas des tables isolées, il ajoute des lignes de lecture sur la même base : le Palier 1 n'utilise que `Transaction` ; le Palier 2 ajoute la lecture historique/agrégée de `Transaction` + les nouvelles tables `Client`/`Receivable`/`Product` ; le Palier 3 ajoute `Supplier`/`Invoice`/`SupplierInvoice` et active le multi-utilisateur déjà présent dans le schéma. Cette continuité évite de reconstruire l'app à chaque palier.

---

## 3. Détail fonctionnel par palier

### Palier 1 — Calcul du chiffre d'affaires (Phase 1)

- Saisie rapide d'une vente ou d'une dépense (montant, catégorie, date — 3 champs max, pensé pour aller vite sur mobile).
- Écran principal : un seul chiffre mis en avant — "Ce mois-ci, vous avez gagné X TND" (chiffre d'affaires moins dépenses), pas un tableau de bord chargé.
- Historique simple du mois en cours.

Complexité technique : faible. CRUD standard + un calcul d'agrégation.

### Palier 2 — Analyse et suivi (Phase 1)

- Historique complet sur l'année, avec graphique de tendance (revenu/dépense par mois).
- Suivi des impayés : liste des clients qui doivent de l'argent, montant, échéance, avec rappel visuel (badge rouge si en retard) et, si possible, rappel automatique par notification push ou SMS.
- Gestion de stock simple : quantité par produit, seuil d'alerte configurable, notification quand le seuil est atteint.
- Export simple des données (PDF ou Excel) pour ses propres archives.

Complexité technique : moyenne. Nécessite un système de notifications (push obligatoire, SMS en option via un fournisseur local tunisien — à choisir) et des requêtes d'agrégation plus poussées, mais aucune techno exotique.

### Palier 3 — Pro (Phase 2)

- Création de facture conforme à la réglementation tunisienne (voir section 6 — **point de vigilance majeur**).
- Scan de facture fournisseur : photo → extraction automatique (montant, fournisseur, date) via OCR → écran de vérification/correction manuelle avant enregistrement (ne jamais faire confiance à l'OCR à 100%, toujours un pas de validation humaine).
- Gestion fournisseurs : fiche fournisseur, historique des factures reçues.
- Multi-utilisateurs : inviter un second compte (ex. un·e comptable externe, un associé) avec des droits limités (lecture seule sur les finances, ou accès restreint au stock uniquement, par exemple).

Complexité technique : élevée, pour les raisons détaillées en section 6.

---

## 4. Stack technique recommandée

Recommandation par défaut, à ajuster selon les préférences de l'équipe :

- **Frontend** : application web responsive (mobile-first, la majorité des utilisatrices seront sur téléphone), construite en PWA (Progressive Web App) pour permettre l'installation sur l'écran d'accueil sans passer par les stores — plus rapide à itérer qu'une app native, tout en donnant une expérience proche d'une app.
- **Backend** : API REST classique avec base de données relationnelle (PostgreSQL) — le modèle de données ci-dessus est fondamentalement relationnel (relations Business → User → Transaction/Client/Product), donc une base SQL est plus adaptée qu'une base NoSQL.
- **Authentification** : email/mot de passe + numéro de téléphone (beaucoup de commerçantes préfèrent s'identifier par téléphone plutôt que par email en Tunisie — à valider auprès de tes utilisatrices tests).
- **Paiement des abonnements** : intégration avec un fournisseur de paiement local tunisien (à choisir — plusieurs solutions existent pour les paiements en ligne en TND) plutôt qu'un fournisseur international qui ne gère pas bien le dinar tunisien.
- **Notifications** : push via le navigateur/PWA en standard ; SMS via un fournisseur local en option pour le Palier 2+ (rappels d'impayés, alertes stock).

---

## 5. OCR pour le scan de facture fournisseur (Palier 3)

Ne pas construire de moteur de reconnaissance d'écriture/texte maison — c'est un projet de recherche en soi, pas une fonctionnalité qu'une petite équipe peut développer de façon fiable. Utiliser une API tierce existante spécialisée dans la lecture de documents/factures (ex. des services de reconnaissance de documents disponibles chez les grands fournisseurs cloud, ou des API spécialisées dans l'extraction de données de factures). Prévoir systématiquement un écran de relecture/correction après le scan : la qualité dépendra de la netteté des photos prises par les utilisatrices, donc l'OCR doit être un assistant qui pré-remplit, jamais une source de vérité automatique.

---

## 6. Point de vigilance majeur : conformité de la facturation en Tunisie

C'est le sujet le plus important à valider avant de développer le Palier 3 — ce n'est pas qu'une question technique, c'est une question légale qui peut changer la portée du projet.

**Ce qui est confirmé** (Article 18 du Code de la TVA tunisien) : une facture doit obligatoirement comporter la date de l'opération, l'identification et l'adresse du client, le numéro de carte d'identification fiscale (matricule fiscal) de l'émetteur, la désignation du bien/service avec le prix hors taxe, le taux et le montant de la TVA, et une numérotation chronologique ininterrompue des factures.

**Ce qui nécessite une vérification légale avant de construire quoi que ce soit** : selon les sources consultées, la Tunisie généralise depuis le 1er janvier 2026 la **facturation électronique obligatoire** pour les assujettis à la TVA, via un système appelé **El Fatoora**, opéré par TTN (Tunisie TradeNet). D'après ces sources, une facture électronique conforme demanderait la génération d'un fichier structuré au format **TEIF (XML)**, une **signature électronique** (norme XAdES-B) obtenue via un certificat délivré par l'ANCE (Agence Nationale de Certification Électronique), et une soumission au système de validation d'El Fatoora avec accusé de réception.

Je n'ai pas pu confirmer avec certitude : les seuils exacts (est-ce que ça concerne toutes les entreprises assujetties dès le premier TND de chiffre d'affaires, ou seulement au-delà d'un certain seuil), le calendrier définitif de mise en application des sanctions (une source indique que ce point restait en discussion parlementaire), et si de très petites structures (le profil de ta cible Palier 1/2) sont concernées dès maintenant ou seulement dans un second temps. **Je ne suis pas expert-comptable ni fiscaliste — avant de construire le Palier 3, il faut impérativement faire valider ces points par un comptable ou un avocat fiscaliste tunisien**, pour savoir précisément ce que "facture conforme" doit vouloir dire pour du logiciel que GiraView va livrer.

Si l'obligation d'intégration à El Fatoora se confirme pour ta cible, ça change la portée technique du Palier 3 de façon importante — deux options possibles, à trancher une fois l'analyse légale faite :

1. **Construire l'intégration TTN en interne** (génération TEIF, gestion des certificats ANCE, soumission à El Fatoora) — lourd, mais te rend indépendante.
2. **T'appuyer sur un prestataire déjà connecté à El Fatoora** (des solutions tunisiennes existent déjà sur ce créneau) via son API, plutôt que de reconstruire cette brique réglementaire toi-même — probablement plus rapide et plus sûr pour une première version du Palier 3, quitte à internaliser plus tard si le volume le justifie.

---

## 7. Ordre de construction recommandé

1. Schéma de données complet (Business / User / BusinessMembership dès le départ, même si Phase 1 n'en exploite qu'une partie).
2. Palier 1 : saisie + calcul du chiffre d'affaires réel.
3. Palier 2 : historique/graphiques, impayés, stock, notifications.
4. Lancement Phase 1, collecte de retours réels sur la rétention et l'usage.
5. Pendant que Phase 1 tourne : validation légale de la facturation électronique (section 6) en parallèle du développement.
6. Palier 3 une fois la conformité légale clarifiée : facturation, choix OCR, gestion fournisseurs, activation du multi-utilisateur déjà préparé dans le schéma.

---

## 8. Questions ouvertes à trancher avant de démarrer le développement

- Quel fournisseur de paiement en ligne en TND pour les abonnements ?
- Confirmation légale : GiraView Palier 3 doit-il s'intégrer à El Fatoora dès son lancement, et pour quel profil de client (seuils) ?
- Quelle API OCR pour le scan de facture fournisseur ?
- Faut-il des SMS pour les rappels d'impayés/stock, et via quel fournisseur local ?
- App web (PWA) seule au départ, ou app native prévue à moyen terme ?

---

*Document préparé comme brief de démarrage — les sections 6 et 8 doivent être tranchées avant de lancer le développement du Palier 3 spécifiquement ; les Paliers 1 et 2 peuvent démarrer dès maintenant sur la base de ce document.*
