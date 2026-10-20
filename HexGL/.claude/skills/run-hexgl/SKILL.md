---
name: run-hexgl
description: Run, start, launch or screenshot HexGL (jeu de course WebGL statique) avec Node et Playwright. Utiliser pour lancer le jeu, vérifier qu'il tourne ou prendre une capture.
---

HexGL est un site statique (pas de `package.json`, pas de build). Il se sert avec Node et se pilote avec les outils Playwright MCP (`mcp__playwright__browser_*`). Les chemins sont relatifs à `HexGL/`.

## Prérequis

- Node (testé avec v24.19.0), `npx` télécharge `http-server` à la volée.

## Lancer (chemin agent)

```bash
npx --yes http-server -p 8766 -s . >/dev/null 2>&1 &
sleep 8; curl -sI http://localhost:8766/index.html | head -1   # HTTP/1.1 200 OK
```

Puis, avec Playwright MCP :

1. `browser_navigate` sur `http://localhost:8766/index.html` (titre « HexGL by BKcore », menu START visible).
2. `browser_click` avec `target: "text=START"`.
3. `browser_click` avec `target: "#step-2"` (écran d'aide des contrôles « Click/Touch to continue » ; `#ctrl-help` existe en double, donc ambigu).
4. `browser_wait_for` 10 s (chargement du circuit).
5. `browser_press_key` `ArrowUp` (accélérer), puis `browser_take_screenshot`.

Résultat attendu : décompte, HUD (tour 1/3, vitesse, bouclier) et vaisseau visibles. Regarder la capture : un cadre vide = échec.

## Arrêter

```bash
powershell -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'http-server' | % { Stop-Process -Id \$_.ProcessId -Force }"
```

Vérifier : `curl -s -o /dev/null -w "%{http_code}" http://localhost:8766/index.html` renvoie `000`.

## Gotchas

- Console : ~10 avertissements WebGL `program not linked` (`libs/Three.dev.js:725`), sans erreur et sans effet visible sur le rendu.
- Un premier essai avec `python -m http.server` a servi une page « Pebbl » au lieu de HexGL (cause non élucidée) : s'en tenir à `http-server`.
- Playwright : `browser_click` prend `target` (sélecteur), pas `ref`/`element`.

## Non vérifié

Fin de course, options du menu (CONTROLS, QUALITY, HUD), tests QUnit du dossier `formation/`.
