/* Tests du code existant HexGL, sans Node.js. QUnit est chargé localement. */
(function () {
  "use strict";
  if (typeof QUnit === "undefined") {
    document.documentElement.dataset.testStatus = "fail";
    document.documentElement.dataset.testCount = "0";
    document.documentElement.dataset.testFailures = "1";
    document.body.insertAdjacentHTML("afterbegin", "<p style='color:red'>QUnit introuvable : vérifiez le fichier vendor/qunit-2.26.0.js</p>");
    return;
  }

  // Compatible avec le script Chrome headless existant : état mesurable dans le DOM.
  QUnit.done(function (result) {
    const count = result.total;
    const failed = result.failed;
    const root = document.documentElement;
    root.setAttribute("data-test-count", String(count));
    root.setAttribute("data-test-failures", String(failed));
    root.setAttribute("data-test-status", failed === 0 && count >= 4 ? "pass" : "fail");
    let summary = document.getElementById("summary");
    if (!summary) {
      summary = document.createElement("p");
      summary.id = "summary";
      document.body.appendChild(summary);
    }
    summary.textContent = count + " test(s) : " + (count - failed) + " réussi(s), " + failed + " échec(s).";
  });

  const U = window.bkcore && window.bkcore.Utils;
  QUnit.module("HexGL — bkcore.Utils", function () {
    QUnit.test("updateClass ajoute une classe", function (assert) {
      assert.ok(U, "Utils.js chargé");
      const e = document.createElement("div");
      e.id = "test-hexgl-add";
      document.getElementById("qunit-fixture").appendChild(e);
      U.updateClass(e.id, "active", true);
      assert.true(e.classList.contains("active"));
    });
    QUnit.test("updateClass supprime une classe", function (assert) {
      assert.ok(U, "Utils.js chargé");
      const e = document.createElement("div");
      e.id = "test-hexgl-remove";
      e.className = "active";
      document.getElementById("qunit-fixture").appendChild(e);
      U.updateClass(e.id, "active", false);
      assert.false(e.classList.contains("active"));
    });
    QUnit.test("getOffsetTop additionne les décalages parent/enfant", function (assert) {
      const parent = {
        offsetTop: 37,
        offsetParent: null
      };
      const enfant = {
        offsetTop: 13,
        offsetParent: parent
      };
      assert.strictEqual(U.getOffsetTop(enfant), 50);
    });
    QUnit.test("getURLParameter lit les paramètres d'URL", function (assert) {
      assert.ok(U, "Utils.js chargé");
      U.URLParameters = null;
      const url = new URL(window.location.href);
      url.searchParams.set("hexgl_poc", "ok");
      // Le lanceur fournit hexgl_poc=ok ; en ouverture directe, on teste l'absence ou la présence.
      const expected = window.location.search.includes("hexgl_poc=ok") ? "ok" : null;
      assert.strictEqual(U.getURLParameter("hexgl_poc"), expected);
    });
    QUnit.test("getURLParameter renvoie undefined pour un paramètre absent", function (assert) {
      U.URLParameters = null;
      assert.strictEqual(U.getURLParameter("hexgl_inexistant"), undefined);
    });
    QUnit.test("getURLParameter lit plusieurs paramètres (réglages du menu)", function (assert) {
      const avant = window.location.href;
      // Les réglages controlType/quality/hud/godmode sont lus ainsi par launch.js.
      history.replaceState(null, "", "?hexgl_poc=ok&quality=2&hud=0");
      try {
        U.URLParameters = null;
        assert.strictEqual(U.getURLParameter("quality"), "2");
        assert.strictEqual(U.getURLParameter("hud"), "0");
      } finally {
        history.replaceState(null, "", avant);
        U.URLParameters = null;
      }
    });
    QUnit.test("updateClass ignore un identifiant inconnu sans erreur", function (assert) {
      U.updateClass("hexgl-id-inexistant", "active", true);
      assert.ok(true, "pas d'exception");
    });
    QUnit.test("isTouchDevice renvoie un booléen", function (assert) {
      assert.strictEqual(typeof U.isTouchDevice(), "boolean");
    });
  });

  const T = window.bkcore && window.bkcore.Timer;
  QUnit.module("HexGL — bkcore.Timer", function () {
    QUnit.test("msToTime découpe les millisecondes en h/m/s/ms", function (assert) {
      assert.ok(T, "Timer.js chargé");
      // 1 h 2 min 3 s 456 ms
      assert.deepEqual(T.msToTime(3723456), { h: 1, m: 2, s: 3, ms: 456 });
      assert.deepEqual(T.msToTime(0), { h: 0, m: 0, s: 0, ms: 0 });
    });
    QUnit.test("msToTimeString complète avec des zéros (affichage chrono)", function (assert) {
      assert.deepEqual(T.msToTimeString(3723456), { h: "01", m: "02", s: "03", ms: "0456" });
      assert.deepEqual(T.msToTimeString(0), { h: "00", m: "00", s: "00", ms: "0000" });
    });
    QUnit.test("zfill complète à gauche sans tronquer", function (assert) {
      assert.strictEqual(T.zfill(7, 2), "07");
      assert.strictEqual(T.zfill(123, 2), "123");
      assert.strictEqual(T.zfill(0, 4), "0000");
    });
    QUnit.test("un Timer neuf est inactif, start l'active, pause la suspend", function (assert) {
      const t = new T();
      assert.false(t.active);
      assert.strictEqual(t.time.elapsed, 0);
      t.start();
      assert.true(t.active);
      assert.strictEqual(t.time.elapsed, 0);
      t.pause(true);
      assert.false(t.active);
      t.pause(false);
      assert.true(t.active);
    });
    QUnit.test("update n'avance pas tant que le Timer est inactif", function (assert) {
      const t = new T();
      t.update();
      assert.strictEqual(t.time.elapsed, 0);
      assert.strictEqual(t.time.delta, 0);
    });
    QUnit.test("getElapsedTime formate le temps écoulé via msToTime", function (assert) {
      const t = new T();
      t.time.elapsed = 61005;
      assert.deepEqual(t.getElapsedTime(), { h: 0, m: 1, s: 1, ms: 5 });
    });
  });

  const B = window.HexGLBranding;
  QUnit.module("HexGL — branding ACME", function () {
    // Document détaché : le titre et le style de la page de tests ne sont pas modifiés.
    function docAvec(html) {
      const d = document.implementation.createHTMLDocument("avant");
      d.body.innerHTML = html;
      return d;
    }
    QUnit.test("la config contient les clés requises et le message exact de la charte", function (assert) {
      assert.ok(B, "branding.js chargé");
      ["eventName", "pageTitle", "welcome", "startLabel", "logo", "colors"].forEach(function (k) {
        assert.ok(B.config[k], "clé " + k);
      });
      assert.strictEqual(B.config.welcome, "Bienvenue au ACME Racing Challenge");
      assert.strictEqual(B.config.startLabel, "Démarrer la course");
    });
    QUnit.test("les couleurs sont exactement la palette de la charte", function (assert) {
      assert.deepEqual(B.config.colors, {
        background: "#08090D",
        violet: "#7628FF",
        blue: "#315BFF",
        cyan: "#00C4E8",
        white: "#FFFFFF",
        lightGray: "#E6E8EE"
      });
    });
    QUnit.test("apply renseigne titre, logo, message, libellé du bouton et variables CSS", function (assert) {
      const d = docAvec('<img id="brand-logo"><h1 id="brand-welcome"></h1><div id="start">Start</div>');
      B.apply(d);
      assert.strictEqual(d.title, B.config.pageTitle);
      assert.strictEqual(d.getElementById("brand-logo").getAttribute("src"), B.config.logo.src);
      assert.strictEqual(d.getElementById("brand-logo").alt, B.config.logo.alt);
      assert.strictEqual(d.getElementById("brand-welcome").textContent, B.config.welcome);
      assert.strictEqual(d.getElementById("start").textContent, B.config.startLabel);
      const s = d.documentElement.style;
      assert.strictEqual(s.getPropertyValue("--brand-violet"), "#7628FF");
      assert.strictEqual(s.getPropertyValue("--brand-light-gray"), "#E6E8EE");
    });
    QUnit.test("apply ne plante pas si les éléments cibles sont absents", function (assert) {
      const d = docAvec("");
      B.apply(d);
      assert.strictEqual(d.title, B.config.pageTitle);
    });
  });

})();
