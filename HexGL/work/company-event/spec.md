# Spécification — Personnalisation événementielle HexGL (ACME)

Sources : `formation/tickets/company-event.md` (besoin), `formation/identite/charte_graphique_acme.pdf` (v1.0, 09/2026), `formation/identite/logo.png`, `docs/architecture.md`.

## 1. Contexte et objectif

ACME utilise HexGL lors d'un événement d'entreprise. L'écran d'accueil actuel (menu `step-1`) porte le branding d'origine de HexGL (BKcore) : fond image animé, titre HexGL, palette bleu/orange. Il doit refléter l'identité visuelle d'ACME : logo, couleurs de la charte, nom de l'entreprise, message d'accueil.

Le jeu lui-même (gameplay, contrôles, HUD, rendu en course) ne change pas. Le résultat attendu est une intégration sobre et maintenable (charte p.4).

## 2. Exigences fonctionnelles

| Id | Exigence |
|---|---|
| F1 | L'écran d'accueil affiche le logo ACME fourni (`logo.png`), visible dès l'ouverture de la page. |
| F2 | L'écran d'accueil affiche le message d'accueil « Bienvenue au ACME Racing Challenge » (formulation exacte de la charte, y compris « au »). |
| F3 | Le nom de l'entreprise « ACME » apparaît sur l'écran d'accueil (par le logo et le message d'accueil) et dans le titre d'onglet du navigateur. |
| F4 | Le fond de l'écran d'accueil est sombre ; violet, bleu électrique et cyan sont utilisés comme accents (titres, entrées de menu actives, bouton principal). |
| F5 | L'entrée principale du menu, actuellement « Start », s'intitule « Démarrer la course ». |
| F6 | Les visuels d'origine HexGL de l'écran d'accueil (fond et titre d'origine) ne sont plus affichés. |

## 3. Comportements attendus

- Ouverture de la page : l'écran d'accueil s'affiche avec logo, message d'accueil et menu aux couleurs ACME, sans interaction préalable.
- Les entrées Controls, Quality, HUD et Credits se comportent comme avant (défilement des valeurs au clic, paramètres d'URL `controlType`, `quality`, `hud`, `godmode` pris en compte, valeurs par défaut identiques).
- Clic sur « Démarrer la course » : même enchaînement qu'avant (`step-2` → `step-3` → jeu → `step-5`).
- Survol et focus d'une entrée de menu : retour visuel net, en couleurs de la palette.
- Onglet du navigateur : le titre est aux couleurs de l'événement (nom ACME) au lieu de « HexGL by BKcore ».
- Les écrans hors accueil (aide contrôles, chargement, course, score, credits) restent tels quels.

## 4. Contraintes

**Identité visuelle (charte)**
- Palette : noir profond `#08090D` (fond principal), violet `#7628FF`, bleu électrique `#315BFF`, cyan `#00C4E8`, blanc `#FFFFFF` (texte / contraste), gris clair `#E6E8EE` (surfaces secondaires). Aucune autre couleur de marque.
- Dégradé événementiel autorisé : `#7628FF` → `#315BFF`.
- Jamais de gris moyen dominant.
- Logo : fichier fourni utilisé tel quel, sans déformation (ratio d'origine conservé, environ 3:1), sans recoloration, sans ombre ni contour, avec une zone de respiration autour, sur un fond où il reste lisible. Le logo fourni a un fond clair et un texte sombre : il n'existe pas de version claire, il doit donc être posé sur une surface claire (cf. charte p.1 et p.4), et non directement sur le fond sombre.
- Typographie : pas de nouvelle dépendance webfont ; la typographie existante est conservée si elle reste lisible. Titres en sans-serif à graisse forte.
- Pas d'effets additionnels complexes.

**Techniques et projet**
- Gameplay, contrôles et HUD en course strictement inchangés.
- Site statique sans build : pas de nouvel outil ni de nouvelle dépendance.
- L'écran doit rester utilisable sur écran de bureau et sur mobile / tactile (le jeu supporte le tactile).
- Le texte et les contrôles du menu restent lisibles (contraste suffisant sur le fond sombre).

## 5. Décisions de conception déjà imposées

- La charte et le ticket sont la référence ; en cas d'écart, le ticket décide du périmètre, la charte du rendu.
- Message d'accueil : « Bienvenue au ACME Racing Challenge » (charte p.4).
- Libellé du bouton principal : « Démarrer la course » (décision utilisateur, conforme à la charte p.4).
- Étendue : écran d'accueil + titre d'onglet uniquement (décision utilisateur).
- Fond sombre, accents violet / bleu / cyan ; logo sur surface claire.
- Les autres entrées du menu (Controls, Quality, HUD, Credits) gardent leurs libellés et valeurs d'origine.

## 6. Cas limites et gestion des erreurs

- **Logo introuvable ou illisible** : l'écran reste utilisable ; le nom « ACME » reste identifiable (texte alternatif) et le menu fonctionne.
- **WebGL non supporté** : le comportement existant est conservé (le bouton principal signale l'absence de WebGL et renvoie vers la page d'aide) ; ce message reste lisible dans le nouveau style.
- **Petit écran / portrait / mobile** : logo et message ne débordent pas, ne sont pas déformés ni rognés ; le menu reste entièrement accessible.
- **Très grand écran / plein écran d'événement** : le fond reste sombre sur toute la surface, sans bandes claires.
- **Paramètres d'URL** (`controlType`, `quality`, `hud`, `godmode`) : valeurs affichées dans le menu toujours cohérentes avec l'URL.
- **Retour depuis Credits** : l'écran d'accueil réapparaît avec son branding complet.
- **Retour à l'accueil après une course** (rechargement de page via `step-5`) : même rendu que la première ouverture.

## 7. Hors périmètre

- Gameplay, physique, contrôles, HUD, rendu 3D, audio, pistes.
- Écrans `step-2` (aide), `step-3` (chargement), `step-4` (course), `step-5` (score), `credits`, `leapinfo`.
- Métadonnées de partage (Open Graph, description), favicon, liens de partage, Google Analytics.
- Traduction des autres libellés du menu, ou de l'interface, en français.
- Création d'une version claire ou alternative du logo ; modification du fichier logo.
- Ajout d'une webfont, d'animations ou d'effets nouveaux.
- Correction des dettes et bugs listés dans `docs/architecture.md` (§4 et §6).
- Mise à jour des captures de référence `formation/tests/captures/` : elles contiennent l'ancien branding et ne servent pas de test automatique.

## 8. Critères d'acceptation

1. À l'ouverture de la page, le logo ACME est visible, non déformé (même ratio que `logo.png`), non recoloré, sans ombre ni contour, avec une marge autour.
2. Le texte « Bienvenue au ACME Racing Challenge » est affiché sur l'écran d'accueil, exactement comme dans la charte.
3. Le fond de l'écran d'accueil est sombre (`#08090D` ou dégradé de la palette) ; aucune couleur hors palette n'est utilisée pour la marque ; aucun élément d'identité HexGL d'origine (titre, fond) ne reste visible.
4. Le bouton principal affiche « Démarrer la course » ; Controls, Quality, HUD et Credits ont les libellés d'origine et fonctionnent comme avant.
5. Le titre d'onglet mentionne ACME et ne mentionne plus « HexGL by BKcore ».
6. Parcours complet validé : accueil → Démarrer la course → clic de continuation → chargement → course (compte à rebours, vaisseau pilotable, HUD identique à `formation/tests/captures/02-jeu-en-cours.png`) → écran de score → retour à l'accueil.
7. Une capture de l'écran d'accueil à plusieurs tailles (bureau, mobile portrait) montre une mise en page sans débordement, texte lisible, menu entièrement accessible.
8. Avec le fichier logo indisponible, l'écran d'accueil reste utilisable et « ACME » reste identifiable.
9. Les tests QUnit existants passent toujours (`cmd /c formation\tests\ci-chrome.bat` retourne 0).
10. Le diff ne touche ni le gameplay, ni le HUD, ni les écrans hors périmètre (vérifiable par relecture du diff).
