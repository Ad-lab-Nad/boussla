# PIBA — Cahier des charges technique

Document de brief destiné à Claude Code (ou tout développeur) pour construire PIBA : un outil de gestion simple pour commerçantes et petites entreprises tunisiennes, structuré en 3 paliers qui suivent le parcours réel d'une commerçante qui grandit.

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
- **Transaction** — vente ou dépense : montant, type (revenu/dépense), catégorie (voir liste ci-dessous), date, note, `is_business` (dépense pro ou personnelle), `receipt_photo_url` (photo optionnelle du reçu/ticket), `recurring_template_id` (lien vers un modèle de dépense récurrente, nullable). C'est la table centrale du Palier 1 — voir la section 3 pour le détail de la logique de saisie des dépenses.
- **ExpenseCategory** — catégories de dépenses prédéfinies mais éditables par l'utilisatrice (fournisseurs/stock, loyer, salaires/main-d'œuvre, transport/livraison, factures et charges, remboursements de dettes, divers). Une liste de départ fixe évite l'écueil du champ libre que personne ne remplit.
- **RecurringExpenseTemplate** — mémorise une dépense qui revient régulièrement (même fournisseur, loyer mensuel) : catégorie, montant habituel, périodicité approximative. Sert à pré-remplir la saisie suivante plutôt qu'à automatiser (l'utilisatrice valide toujours).
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

- Saisie rapide d'une vente (montant, date — 2 champs, pensé pour aller vite sur mobile).
- **Saisie de dépense approfondie** — c'est le point sur lequel insister, parce que le flou sur les dépenses est une cause directe de "je ne sais pas si je gagne vraiment de l'argent" :
  - Catégorie choisie dans une liste courte et prédéfinie (fournisseurs/stock, loyer, salaires/main-d'œuvre, transport/livraison, factures et charges, remboursements de dettes, divers) plutôt qu'un champ texte libre — le champ libre est rarement rempli sérieusement, la liste courte augmente le taux de catégorisation réelle.
  - Bascule explicite **dépense pro / dépense perso** à la saisie. C'est le point le plus important : beaucoup de commerçantes solos mélangent l'argent du commerce et l'argent personnel dans la même caisse, ce qui fausse tout calcul de rentabilité si l'app ne fait pas la distinction.
  - Photo du reçu/ticket en pièce jointe optionnelle, même sans extraction automatique (l'OCR arrive seulement au Palier 3) — utile comme aide-mémoire pour les dépenses en cash sans ticket clair.
  - Suggestion automatique de catégorie + montant pour une dépense récurrente déjà vue (même fournisseur, loyer mensuel), que l'utilisatrice confirme ou modifie plutôt que de ressaisir de zéro.
- Écran principal : un seul chiffre mis en avant — "Ce mois-ci, vous avez gagné X TND" (chiffre d'affaires moins dépenses), pas un tableau de bord chargé.
- Historique simple du mois en cours.

Complexité technique : faible à moyenne. CRUD standard + un calcul d'agrégation ; la seule brique un peu plus fournie est la gestion des catégories/modèles récurrents, qui reste simple techniquement (pas d'IA nécessaire ici, juste une bonne UX de saisie).

### Palier 2 — Analyse et suivi (Phase 1)

- Historique complet sur l'année, avec graphique de tendance (revenu/dépense par mois).
- **Vue "où part mon argent"** : répartition visuelle des dépenses par catégorie (celles définies au Palier 1) sur le mois ou l'année — répond directement à "vous savez en quoi vous dépensez plus d'argent ?". Permet aussi de comparer dépenses pro vs perso dans le temps.
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
- **Internationalisation (i18n)** : app utilisable en **arabe, français et anglais** dès le Palier 1 — voir détail en 4.1.

### 4.1 Internationalisation — à construire dès le Palier 1

Même logique que le schéma de données (section 2) : le coût de faire les choses correctement dès le départ est faible, le coût de retrofit après coup est élevé (chaque écran doit être repassé un par un pour extraire ses textes en dur).

- **Toutes les chaînes de texte externalisées dès le premier écran** (fichiers de traduction type `fr.json` / `ar.json` / `en.json`, jamais de texte en dur dans le code), même si une seule langue est réellement traduite au lancement.
- **L'arabe change la direction de mise en page**, pas seulement le texte : prévoir dès le départ un système de layout qui supporte `dir="rtl"` (miroir des marges, alignements, icônes directionnelles comme les flèches "suivant/précédent") plutôt qu'une mise en page figée en LTR — un composant construit sans y penser demande souvent une réécriture CSS complète une fois l'arabe ajouté.
- **Police adaptée à l'arabe** (ex. Cairo, Tajawal, ou équivalent lisible sur mobile) distincte de la police latine utilisée pour le français/anglais.
- **Choix de la langue** : détection automatique à partir de la langue du téléphone à la première ouverture, avec sélecteur manuel dans les réglages pour changer à tout moment (ne pas forcer un choix irréversible à l'inscription).
- **Formats locaux** : devise toujours en TND, mais dates/nombres formatés selon la langue active (ex. `12 sept. 2026` en français vs. équivalent en arabe).
- **Priorité de traduction au lancement** : le français est la langue de travail principale pour construire le Palier 1/2 ; traduire en arabe et anglais peut suivre en Phase 1 sans bloquer le lancement, **à condition que l'architecture ci-dessus soit en place dès le début** — sinon chaque langue ajoutée plus tard coûte un chantier de refactoring, pas juste un fichier de traduction.
- Un futur assistant IA en langage naturel (voir question ouverte, section 8) devra gérer les mêmes trois langues — à garder en tête si cette fonctionnalité est confirmée, car la variante parlée (derja tunisienne) diffère de l'arabe standard écrit utilisé pour l'interface.

---

## 5. OCR pour le scan de facture fournisseur (Palier 3)

Ne pas construire de moteur de reconnaissance d'écriture/texte maison — c'est un projet de recherche en soi, pas une fonctionnalité qu'une petite équipe peut développer de façon fiable. Utiliser une API tierce existante spécialisée dans la lecture de documents/factures (ex. des services de reconnaissance de documents disponibles chez les grands fournisseurs cloud, ou des API spécialisées dans l'extraction de données de factures). Prévoir systématiquement un écran de relecture/correction après le scan : la qualité dépendra de la netteté des photos prises par les utilisatrices, donc l'OCR doit être un assistant qui pré-remplit, jamais une source de vérité automatique.

---

## 6. Point de vigilance majeur : conformité de la facturation en Tunisie

C'est le sujet le plus important à valider avant de développer le Palier 3 — ce n'est pas qu'une question technique, c'est une question légale qui peut changer la portée du projet.

**Ce qui est confirmé** (Article 18 du Code de la TVA tunisien) : une facture doit obligatoirement comporter la date de l'opération, l'identification et l'adresse du client, le numéro de carte d'identification fiscale (matricule fiscal) de l'émetteur, la désignation du bien/service avec le prix hors taxe, le taux et le montant de la TVA, et une numérotation chronologique ininterrompue des factures.

**Ce qui nécessite une vérification légale avant de construire quoi que ce soit** : selon les sources consultées, la Tunisie généralise depuis le 1er janvier 2026 la **facturation électronique obligatoire** pour les assujettis à la TVA, via un système appelé **El Fatoora**, opéré par TTN (Tunisie TradeNet). D'après ces sources, une facture électronique conforme demanderait la génération d'un fichier structuré au format **TEIF (XML)**, une **signature électronique** (norme XAdES-B) obtenue via un certificat délivré par l'ANCE (Agence Nationale de Certification Électronique), et une soumission au système de validation d'El Fatoora avec accusé de réception.

Je n'ai pas pu confirmer avec certitude : les seuils exacts (est-ce que ça concerne toutes les entreprises assujetties dès le premier TND de chiffre d'affaires, ou seulement au-delà d'un certain seuil), le calendrier définitif de mise en application des sanctions (une source indique que ce point restait en discussion parlementaire), et si de très petites structures (le profil de ta cible Palier 1/2) sont concernées dès maintenant ou seulement dans un second temps. **Je ne suis pas expert-comptable ni fiscaliste — avant de construire le Palier 3, il faut impérativement faire valider ces points par un comptable ou un avocat fiscaliste tunisien**, pour savoir précisément ce que "facture conforme" doit vouloir dire pour du logiciel que PIBA va livrer.

Si l'obligation d'intégration à El Fatoora se confirme pour ta cible, ça change la portée technique du Palier 3 de façon importante — deux options possibles, à trancher une fois l'analyse légale faite :

1. **Construire l'intégration TTN en interne** (génération TEIF, gestion des certificats ANCE, soumission à El Fatoora) — lourd, mais te rend indépendante.
2. **T'appuyer sur un prestataire déjà connecté à El Fatoora** (des solutions tunisiennes existent déjà sur ce créneau) via son API, plutôt que de reconstruire cette brique réglementaire toi-même — probablement plus rapide et plus sûr pour une première version du Palier 3, quitte à internaliser plus tard si le volume le justifie.

---

## 7. Ordre de construction recommandé

1. Schéma de données complet (Business / User / BusinessMembership dès le départ, même si Phase 1 n'en exploite qu'une partie) **et** architecture i18n (textes externalisés, support RTL) — les deux fondations à poser avant d'écrire le premier écran, voir sections 2 et 4.1.
2. Palier 1 : saisie + calcul du chiffre d'affaires réel.
3. Palier 2 : historique/graphiques, impayés, stock, notifications.
4. Lancement Phase 1, collecte de retours réels sur la rétention et l'usage.
5. Pendant que Phase 1 tourne : validation légale de la facturation électronique (section 6) en parallèle du développement.
6. Palier 3 une fois la conformité légale clarifiée : facturation, choix OCR, gestion fournisseurs, activation du multi-utilisateur déjà préparé dans le schéma.

---

## 8. Questions ouvertes à trancher avant de démarrer le développement

- **Le nom "PIBA" (Personal Intelligent Business Assistant) engage-t-il une vraie fonctionnalité d'assistant intelligent ?** Point non tranché à ce stade. Si oui, ça ajoute une brique IA au périmètre (ex. répondre en langage naturel à "pourquoi mes ventes ont baissé ce mois-ci" à partir des données de l'utilisatrice) — un chantier distinct des 3 paliers décrits en section 3, à scoper séparément (modèle utilisé, coût par requête). L'interface elle-même doit déjà gérer arabe/français/anglais (section 4.1, tranché) ; si un assistant IA conversationnel est confirmé, il devra en plus comprendre la derja tunisienne parlée, qui diffère de l'arabe standard écrit de l'interface. Si non, "Intelligent" reste un choix de nom sans fonctionnalité dédiée, et les paliers restent tels que décrits dans ce document.
- Quel fournisseur de paiement en ligne en TND pour les abonnements ?
- Confirmation légale : PIBA Palier 3 doit-il s'intégrer à El Fatoora dès son lancement, et pour quel profil de client (seuils) ?
- Quelle API OCR pour le scan de facture fournisseur ?
- Faut-il des SMS pour les rappels d'impayés/stock, et via quel fournisseur local ?
- App web (PWA) seule au départ, ou app native prévue à moyen terme ?

---

*Document préparé comme brief de démarrage — les sections 6 et 8 doivent être tranchées avant de lancer le développement du Palier 3 spécifiquement ; les Paliers 1 et 2 peuvent démarrer dès maintenant sur la base de ce document.*
