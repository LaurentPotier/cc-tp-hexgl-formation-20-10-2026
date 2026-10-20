# Plan technique — Branding ACME de l'écran d'accueil HexGL

## 1. Objectif

Appliquer l'identité ACME (logo, palette, nom, message « Bienvenue au ACME Racing Challenge », bouton « Démarrer la course », titre d'onglet) à l'écran d'accueil `step-1`, sans toucher au gameplay, avec toutes les valeurs de marque dans **un seul fichier de configuration**. Référence : `work/company-event/spec.md`. Aucun code n'est écrit à ce stade.

## 2. État actuel et architecture concernée

- Site statique ES5, scripts par `<script>` dans un ordre fixe, espace de noms global (`docs/architecture.md` §1, §3).
- Écran d'accueil = `#step-1` dans `index.html` : `#global` (fond `css/bg.jpg` animé), `#title` (`css/title.png`, animé), `#menucontainer > #menu` (entrées `#start`, `#s-controlType`, `#s-quality`, `#s-hud`, `#s-credits`).
- Les règles visuelles sont dans `css/multi.css` : fond blanc sur `html, body`, entrées de menu bleues avec barre blanche translucide et halo blanc, hover orange `#f66439`, `#start` orange.
- `launch.js` (compilé depuis `launch.coffee`) cible les éléments par id (`start`, `s-*`, `step-1`…), remplace le contenu de `#start` seulement si WebGL est absent, et s'exécute en dernier.
- Police existante : Bebas Neue (`css/fonts.css`), conservée (charte p.3 : « conserver la typographie existante si lisible »).
- Aucun test ne couvre `index.html` ni le CSS ; QUnit ne charge que `Utils.js` et `Timer.js` (`formation/tests/index.html`).
- Environnement : Python présent (`python.exe` dans `WindowsApps`, **à vérifier** : peut être le raccourci Microsoft Store), PHP et Node non confirmés.

## 3. Approche technique

Habillage par **ajout** plutôt que modification : un fichier de config + un petit script d'application, une feuille de style qui surcharge uniquement `#step-1`, et un balisage minimal dans `index.html`. Ni `launch.coffee`/`launch.js`, ni `bkcore/`, ni `libs/`, ni `multi.css` ne sont modifiés.

1. `branding.js` (racine, ES5, chargé juste avant `launch.js`) :
   - déclare la config (objet unique) ;
   - expose `apply(doc)` qui : fixe `doc.title`, renseigne `src`/`alt` du logo, le message d'accueil et le libellé de `#start`, et pose les couleurs comme variables CSS (`--brand-bg`, `--brand-violet`, …) sur `<html>` ;
   - s'applique tout de suite à l'exécution (script en fin de `body`, donc DOM prêt, et **avant** `launch.js` : le libellé WebGL de `launch.js` écrase donc le nôtre si besoin, comme aujourd'hui).
2. `css/branding.css` (chargé après `multi.css`, donc prioritaire à spécificité égale) : ne contient que des règles `#step-1`/`#title`/`#menu`/`#start`, lisant les couleurs via `var(--brand-…)`. Aucune valeur de couleur écrite en dur.
3. `index.html` : `#title` devient le bloc marque (carte claire avec `<img>` du logo + `<h1>` du message), `<link>` vers `branding.css`, `<script>` vers `branding.js`, `<title>` statique aligné sur le nom ACME (repli si JS absent).
4. Logo : copie de `formation/identite/logo.png` vers `css/acme-logo.png`. L'application ne dépend pas du dossier `formation/` (matériel de formation). Fichier non modifié, ratio imposé par `height: auto`.

## 4. Fichiers et modules impactés

| Fichier | Action |
|---|---|
| `branding.js` | **Nouveau** : config + `apply(doc)` |
| `css/branding.css` | **Nouveau** : surcharges de l'accueil |
| `css/acme-logo.png` | **Nouveau** : copie du logo officiel |
| `index.html` | Modifié : `<title>`, `<link>`, `<script>`, contenu de `#step-1 > #title` |
| `formation/tests/index.html` | Modifié : ajout de `<script src="../../branding.js">` (déjà modifié, non commité) |
| `formation/tests/browser-tests.js` | Modifié : module de tests « branding » (déjà modifié, non commité) |

Non touchés (à vérifier par `git diff --stat`) : `launch.coffee`, `launch.js`, `bkcore/`, `bkcore.coffee/`, `libs/`, `css/multi.css`, `css/fonts.css`, `cache.appcache`, `manifest.webapp`.

## 5. Structure des données de branding

```
// Un seul objet, valeurs de la charte (spec §4)
{
  eventName:    "ACME Racing Challenge",
  pageTitle:    "ACME Racing Challenge",
  welcome:      "Bienvenue au ACME Racing Challenge",
  startLabel:   "Démarrer la course",
  logo:         { src: "css/acme-logo.png", alt: "ACME" },
  colors: {
    background: "#08090D", violet: "#7628FF", blue: "#315BFF",
    cyan: "#00C4E8", white: "#FFFFFF", lightGray: "#E6E8EE"
  }
}
```

Le dégradé événementiel est construit en CSS à partir de `violet` → `blue` (pas de valeur dupliquée).

## 6. Décisions techniques principales

- **Config en JS, pas en JSON** : un `fetch`/XHR d'un JSON échoue en `file://` et ajoute de l'asynchrone ; une balise `<script>` marche partout, y compris dans la page de tests.
- **Variables CSS plutôt que préprocesseur** : pas de build ; les navigateurs visés par le jeu (WebGL, Chrome/Edge/Firefox récents) les supportent.
- **Surcharge par feuille séparée** : retour arrière = retirer 1 `<link>`, 1 `<script>` et revenir sur le contenu de `#title`. `multi.css` reste intact.
- **Fond sombre posé sur `#global`**, pas sur `body` : `#global` couvre déjà tout `#step-1` ; la course (`step-4`) et les écrans `step-2/3/5` ne sont pas affectés.
- **Logo non détouré** (fond blanc opaque, texte sombre) : posé dans une carte claire à coins arrondis avec marge, sans ombre ni contour (charte p.1 et p.4).
- **Logo introuvable** : le texte alternatif « ACME » s'affiche nativement, sans code supplémentaire.
- **Animations d'origine** (`anim`, `animbg`) neutralisées sur l'accueil (« pas d'effets complexes ») ; aucune animation ajoutée.
- **Menu** : on retire la barre blanche translucide et le halo blanc ; texte blanc, survol cyan, bouton principal en dégradé violet → bleu. La transformation `scaleY(0.8)` historique du menu est conservée (sans lien avec le logo).
- **`launch.js` non modifié** : tous les ids qu'il utilise sont conservés.

## 7. Risques et compatibilité

- **Retour arrière des tests** : `formation/tests/*` portent déjà des modifications non commitées (tests Utils/Timer). Un `git checkout` pour annuler le branding les détruirait. Avant l'étape 1, sauvegarder `git diff` dans un fichier hors dépôt (scratchpad) ; annuler à la main ou avec `git diff` ciblé, jamais par `checkout` global.
- **Spécificité CSS** : `#start:hover` utilise `!important` dans `multi.css` ; les surcharges de hover devront aussi l'utiliser.
- **Chevauchement logo / menu** sur écran bas (mobile paysage, 360×640) : `#title` et `#menucontainer` sont positionnés en absolu. À vérifier aux captures ; si besoin, limiter la hauteur de la carte logo (`max-height` en pourcentage) plutôt que de changer la structure.
- **WebGL absent** (cas d'un Chrome headless sans GPU) : `launch.js` remplace le libellé de `#start` par « WebGL is not supported! » ; lisible dans le nouveau style, mais la capture d'accueil headless peut montrer ce texte au lieu de « Démarrer la course ». Utiliser un navigateur avec GPU pour les captures de référence.
- **Titre statique dupliqué** : le nom apparaît dans `<title>` (repli sans JS) et dans la config. Écart accepté, signalé dans un commentaire.
- **Paquet Firefox OS** (`package.zip`, `cache.appcache`) : non régénéré ; hors périmètre (spec §7).
- **Poids du logo** : 2172×724 ; affiché à ~500 px de large, fichier non modifié (charte). Vérifier la taille réelle avant copie.
- **`cSpell`/IDE** : les avertissements sur le français sont sans effet.

## 8. Stratégie de tests et de vérification

- **Existants** : `cmd /c formation\tests\ci-chrome.bat` (depuis `HexGL/`), attendu code 0, à rejouer après chaque étape (CLAUDE.md).
- **Nouveaux tests QUnit** (module « branding », ajoutés au fichier existant, sans nouvelle dépendance) :
  1. la config contient les clés requises et le message exact « Bienvenue au ACME Racing Challenge » ;
  2. chaque couleur est un hexadécimal de la palette de la charte ;
  3. `apply(doc)` sur un document détaché (`document.implementation.createHTMLDocument`) renseigne titre, message, libellé de `#start`, `src`/`alt` du logo ;
  4. `apply(doc)` ne plante pas si un élément cible est absent.
- **Lancement du jeu sans Node** : depuis `HexGL/`, `python -m http.server 8000` (puis `http://localhost:8000/`) ; repli `py -m http.server` ou `php -S localhost:8000`. Vérifier d'abord `python --version`. Le skill `/run-hexgl` suppose Node/Playwright : on ne l'utilise pas.
- **Vérification visuelle** : l'outil de navigation Playwright déjà disponible dans la session (pas une dépendance du dépôt) ou Chrome/Edge `--screenshot --window-size=…`. Tailles : 1920×1080, 1366×768, 390×844 (portrait), 844×390 (paysage). Captures « après » rangées dans `work/company-event/captures/` ; les captures de référence `formation/tests/captures/` ne sont pas touchées.
- **Gameplay inchangé** : `git diff --stat` montre uniquement les fichiers du tableau §4 ; parcours complet (accueil → Démarrer → clic → chargement → décompte → course → score → retour) avec comparaison visuelle de la course à `02-jeu-en-cours.png`, console du navigateur sans erreur nouvelle.
- **Cas limites** : logo renommé temporairement (alt visible), `?quality=2&hud=0` (menu cohérent avec l'URL), Credits aller-retour, rechargement après `step-5`.

## 9. Plan d'implémentation (aucun commit avant validation finale)

**Étape 1 — Config et module testé** (réversible : 3 fichiers)
Sauvegarder le `git diff` actuel ; lancer le serveur Python et prendre les captures « avant » (bureau, mobile). Créer `branding.js` (config + `apply`), copier le logo vers `css/acme-logo.png`, ajouter le script et les 4 tests à `formation/tests/`.
*Vérif :* `ci-chrome.bat` = 0 avec les nouveaux tests ; `index.html` du jeu inchangé et toujours fonctionnel.

**Étape 2 — Branchement dans la page**
Modifier `index.html` : `<title>`, balisage du bloc marque dans `#title`, `<script src="branding.js">` avant `launch.js`. Pas encore de CSS.
*Vérif :* page chargée sans erreur console ; titre d'onglet ACME ; message et libellé « Démarrer la course » présents ; clic Start → `step-2` OK ; `ci-chrome.bat` = 0.

**Étape 3 — Habillage visuel**
Créer `css/branding.css` (fond sombre, carte logo, message, menu, bouton, hover, responsive) et l'ajouter après `multi.css`.
*Vérif :* captures aux 4 tailles (pas de débordement, texte lisible, menu entièrement accessible) ; plus aucun visuel HexGL d'origine ; Credits aller-retour ; `ci-chrome.bat` = 0.

**Étape 4 — Cas limites**
Logo indisponible, paramètres d'URL, WebGL absent (message lisible), rechargement après course.
*Vérif :* checklist spec §6 ; corrections CSS ciblées uniquement.

**Étape 5 — Validation finale puis commit par l'utilisateur**
Parcours complet de jeu, `git diff --stat` (aucun fichier hors §4), `ci-chrome.bat` = 0, relecture de la spec §8 point par point. Présenter le résultat ; le commit n'est fait qu'après validation explicite.
