# Architecture de HexGL (état actuel)

Document descriptif de l'existant. Il ne contient ni recommandation ni plan de correction.

## 1. Stack et points d'entrée

| Élément | État actuel |
|---|---|
| Type | Site statique, jeu de course WebGL en un seul onglet. Pas de `package.json`, pas de build, pas de backend. |
| Langages | JavaScript (ES5, `var`, prototypes), CoffeeScript 1.7.1 (sources `.coffee` + `.js` compilés commités). |
| Moteur 3D | `libs/Three.dev.js` (Three.js ancien, API antérieure à r53 : `mat.n44`, `.texture` sur les uniforms). `libs/Three.r53.js` est présent mais n'est chargé que par `bkcore.coffee/tests.html`. |
| Post-traitement | `libs/ShaderExtras.js`, `libs/postprocessing/*` (EffectComposer, RenderPass, BloomPass, ShaderPass, MaskPass ; DotScreenPass et FilmPass présents mais non chargés). |
| Entrées | Clavier, tactile, gamepad, Leap Motion (`libs/leap-0.4.1.min.js`), orientation de l'appareil. |
| Audio | `bkcore/Audio.js` + fichiers `.ogg` dans `audio/`. |
| Tests | QUnit 2.26.0 local (`formation/tests/`), exécutable dans un navigateur ou en headless via `ci-chrome.bat` / `ci-chrome.sh`. |
| Exécution locale | Le jeu se sert en HTTP (pas en `file://` : les assets sont chargés par requêtes). Sans Node : `python -m http.server 8000 --bind 127.0.0.1` depuis `HexGL/`, puis `http://127.0.0.1:8000/index.html`. |

Points d'entrée :

- `index.html` : page unique. Elle déclare les écrans (`step-1` à `step-5`, `credits`, `leapinfo`) et charge tous les scripts par balises `<script>` dans un ordre fixe, sans bundler ni modules.
- `branding.js` : configuration unique du branding événementiel (ACME) et application au DOM. Chargé juste avant `launch.js`.
- `css/branding.css` : surcharge de `css/multi.css` pour l'écran `step-1`, chargé après lui.
- `launch.js` (compilé depuis `launch.coffee`) : script d'amorçage exécuté en dernier. Il branche le menu et crée `bkcore.hexgl.HexGL`.
- `formation/tests/index.html` : point d'entrée des tests QUnit.
- `manifest.webapp`, `package.webapp`, `cache.appcache`, `package.zip` : paquet Firefox OS / cache applicatif (v1.0.1-ffos).

## 2. Flux principal de lancement

1. `index.html` s'affiche sur l'écran `step-1` : un bloc marque (logo ACME dans une carte claire, message « Bienvenue au ACME Racing Challenge ») est centré verticalement avec le menu (« Démarrer la course », Controls, Quality, HUD, Credits ; l'entrée Godmode est masquée par `display: none`).
   `branding.js` s'exécute avant `launch.js` : il fixe `document.title`, renseigne le logo, le message et le libellé de `#start`, et pose les couleurs de la config en variables CSS `--brand-<clé en kebab-case>` sur `<html>`.
2. `launch.js` lit les paramètres d'URL `controlType`, `quality`, `hud`, `godmode` via `bkcore.Utils.getURLParameter`. Valeurs par défaut : contrôle clavier (tactile si l'appareil est tactile), qualité 3 (VERY HIGH), HUD activé, godmode désactivé. Chaque entrée de menu fait défiler ses valeurs au clic.
3. Test WebGL (`canvas.getContext("webgl")`, puis `"experimental-webgl"`). Sans WebGL, le bouton principal affiche « WebGL is not supported! » (ce qui écrase le libellé posé par `branding.js`) et renvoie vers `http://get.webgl.org/`.
4. Clic sur le bouton principal : affichage de `step-2` (« Click/Touch to continue »). Un nouveau clic masque `step-2`, affiche `step-3` (barre de progression) et appelle `init(...)`.
5. `init` construit `bkcore.hexgl.HexGL` (piste `Cityscape`, difficulté 0, mode `timeattack` par défaut) et appelle `hexGL.load(...)`, qui délègue à `track.load` (`bkcore/hexgl/tracks/Cityscape.js`) pour charger textures, géométries, analyseur de piste et sons. Les rappels `onProgress` alimentent `#progressbar`.
6. `onLoad` : `hexGL.init()` (HUD, matériaux, scènes, composer de rendu), bascule vers `step-4`, puis `hexGL.start()`.
7. `start()` lance la boucle `requestAnimationFrame` (`HexGL.update` : `gameplay.update` puis `manager.renderCurrent`) et appelle `initGameplay()`.
8. `Gameplay` déroule le décompte (« Get ready », 3, 2, 1, « Go »), active `ShipControls`, puis exécute le mode courant. À l'arrivée ou à la destruction (`end`), `step = 100`, puis `onFinish` appelle `HexGL.displayScore`.
9. `displayScore` affiche l'écran `step-5` avec le temps final. Un clic sur `step-5` recharge la page (`window.location.reload()`). La touche Échap appelle `HexGL.reset()`.

## 3. Modules, fichiers et assets

### Code applicatif (≈ 5 800 lignes hors `libs/`)

| Zone | Fichiers | Rôle |
|---|---|---|
| Jeu | `bkcore/hexgl/HexGL.js` (446 l.) | Façade : renderer, composers (bloom, FXAA), scènes, HUD, fin de course, scores. |
| | `bkcore/hexgl/Gameplay.js` (230 l.) | Machine à états du décompte, modes `timeattack`, `survival`, `replay`, points de contrôle, tours. |
| | `bkcore/hexgl/ShipControls.js` (806 l.) | Physique et entrées du vaisseau (clavier, tactile, Leap, gamepad). Plus gros fichier du jeu. |
| | `bkcore/hexgl/ShipEffects.js`, `CameraChase.js`, `HUD.js`, `RaceData.js` | Effets, caméra, interface, export/import de données de course. |
| | `bkcore/hexgl/tracks/Cityscape.js` (521 l.) | Unique piste : chargement des assets, matériaux, scènes, analyseur d'image de piste. |
| | `bkcore/hexgl/Ladder.js` | Classement en ligne (non chargé par `index.html`). |
| Three.js maison | `bkcore/threejs/RenderManager.js`, `Shaders.js` (949 l.), `Particles.js`, `Loader.js` | Gestion des rendus, shaders personnalisés, particules, chargeur de ressources. |
| | `bkcore/threejs/Preloader.js` | Préchargeur (non chargé par `index.html`). |
| Audio | `bkcore/Audio.js` | Lecture / arrêt / volume par nom (`bg`, `wind`, `boost`, `crash`, `destroyed`). |
| Branding | `branding.js` | Config unique (nom, titre, message d'accueil, libellé du bouton, logo, palette de la charte ACME) et `apply(doc)`, exposés en `window.HexGLBranding`. Le dégradé violet → bleu est construit en CSS à partir de la config. |
| Utilitaires compilés | `bkcore.coffee/Utils.js`, `Timer.js`, `ImageData.js` | Helpers DOM/URL/XHR/matériau normal, chronomètre, accès pixels. |
| | `bkcore.coffee/controllers/{Touch,Orientation,Gamepad}Controller.js` | Contrôleurs d'entrée. |
| | `bkcore.coffee/threejs/Particles.js` | Doublon de `bkcore/threejs/Particles.js` (versions différentes, voir §5). |

L'espace de noms global est `bkcore` (`bkcore.hexgl`, `bkcore.threejs`, `bkcore.Utils`, `bkcore.Timer`, `bkcore.Audio`). Chaque fichier se déclare avec `var bkcore = bkcore || {}`. Le couplage passe par des globales (`THREE`, `bkcore`, `window.hexGL`).

### Assets

| Dossier | Contenu | Taille |
|---|---|---|
| `audio/` | 5 fichiers `.ogg` + licence | 2,1 Mo |
| `geometries/` | `ships/feisar`, `tracks/cityscape`, `tracks/edge`, `bonus/base`, `booster/booster.js` | 1,3 Mo |
| `textures/` | `ships`, `tracks/cityscape`, `skybox`, `hud`, `particles`, `bonus`, `checker.png` | 4,2 Mo |
| `textures.full/` | Même arborescence que `textures/` | 5,3 Mo |
| `css/` | `multi.css`, `branding.css`, `fonts.css`, `touchcontroller.css`, `acme-logo.png` (copie non modifiée de `formation/identite/logo.png`, 2172×724), police Bebas Neue (eot/svg/ttf/woff), images d'aide et mobile. `bg.jpg` et `title.png` ne sont plus affichés sur l'accueil. | |
| `replays/cityscape-casual/` | `bkcore.replay.json` | 604 Ko (avec le dossier) |
| `libs/` | Three.js, Leap, DAT.GUI, Stats, Detector, postprocessing, `Editor.html` + `Editor_files/` | 1,6 Mo |
| `formation/` | `identite/` (charte ACME PDF, logo), `tickets/company-event.md`, `tests/` | |

## 4. Dépendances et zones legacy à risque

- **Three.js très ancien** : API de matrices et d'uniforms spécifique (`mat.n14`, `uniforms[...].texture`). Deux copies cohabitent (`Three.dev.js` utilisé par le jeu, `Three.r53.js` utilisé par une page de test).
- **Dépendances chargées mais non utilisées par le code applicatif** : `Stats.js`, `DAT.GUI.min.js`, `Detector.js` ne sont référencées ni par `launch.js` ni par `bkcore/`.
- **Services externes codés en dur** : Google Analytics `ga.js` (compte `UA-26274524-4`, protocole `http://www.google-analytics.com` ou `https://ssl...`), métadonnées Open Graph et favicon pointant vers `hexgl.bkcore.com`, `fb:admins`, liens de partage Twitter / Facebook dans `HexGL.displayScore`.
- **Détection de plateforme et navigateur d'époque** : `ActiveXObject` dans `Utils.request`, `experimental-webgl`, `navigator.MaxTouchPoints`, `msMaxTouchPoints`, `event.keyCode`.
- **Mode strict partiel** : `HexGL.js` déclare `'use strict'` au niveau fichier, les autres fichiers non.
- **Compilation CoffeeScript** : les `.js` du dossier `bkcore.coffee/` et `launch.js` sont générés par CoffeeScript 1.7.1. Aucun script de compilation n'existe dans le dépôt, les `.coffee` et `.js` sont versionnés ensemble.
- **Chemins hétérogènes** : `bkcore/` contient du JavaScript écrit à la main, `bkcore.coffee/` contient les modules compilés, `index.html` mélange les deux répertoires.
- **Paquet Firefox OS** : `manifest.webapp`, `package.webapp`, `package.zip` (161 fichiers) et `cache.appcache` décrivent un déploiement antérieur. `package.zip` est un binaire de 3,2 Mo versionné.
- **Éditeur annexe** : `libs/Editor.html` et `libs/Editor_files/` (jQuery 1.8, Ace, Kinetic, gamecore) ne sont pas liés au jeu.
- **Persistance** : `localStorage` (clés `score-<piste>-<difficulté>` et `race-<piste>-replay`).
- **Pas de `.gitignore`** dans le dépôt, alors que `formation/tests/README.md` en recommande un pour `rapport_erreur.html`.
- **Affichage de `#step-1`** : `launch.js` remet `#step-1` en `display: block` en ligne (retour depuis Credits). Un `display: flex` ou `grid` posé sur `#step-1` serait donc perdu ; le centrage de l'accueil passe par le conteneur interne `#brand-center`.
- **Ids imposés par `launch.js`** : `start`, `s-controlType`, `s-quality`, `s-hud`, `s-godmode`, `s-credits`, `step-1` à `step-5`, `credits`, `progressbar`, `main`, `overlay`. Les renommer casse le menu ou le chargement.
- **Ordre de chargement du branding** : `branding.js` s'applique à l'exécution (script en fin de `body`, avant `launch.js`). Sur la page de tests, qui n'a pas de `#start`, il ne touche ni au titre ni au style.
- **Surcharge CSS** : `branding.css` est chargé après `multi.css` et gagne à spécificité égale. `#start:hover` porte un `!important` dans `multi.css` ; le bouton principal est donc ciblé par `#menu #start`.
- **Variables CSS** : l'accueil dépend du support des propriétés personnalisées (navigateur récent), ce qui n'est pas garanti pour le paquet Firefox OS.
- **Titre dupliqué** : le nom ACME figure dans `<title>` (valeur de repli statique) et dans `branding.js` ; les deux sont à tenir ensemble.
- **Branding d'origine restant** : `<meta>` Open Graph (dont `og:site_name` « HexGL by BKcore »), favicon, liens de partage, Google Analytics et `<html lang="en">` n'ont pas été rebrandés.
- **Paquet Firefox OS** : `cache.appcache` et `package.zip` ne listent pas `branding.js`, `css/branding.css` ni `css/acme-logo.png`.

## 5. Fonctions et modules testables automatiquement

### Tests QUnit existants (`formation/tests/`)

`formation/tests/index.html` charge `vendor/qunit-2.26.0.js`, `../../bkcore.coffee/Utils.js`, `../../bkcore.coffee/Timer.js`, `../../branding.js` et `browser-tests.js`. Il redirige vers `?hexgl_poc=ok` si le paramètre est absent. À la fin, `QUnit.done` écrit `data-test-status` (`pass` si 0 échec **et** au moins 4 tests), `data-test-count` et `data-test-failures` sur `<html>`. `ci-chrome.sh` / `ci-chrome.bat` lancent Chrome, Chromium ou Edge en headless (`--dump-dom`, `--virtual-time-budget=5000`) et traduisent ce marqueur en code de retour 0 (réussi), 1 (échoué) ou 2 (impossible).

Tests présents : 18 tests dans 3 modules.

| Module | Tests | Fonctions couvertes |
|---|---|---|
| « HexGL — bkcore.Utils » | 8 | `updateClass` (ajout, suppression, id inconnu), `getOffsetTop`, `getURLParameter` (lecture, paramètre absent, plusieurs paramètres), `isTouchDevice` |
| « HexGL — bkcore.Timer » | 6 | `msToTime`, `msToTimeString`, `zfill`, `start` / `pause`, `update` inactif, `getElapsedTime` |
| « HexGL — branding ACME » | 4 | config (clés requises, message exact), palette de la charte, `apply` sur un document détaché (`document.implementation.createHTMLDocument`), `apply` sans éléments cibles |

Le seuil « au moins 4 tests » de `QUnit.done` est inchangé. `index.html` et le CSS ne sont pas couverts par QUnit : le rendu de l'accueil se vérifie dans le navigateur. Les autres modules ne sont pas testés.

### Fonctions pures ou quasi pures, atteignables sans WebGL

| Module | Fonctions | Remarque |
|---|---|---|
| `bkcore.Utils` | `getURLParameter`, `getOffsetTop`, `updateClass`, `isTouchDevice`, `scrollTo` | Dépendent uniquement du DOM / `window`. Toutes sont couvertes sauf `scrollTo`. |
| `bkcore.Timer` | `msToTime`, `msToTimeString`, `start`, `pause`, `update`, `getElapsedTime` | Calculs sur millisecondes, aucune dépendance Three.js. Couvert (sauf `update` en marche, qui dépend de l'horloge). |
| `bkcore.ImageData` | construction et lecture de pixels | Nécessite un canvas / une image. |
| `bkcore.hexgl.RaceData` | `tick`, `export`, `import` | Dépend d'un objet `shipControls`, simulable par un double. |
| `bkcore.hexgl.Gameplay` | transitions de `step`, `simu`, `end`, `checkPoint` | Dépend de `shipControls`, `hud`, `analyser`, simulables par doubles. |
| `bkcore.Audio` | `play`, `stop`, `volume` | Dépend des éléments audio du navigateur. |

### Non testables simplement en l'état

`HexGL.js`, `ShipControls.js`, `Cityscape.js`, `RenderManager.js`, `Shaders.js`, `Loader.js` : dépendent de `THREE`, d'un contexte WebGL et des assets. `launch.js` s'exécute dès le chargement et manipule directement le DOM de `index.html`.

## 6. Bugs, dettes et anomalies remarquables

Constats relevés à la lecture du code, non corrigés.

1. **`JSON.Stringify`** (`HexGL.js`, enregistrement du record local) : `JSON.Stringify` n'existe pas, le nom correct est `JSON.stringify`. L'appel lève un `TypeError` lors d'un nouveau record local.
2. **Classement `Ladder` incohérent** : `Ladder.js` utilise `bkcore.Ladder.global` (hors de `bkcore.hexgl`) alors que le tableau est défini dans `bkcore.hexgl.Ladder.global`. `Ladder.js` n'est pas chargé par `index.html`, pourtant la fin de `HexGL.displayScore` référence `bkcore.hexgl.Ladder.global[t][d]` et `bkcore.hexgl.Ladder.displayLadder` (voir point 3). Dans `displayLadder`, la condition `!bkcore.Ladder.global[track][mode] == undefined` compare un booléen à `undefined` (toujours faux), et la variable `m` calculée n'est pas utilisée dans la boucle.
3. **Chemin « détaillé » de `displayScore` quasi mort** : le bloc qui utilise les éléments `finish`, `finish-state`, `finish-ladder`, etc. n'est atteint que si `this.gameover === null` ; `launch.js` passe toujours `gameover: $ 'step-5'`. Ces éléments n'existent pas dans `index.html`.
4. **`Utils.request`** : le commentaire annonce « `postData` true = POST, false = GET » mais le code teste `postData != null` (donc `false` déclenche aussi un POST). La chaîne `?o=bk&...` est ajoutée à `url` à l'intérieur de la boucle sur `data` (concaténations répétées si plusieurs clés). La boucle de `createXMLHTTPObject` itère jusqu'à `length` inclus. Le code n'est appelé que par `Ladder.load`, lui-même non appelé.
5. **`Timer.msToTime`** : la source CoffeeScript écrit `{h:h, m:m, s:s, ms,ms}` (virgule au lieu de deux-points) ; le `.js` compilé contient la clé `ms` en double.
6. **Doublon `Particles`** : `bkcore.coffee/threejs/Particles.js` (210 l.) et `bkcore/threejs/Particles.js` (190 l.) ont des contenus différents ; seule la seconde est chargée par `index.html`.
7. **Références cassées** : `manifest.webapp` pointe vers `/index-mobile.html`, absent du dépôt. `bkcore.coffee/tests.html` référence `Timer.js`, `ImageData.js` et `Three.r53.js` mais ne contient aucun test.
8. **Code mort / désactivé** : `//if(this.a[15] == "o")` commenté dans `HexGL.start` (la propriété `this.a = window.location.href` n'a plus d'usage actif) ; `Ladder.js`, `Preloader.js` non chargés ; « Ladder save — Undisclosed » en commentaire ; entrée de menu Godmode masquée.
9. **Qualité LOW** : `width` et `height` sont divisés par 2 dans le constructeur (`quality === 0`), avec un commentaire de correspondance plateforme/qualité qui ne reflète plus les options du menu actuel.
10. **Menu et textes** : `index.html` affiche « Quality: High » alors que `launch.js` initialise la qualité à 3 (« VERY HIGH »), le texte étant remplacé au chargement du script. Le libellé « Start » de `index.html` est de même remplacé par `branding.js`.
11. **Couverture de tests partielle** : seuls `Utils.js`, `Timer.js` et `branding.js` sont testés ; le test `getURLParameter` produit un résultat différent selon que la page est ouverte directement ou via `ci-chrome` (valeur attendue calculée à partir de `window.location.search`).
12. **Divers** : clé Google Analytics et identifiants Facebook en clair dans `index.html` ; `package.zip` et copies `textures.full/` + `textures/` dupliquent des assets ; la balise `<html lang="en">` est conservée alors que `formation/` est rédigé en français.