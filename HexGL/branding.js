/*
  Branding événementiel : unique point de configuration (nom, textes, logo, couleurs).
  apply(doc) renseigne le titre, le logo (#brand-logo), le message (#brand-welcome),
  le libellé de #start et pose les couleurs en variables CSS --brand-<nom> sur <html>.
  Chargé juste avant launch.js : le texte « WebGL is not supported! » de launch.js
  écrase donc le libellé de #start quand WebGL est absent, comme avant.
*/
(function () {
  var branding = {
    eventName: "ACME Racing Challenge",
    pageTitle: "ACME Racing Challenge",
    welcome: "Bienvenue au ACME Racing Challenge",
    startLabel: "Démarrer la course",
    logo: { src: "css/acme-logo.png", alt: "ACME" },
    colors: {
      background: "#08090D",
      violet: "#7628FF",
      blue: "#315BFF",
      cyan: "#00C4E8",
      white: "#FFFFFF",
      lightGray: "#E6E8EE"
    }
  };

  function apply(doc) {
    var b = branding, el, name;
    doc.title = b.pageTitle;
    el = doc.getElementById("brand-logo");
    if (el) {
      el.src = b.logo.src;
      el.alt = b.logo.alt;
    }
    el = doc.getElementById("brand-welcome");
    if (el) el.textContent = b.welcome;
    el = doc.getElementById("start");
    if (el) el.textContent = b.startLabel;
    for (name in b.colors) {
      doc.documentElement.style.setProperty(
        "--brand-" + name.replace(/[A-Z]/g, function (c) { return "-" + c.toLowerCase(); }),
        b.colors[name]
      );
    }
  }

  window.HexGLBranding = { config: branding, apply: apply };
  // Page de tests : pas de #start, on n'y touche ni au titre ni au style.
  if (document.getElementById("start")) apply(document);
})();
