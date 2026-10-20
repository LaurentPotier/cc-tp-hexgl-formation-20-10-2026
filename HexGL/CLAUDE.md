# HexGL

Site statique (voir `docs/architecture.md`). Lancer le jeu : skill `/run-hexgl`.

## Tests

- QUnit local, sans Node : `formation/tests/browser-tests.js` (tests) et `formation/tests/index.html` (scripts chargés : `Utils.js`, `Timer.js`).
- Windows : `cmd /c formation\tests\ci-chrome.bat` (depuis `HexGL/`). Linux : `bash formation/tests/ci-chrome.sh`.
- Codes de retour : 0 réussi, 1 échec (voir `formation/tests/rapport_erreur.html`), 2 exécution impossible.
- Manuel : ouvrir `formation/tests/index.html` dans un navigateur.
- Pour tester un nouveau module, ajouter son `<script>` dans `formation/tests/index.html`.

## Captures de référence

`formation/tests/captures/` : `01-accueil.png` (menu) et `02-jeu-en-cours.png` (course, HUD visible), prises avant refactoring. Elles incluent le branding actuel, qui doit changer plus tard : ne pas s'en servir comme test automatique.
