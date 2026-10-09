# Builds landing/ar.html from landing/index.html: Arabic (Tunisian derja for
# marketing copy, the app's own Arabic labels for the screen mockups), RTL.
import re, sys, urllib.parse
SRC, DST = sys.argv[1], sys.argv[2]
s = open(SRC, encoding="utf-8").read()

def rep(old, new, min_count=1):
    global s
    n = s.count(old)
    if n < min_count:
        sys.exit(f"MANQUANT ({n}x): {old[:90]}")
    s = s.replace(old, new)

def wa(text):
    return "https://wa.me/21623958603?text=" + urllib.parse.quote(text, safe="")

# ---------- <head> ----------
rep('<html lang="fr">', '<html lang="ar" dir="rtl">')
rep('<title>fluX — Combien avez-vous vraiment gagné ce mois-ci ?</title>',
    '<title>fluX — قدّاش ربحت بالحق هالشهر؟</title>')
rep("content=\"fluX calcule le chiffre d'affaires réel de votre commerce en 2 minutes par jour. Pensé pour les commerçants et commerçantes de Tunisie. Essai gratuit : 1er mois offert, démarrez en un clic.\"",
    'content="fluX يحسبلك رقم المعاملات والربح الحقيقي متاع تجارتك في دقيقتين في النهار. مصنوع للتجّار والتاجرات في تونس. تجربة مجانية: الشهر الأول بلاش."')
rep('content="fluX — Trouvez votre X."', 'content="fluX — لقى الـX متاعك."')
rep('content="Sachez enfin combien votre commerce vous rapporte. Essai gratuit : 1er mois offert, démarrez en un clic."',
    'content="اعرف أخيرًا قدّاش تربّحك تجارتك. تجربة مجانية: الشهر الأول بلاش."')
# Arabic fonts first in each family; Latin fonts stay for numbers/brand.
rep("family=Fraunces:", "family=Noto+Naskh+Arabic:wght@500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Fraunces:")
rep("--serif:'Fraunces',", "--serif:'Noto Naskh Arabic','Fraunces',")
rep("--sans:'Work Sans',", "--sans:'IBM Plex Sans Arabic','Work Sans',")
rep("--mono:'IBM Plex Mono',", "--mono:'IBM Plex Sans Arabic','IBM Plex Mono',")

RTL_CSS = """
  /* ---------- RTL (version arabe) ---------- */
  html[dir="rtl"] body{ letter-spacing:0; }
  html[dir="rtl"] .eyebrow, html[dir="rtl"] .mock-tag, html[dir="rtl"] .plan-badge{ letter-spacing:0; text-transform:none; }
  html[dir="rtl"] em{ font-style:normal; }
  html[dir="rtl"] h1, html[dir="rtl"] h2, html[dir="rtl"] h3{ line-height:1.45; }
  html[dir="rtl"] .cta-micro span::before{ margin-right:0; margin-left:6px; }
  html[dir="rtl"] .nav-tag{ margin-left:0; padding-left:0; border-left:none; margin-right:12px; padding-right:12px; border-right:1px solid var(--border); }
  html[dir="rtl"] .hero::before{ right:auto; left:-160px; }
  html[dir="rtl"] .strip-item + .strip-item{ border-left:none; border-right:1px solid var(--border); }
  @media (max-width:760px){ html[dir="rtl"] .strip-item + .strip-item{ border-right:none; } }
  html[dir="rtl"] .plan-badge{ right:auto; left:22px; }
  html[dir="rtl"] .plan li{ padding-left:0; padding-right:24px; }
  html[dir="rtl"] .plan li::before{ left:auto; right:0; }
  html[dir="rtl"] summary{ padding-right:20px; padding-left:52px; }
  html[dir="rtl"] summary::after{ right:auto; left:20px; }
  html[dir="rtl"] .btn svg{ transform:scaleX(-1); }
  html[dir="rtl"] .num, html[dir="rtl"] input[type="tel"]{ direction:ltr; unicode-bidi:isolate; }
  .lang-switch{ font-size:13px; font-weight:600; color:var(--muted); text-decoration:none; padding:8px 6px; }
  .lang-switch:hover{ color:var(--ink); }
"""
rep("</style>", RTL_CSS + "</style>", 1)

# ---------- announce + nav ----------
rep('<b>Essai gratuit&nbsp;: 1<sup>er</sup> mois offert</b> · <a href="/signup" data-cta="announce">Commencer maintenant →</a>',
    '<b>تجربة مجانية: الشهر الأول بلاش</b> · <a href="/signup" data-cta="announce">ابدا توّا ←</a>')
rep('aria-label="Navigation principale"', 'aria-label="القائمة الرئيسية"')
rep('<span class="nav-tag">Trouvez votre X.</span>', '<span class="nav-tag">لقى الـX متاعك.</span>')
rep('<a class="nav-login" href="/login" data-cta="login">Se connecter</a>',
    '<a class="lang-switch" href="/" data-cta="lang-fr" lang="fr">FR</a>\n      <a class="nav-login" href="/login" data-cta="login">تسجيل الدخول</a>')

# ---------- CTA labels ----------
rep("Commencer l'essai gratuit</a>", "ابدا التجربة المجانية</a>")
rep("<span>Commencer l'essai gratuit</span>", "<span>ابدا التجربة المجانية</span>")
rep(">Je commence mon essai gratuit<", ">نبدا التجربة المجانية متاعي<")
rep(">Demander une démo</a>", ">اطلب ديمو</a>")
rep(">Essayer le Palier 1 gratuitement</a>", ">جرّب الباقة 1 بلاش</a>")
rep(">Essayer le Palier 2 gratuitement</a>", ">جرّب الباقة 2 بلاش</a>")

# ---------- hero ----------
rep(">Pour les commerçants et commerçantes de Tunisie<", ">للتجّار والتاجرات في تونس<")
rep('<h1>Combien <span style="white-space:nowrap">avez-vous</span> <em>vraiment</em> gagné ce mois-ci&nbsp;?</h1>',
    '<h1>قدّاش ربحت <em>بالحق</em> هالشهر؟</h1>')
rep(">fluX calcule votre vrai bénéfice&nbsp;: chiffre d'affaires livré, coût réel, dépenses, impayés et stock, au même endroit, depuis votre téléphone.<",
    ">fluX يحسبلك الربح الحقيقي: البيع المسلَّم، التكلفة الحقيقية، المصاريف، الكريدي والسلعة، الكلّ في بلاصة وحدة، ومن تليفونك.<")
rep('<span><b>Essai gratuit</b> · 1<sup>er</sup> mois offert</span>', '<span><b>تجربة مجانية</b> · الشهر الأول بلاش</span>')
rep('<span>1<sup>er</sup> mois gratuit</span>', '<span>الشهر الأول مجاني</span>')
rep('<span>Sans paiement pour démarrer</span>', '<span>بلا خلاص باش تبدا</span>')
rep('<span>Accompagnement 1 à 1</span>', '<span>مرافقة شخصية</span>')
rep(">Exemple · données fictives<", ">مثال · أرقام وهمية<")

# ---------- app mockups (the app's own Arabic labels) ----------
for fr, ar in [
    ("Tableau de bord : bénéfice net, trésorerie, impayés, commandes", "لوحة التحكم: الربح الصافي، السيولة، المبالغ غير المدفوعة، الطلبات"),
    ("Tableau de bord : chiffre d'affaires, coût réel, dépenses", "لوحة التحكم: رقم الأعمال، التكلفة الحقيقية، المصاريف"),
    ("Tableau de bord : évolution du chiffre d'affaires sur 6 mois", "لوحة التحكم: تطور رقم الأعمال على 6 أشهر"),
    ("Tableau de bord : produits vendus et alertes de stock", "لوحة التحكم: المنتجات المباعة وتنبيهات المخزون"),
    ("Version arabe du tableau de bord", "لوحة التحكم بالعربية"),
    ("Exemples d'écrans de l'application", "أمثلة من شاشات التطبيق"),
    ('aria-label="En bref"', 'aria-label="باختصار"'),
]:
    rep(fr, ar)
for fr, ar in [
    ("Tableau de bord", "لوحة التحكم"), ("Bénéfice net réel", "الربح الصافي الحقيقي"),
    ("Trésorerie du mois (cash)", "السيولة النقدية للشهر"), ("Montant impayé", "المبلغ غير المدفوع"),
    ("Commandes en cours", "طلبات قيد التنفيذ"), ("Commandes retournées", "طلبات مُرجعة"),
    ("CA (livré)", "رقم الأعمال (المسلَّم)"), ("Coût réel", "التكلفة الحقيقية"),
    ("Dépenses (pub, etc.)", "المصاريف (إشهار، إلخ.)"), ("Évolution du CA", "تطور رقم الأعمال"),
    ("CA (livré) et bénéfice net réel, 6 derniers mois.", "رقم الأعمال (المسلَّم) والربح الصافي الحقيقي، آخر 6 أشهر."),
    ("Bénéfice net", "الربح الصافي"), ("Produits les plus vendus", "المنتجات الأكثر مبيعًا"),
    ("Classés par quantité livrée ce mois-ci.", "مرتبة حسب الكمية المسلَّمة هذا الشهر."),
    ("Détail des produits vendus ce mois", "تفاصيل المنتجات المباعة هذا الشهر"),
    ("PRODUIT", "المنتج"), ("QUANTITÉ LIVRÉE", "الكمية المسلَّمة"), ("CA GÉNÉRÉ", "رقم الأعمال المحقَّق"),
    ("Total", "المجموع"), ("Alertes stock", "تنبيهات المخزون"),
    ("Savon artisanal (lot de 3)", "صابون تقليدي (3 حبّات)"), ("Savon artisanal", "صابون تقليدي"),
    ("Huile d'argan 50 ml", "زيت أرغان 50 مل"), ("Crème hydratante", "كريم مرطّب"),
    ("Sérum vitamine C", "سيروم فيتامين C"), ("Masque à l'argile", "قناع بالطين"), ("Gommage corps", "مقشّر للجسم"),
    ("Total", "المجموع"),
]:
    s = s.replace(">" + fr + "<", ">" + ar + "<")
s = re.sub(r">▲\s\+(\d+)\s%\svs\smois\sdernier<", lambda m: f">▲ +{m.group(1)}% مقارنة بالشهر الماضي<", s)
s = re.sub(r">(\d+)\slivrés<", lambda m: f">{m.group(1)} مسلَّمة<", s)
s = re.sub(r">(\d+)\srestants<", lambda m: f">{m.group(1)} متبقية<", s)
s = re.sub(r">Commandes\sen\scours<", ">طلبات قيد التنفيذ<", s)
s = re.sub(r">Commandes\sretournées<", ">طلبات مُرجعة<", s)
# Every mock app reads right-to-left like the real Arabic app.
s = s.replace('<div class="app">', '<div class="app" dir="rtl">')
for fr, ar in [
    (">Chiffre d'affaires, coûts, dépenses<", ">رقم الأعمال، التكاليف، المصاريف<"),
    (">Bénéfice net, trésorerie, impayés<", ">الربح الصافي، السيولة، الكريدي<"),
    (">L'évolution sur 6 mois<", ">التطوّر على 6 أشهر<"),
    (">Produits vendus et alertes stock<", ">السلعة المباعة وتنبيهات المخزون<"),
    (">Aussi disponible en arabe<", ">متوفّر بالعربي، بالفرنسي وبالأنقليزي<"),
    (">Écrans réels de l'application, avec des données d'exemple (fictives).<", ">شاشات حقيقية من التطبيق، بأرقام مثال (وهمية).<"),
    (">Dans l'app<", ">في التطبيق<"),
    (">Ce que vous voyez en ouvrant fluX<", ">شنوّة تشوف كي تحلّ fluX<"),
]:
    rep(fr, ar)

# ---------- strip ----------
for fr, ar in [
    ('<span class="t">TND</span>', '<span class="t">د.ت</span>'),
    ('<span class="t">FR · AR · EN</span>', '<span class="t">عربي · FR · EN</span>'),
    (">Pensé pour la Tunisie, en dinars, pas adapté d'un outil étranger.<", ">مصنوع لتونس، بالدينار، موش أداة أجنبية مبدّلة.<"),
    (">L'application existe en français, en arabe et en anglais.<", ">التطبيق متوفّر بالعربي، بالفرنسي وبالأنقليزي.<"),
    ('<span class="t">1 à 1</span>', '<span class="t">وجهًا لوجه</span>'),
    (">Une vraie personne vous accompagne au démarrage, pas un robot.<", ">عبد حقيقي يعاونك في البداية، موش روبو.<"),
]:
    rep(fr, ar)

# ---------- problem ----------
for fr, ar in [
    (">Vous vous reconnaissez&nbsp;?<", ">تعرف روحك؟<"),
    (">Trois questions que tout commerçant se pose, sans réponse claire<", ">ثلاثة أسئلة يسألها كل تاجر، وما يلقالهاش جواب واضح<"),
    (">« Est-ce que je gagne vraiment de l'argent&nbsp;? »<", ">« نربح فلوس بالحق؟ »<"),
    (">Les ventes en cash, les dépenses du commerce et celles de la maison finissent dans la même caisse. Difficile de savoir ce qu'il reste à la fin du mois.<",
     ">البيع بالكاش، مصاريف الحانوت ومصاريف الدار، الكلّ في نفس الكاسة. صعيب تعرف شنوّة يقعدلك في آخر الشهر.<"),
    (">« Où part mon argent, et qui me doit encore&nbsp;? »<", ">« وين تمشي فلوسي، وشكون مازال يتسالني؟ »<"),
    (">Sans suivi, les petites dépenses s'additionnent en silence et les clients qui doivent de l'argent finissent par être oubliés.<",
     ">بلا متابعة، المصاريف الصغار تتلمّ بالشوية بالشوية، والكليان اللي عندهم كريدي يتنساو.<"),
    (">« Mon stock va-t-il tenir&nbsp;? »<", ">« السلعة باش تكفّي؟ »<"),
    (">Découvrir qu'un produit est épuisé au moment où un client le demande, plutôt que juste avant.<",
     ">تكتشف اللي سلعة وفات وقت اللي كليان يطلبها، عوض ما تعرف قبل.<"),
    ('Avec fluX, vous avez <em>la réponse</em> en un coup d\'œil.', 'مع fluX، عندك <em>الجواب</em> في لمحة.'),
]:
    rep(fr, ar)

# ---------- benefits ----------
for fr, ar in [
    (">Ce que vous gagnez<", ">شنوّة تربح<"),
    (">Votre commerce, piloté depuis votre téléphone<", ">تجارتك، تتحكّم فيها من تليفونك<"),
    (">Votre vrai bénéfice net<", ">الربح الصافي الحقيقي متاعك<"),
    (">Chiffre d'affaires livré, moins le coût réel de vos produits, moins vos dépenses (pub, etc.). Le bénéfice se calcule tout seul.<",
     ">البيع المسلَّم، ناقص التكلفة الحقيقية متاع السلعة، ناقص المصاريف (إشهار وغيرو). الربح يتحسب وحدو.<"),
    (">La trésorerie du mois<", ">سيولة الشهر<"),
    (">Le cash du mois, affiché à côté de votre bénéfice, pour savoir ce que vous avez vraiment en main.<",
     ">الكاش متاع الشهر، حذا الربح متاعك، باش تعرف شنوّة عندك بالحق في يدك.<"),
    (">Les impayés, enfin visibles<", ">الكريدي، أخيرًا قدّام عينيك<"),
    (">Le montant que vos clients vous doivent encore, directement sur votre tableau de bord.<",
     ">الفلوس اللي مازالت تسالها لحرفائك، مباشرة في لوحة التحكم.<"),
    (">Vos commandes sous contrôle<", ">الطلبات متاعك تحت السيطرة<"),
    (">Commandes en cours, livrées, retournées&nbsp;: tout est suivi au même endroit.<",
     ">الطلبات اللي قاعدة، المسلَّمة، والمرجوعة: الكلّ متتبَّع في بلاصة وحدة.<"),
    (">Les produits qui rapportent<", ">السلعة اللي تربّح<"),
    (">Vos produits les plus vendus en quantité, et le chiffre d'affaires généré par chacun, ce mois-ci.<",
     ">السلعة اللي تتباع أكثر بالكمية، وقدّاش جابت كل وحدة، هالشهر.<"),
    (">Stock et alertes<", ">المخزون والتنبيهات<"),
    (">Stock des matières et des produits finis, avec une alerte quand un produit passe sous son seuil.<",
     ">مخزون المواد الأولية والسلعة الجاهزة، مع تنبيه كي تنقص سلعة تحت الحدّ متاعها.<"),
]:
    rep(fr, ar)

# ---------- steps ----------
for fr, ar in [
    (">Comment démarrer<", ">كيفاش تبدا<"),
    (">Trois étapes, la première tient en un clic<", ">ثلاثة مراحل، الأولى بكليك واحد<"),
    ("<h3>Cliquez sur «&nbsp;Commencer l'essai gratuit&nbsp;»</h3>", "<h3>اكليكي على «ابدا التجربة المجانية»</h3>"),
    (">Un seul clic. Aucun formulaire à remplir pour démarrer.<", ">كليك واحد، وتسجيل في دقيقة.<"),
    (">On vous accompagne<", ">نرافقوك<"),
    (">Une personne de l'équipe fluX vous aide à démarrer, à votre rythme.<", ">واحد من فريق fluX يعاونك باش تبدا، على راحتك.<"),
    ("<h3>Votre 1<sup>er</sup> mois est offert</h3>", "<h3>الشهر الأول هدية</h3>"),
    (">Vous saisissez vos ventes et vos dépenses, et vous voyez votre chiffre du mois.<", ">تكتب البيع والمصاريف، وتشوف رقم الشهر متاعك.<"),
    ('<span>Ou <a href="#demo" style="color:var(--primary-dark);font-weight:600;">demandez d\'abord une démo</a></span>',
     '<span>ولا <a href="#demo" style="color:var(--primary-dark);font-weight:600;">اطلب ديمو قبل</a></span>'),
]:
    rep(fr, ar)

# ---------- testimonials (hidden) ----------
rep(">Ils utilisent fluX<", ">يستعملوا fluX<")
rep(">Ce que disent les premiers utilisateurs<", ">شنوّة يقولوا أوّل المستعملين<")
rep(">« CITATION RÉELLE ICI. »<", ">« شهادة حقيقية هنا. »<")
rep(">Prénom, type de commerce, ville<", ">الاسم، نوع التجارة، المدينة<")

# ---------- pricing ----------
for fr, ar in [
    (">Tarifs<", ">الأسعار<"),
    (">Simple à comprendre, comme le reste<", ">ساهلة تتفهم، كيف الباقي<"),
    (">L'essai gratuit d'un mois est valable sur les deux paliers. Vous choisissez celui qui vous convient, et vous pourrez en changer plus tard.<",
     ">التجربة المجانية متاع شهر صالحة للباقتين. تختار اللي يناسبك، وتنجم تبدّل بعد.<"),
    ('<span class="plan-name">Palier 1</span>', '<span class="plan-name">الباقة 1</span>'),
    ('<span class="plan-name">Palier 2</span>', '<span class="plan-name">الباقة 2</span>'),
    ('<span>TND / mois</span>', '<span>د.ت / الشهر</span>'),
    ('<span class="plan-first">1<sup>er</sup> mois offert</span>', '<span class="plan-first">الشهر الأول بلاش</span>'),
    (">Pour savoir, chaque mois, si vous gagnez vraiment de l'argent.<", ">باش تعرف، كل شهر، إذا تربح فلوس بالحق.<"),
    (">Saisie rapide des ventes<", ">تسجيل البيع بالخفّة<"),
    (">Dépenses catégorisées, pro ou perso<", ">مصاريف مرتّبة، متاع الخدمة ولا الدار<"),
    (">Un chiffre clair&nbsp;: ce que vous avez gagné<", ">رقم واضح: قدّاش ربحت<"),
    (">Le plus complet<", ">الأكمل<"),
    (">Pour suivre où part l'argent, qui vous doit encore, et votre stock.<", ">باش تتبّع وين تمشي الفلوس، شكون مازال يتسالك، والسلعة متاعك.<"),
    (">Tout le Palier 1<", ">الكلّ متاع الباقة 1<"),
    (">Historique et tendances sur l'année<", ">التاريخ والتطوّر على العام<"),
    (">Suivi des impayés<", ">متابعة الكريدي<"),
    (">Alertes de stock<", ">تنبيهات المخزون<"),
    ('<b>Bientôt</b> Palier 3 · 79 TND / mois : facturation et suivi des fournisseurs. En préparation.',
     '<b>قريب</b> الباقة 3 · 79 د.ت / الشهر: الفواتير ومتابعة المزوّدين. قاعدين نحضّروها.'),
]:
    rep(fr, ar)

# Palier 2: extra feature line (Arabic page only).
rep(">الكلّ متاع الباقة 1</li>", ">الكلّ متاع الباقة 1</li>\n            <li><b>تحليل</b> يوريك إذا تجارتك قاعدة تتطوّر ولا لا</li>")

# ---------- demo ----------
for fr, ar in [
    (">Voir avant de se lancer<", ">شوف قبل ما تبدا<"),
    (">Demandez une démo avant de vous lancer<", ">اطلب ديمو قبل ما تبدا<"),
    (">Laissez votre prénom et votre numéro. Votre message est prêt dans WhatsApp, il ne reste qu'à l'envoyer. Et si vous préférez essayer tout de suite, l'essai gratuit vous attend.<",
     ">خلّيلنا اسمك ونومروك. الميساج يكون حاضر في واتساب، ما عليك كان تبعثو. وإذا تحب تجرّب توّا، التجربة المجانية تستنّى فيك.<"),
    ('>Votre prénom<', '>الاسم<'),
    ('placeholder="Prénom"', 'placeholder="الاسم"'),
    (">Merci d'indiquer votre prénom.<", ">من فضلك اكتب اسمك.<"),
    (">Votre numéro de téléphone<", ">نومرو التليفون<"),
    (">Merci d'indiquer un numéro de téléphone.<", ">من فضلك اكتب نومرو تليفون.<"),
    ('>Votre commerce <span style="font-weight:400;color:var(--muted);">(facultatif)</span><',
     '>التجارة متاعك <span style="font-weight:400;color:var(--muted);">(اختياري)</span><'),
    ('placeholder="Ex. : boutique de vêtements, pâtisserie…"', 'placeholder="مثلًا: حانوت حوايج، حلويات…"'),
    (">Demander ma démo sur WhatsApp<", ">نطلب الديمو على واتساب<"),
    (">Un message pré-rempli s'ouvre dans WhatsApp avec vos informations.<", ">يتحلّ ميساج حاضر في واتساب بالمعلومات متاعك.<"),
]:
    rep(fr, ar)
rep('href="https://wa.me/21623958603?text=Bonjour%2C%20je%20veux%20essayer%20fluX%20avec%20le%201er%20mois%20offert."',
    'href="' + wa("عسلامة، نحب نجرّب fluX بالشهر الأول بلاش.") + '"')

# ---------- FAQ ----------
for fr, ar in [
    (">Questions fréquentes<", ">أسئلة متكرّرة<"),
    (">Vous hésitez encore&nbsp;? C'est normal.<", ">مازلت متردّد؟ عادي.<"),
    (">Comment je paie, et quand&nbsp;?<", ">كيفاش نخلّص، ووقتاش؟<"),
    (">Votre premier mois est offert, donc rien à payer pour démarrer. Ensuite, pour l'instant, le paiement se fait en dinars, directement avec nous sur WhatsApp. Le paiement en ligne viendra plus tard.<",
     ">الشهر الأول بلاش، يعني ما تخلّص حتى شي باش تبدا. من بعد، توّا، الخلاص يكون بالدينار، مباشرة معانا على واتساب. الخلاص أونلاين جاي بعد.<"),
    (">Que se passe-t-il à la fin du mois offert&nbsp;?<", ">شنوّة يصير في آخر الشهر المجاني؟<"),
    (">Nous vous demandons si vous souhaitez continuer, et avec quel palier. Rien n'est prélevé automatiquement.<",
     ">نسألوك إذا تحب تكمّل، وبأنهي باقة. حتى شي ما يتنحّى وحدو.<"),
    (">Puis-je voir une démo avant de commencer&nbsp;?<", ">نجّم نشوف ديمو قبل ما نبدا؟<"),
    (">Oui. Remplissez le petit formulaire «&nbsp;Demander une démo&nbsp;» plus haut&nbsp;: votre message est prêt dans WhatsApp, il ne reste qu'à l'envoyer.<",
     ">إيه. عمّر الفورميلار الصغير «اطلب ديمو» الفوق: الميساج يكون حاضر في واتساب، ما عليك كان تبعثو.<"),
    (">Je ne suis pas à l'aise avec la technologie. Est-ce pour moi&nbsp;?<", ">ما نيش متعوّد على التكنولوجيا. هذا ينجم يكون ليّا؟<"),
    (">Oui, c'est justement pour vous. L'application est pensée pour le téléphone, en français, en arabe ou en anglais, et nous vous accompagnons personnellement au démarrage.<",
     ">إيه، هو بالضبط ليك. التطبيق مصنوع للتليفون، بالعربي، بالفرنسي ولا بالأنقليزي، ونرافقوك شخصيًا في البداية.<"),
    (">Quelle différence entre le Palier 1 et le Palier 2&nbsp;?<", ">شنوّة الفرق بين الباقة 1 والباقة 2؟<"),
    (">Le Palier 1 vous donne votre chiffre du mois : ventes, dépenses, ce que vous avez gagné. Le Palier 2 ajoute l'historique de l'année, le suivi des impayés et les alertes de stock. Vous pouvez changer de palier à votre prochaine échéance.<",
     ">الباقة 1 تعطيك رقم الشهر: البيع، المصاريف، وقدّاش ربحت. الباقة 2 تزيد تاريخ العام، متابعة الكريدي وتنبيهات المخزون. تنجم تبدّل الباقة في الخلاص الجاي.<"),
    (">Je n'ai pas de stock, ou pas de clients à crédit. Est-ce utile&nbsp;?<", ">ما عنديش سلعة، ولا ما عنديش كليان بالكريدي. ينفعني؟<"),
    (">Oui. Le Palier 1 suffit pour savoir ce que vous gagnez, sans stock ni impayés à suivre.<", ">إيه. الباقة 1 تكفي باش تعرف قدّاش تربح، بلا سلعة ولا كريدي تتبّعو.<"),
    (">L'application existe en quelles langues&nbsp;?<", ">التطبيق بأنهي لغات؟<"),
    (">En français, en arabe et en anglais.<", ">بالعربي، بالفرنسي وبالأنقليزي.<"),
    (">Qui me répond sur WhatsApp&nbsp;?<", ">شكون يجاوبني على واتساب؟<"),
    (">Une personne de l'équipe fluX, pas un robot. Cette personne vous explique comment démarrer et répond à vos questions.<",
     ">واحد من فريق fluX، موش روبو. يفسّرلك كيفاش تبدا ويجاوب على أسئلتك.<"),
    (">Poser ma question sur WhatsApp</a>", ">نسأل على واتساب</a>"),
]:
    rep(fr, ar)

# ---------- final ----------
for fr, ar in [
    ('<span class="eyebrow">Trouvez votre X.</span>', '<span class="eyebrow">لقى الـX متاعك.</span>'),
    (">Votre premier mois est gratuit. Commencez en un clic.<", ">الشهر الأول بلاش. ابدا بكليك.<"),
    (">Lancez votre essai maintenant, ou demandez une démo si vous préférez d'abord voir l'application.<",
     ">ابدا التجربة توّا، ولا اطلب ديمو إذا تحب تشوف التطبيق قبل.<"),
    ('<span>En dinars</span>', '<span>بالدينار</span>'),
    ("Vous préférez appeler ou écrire par SMS&nbsp;?", "تحب تكلّمنا ولا تبعثلنا SMS؟"),
    ('type="button">Copier</button>', 'type="button">انسخ</button>'),
]:
    rep(fr, ar)

# ---------- footer + sticky ----------
for fr, ar in [
    (">Trouvez votre X. Fait pour les commerçants et commerçantes de Tunisie.<", ">لقى الـX متاعك. مصنوع للتجّار والتاجرات في تونس.<"),
    (">Déjà un compte ? Se connecter<", ">عندك حساب؟ ادخل<"),
    ('aria-label="fluX sur Instagram"', 'aria-label="fluX على إنستغرام"'),
    ('aria-label="fluX sur Facebook"', 'aria-label="fluX على فايسبوك"'),
    ('<small>1<sup>er</sup> mois gratuit · <a href="#demo" tabindex="-1" style="font-weight:600;">اطلب ديمو</a></small>',
     '<small>الشهر الأول مجاني · <a href="#demo" tabindex="-1" style="font-weight:600;">اطلب ديمو</a></small>'),
]:
    rep(fr, ar)

# ---------- script strings (WhatsApp demo message, copy button) ----------
for fr, ar in [
    ('"Bonjour, je voudrais une démo de fluX."', '"عسلامة، نحب ديمو متاع fluX."'),
    ('"Prénom : "', '"الاسم: "'),
    ('"Téléphone : "', '"التليفون: "'),
    ('"Commerce : "', '"التجارة: "'),
    ("btn.textContent = 'Copié'", "btn.textContent = 'تنسخ'"),
    ("btn.textContent = 'Copier'", "btn.textContent = 'انسخ'"),
]:
    rep(fr, ar)

open(DST, "w", encoding="utf-8").write(s)
print("OK", DST, len(s))
