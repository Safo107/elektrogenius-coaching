// cookie-banner.js - ElektroGenius Lernportal Cookie Banner
(function() {
  const COOKIE_KEY = "eg-coaching-cookie-consent";

  function getCookie(name) {
    return localStorage.getItem(name);
  }

  function setCookie(name, value) {
    localStorage.setItem(name, value);
  }

  function createBanner() {
    if (getCookie(COOKIE_KEY)) return;

    const banner = document.createElement("div");
    banner.id = "eg-cookie-banner";
    banner.innerHTML = `
      <div style="
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #161b22;
        border-top: 1px solid rgba(0,198,255,0.3);
        padding: 16px 24px;
        z-index: 99999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      ">
        <div style="max-width: 900px; margin: 0 auto;">
          <div style="margin-bottom: 12px;">
            <span style="font-size: 15px; font-weight: 700; color: #e6edf3;">🍪 Cookies & Datenschutz</span>
            <p style="font-size: 13px; color: #8b949e; margin: 6px 0 0 0; line-height: 1.6;">
              Diese Website verwendet Cookies für eine bessere Nutzererfahrung und Analyse (Google Analytics).
              Weitere Informationen in unserer
              <a href="/datenschutz.html" style="color: #00c6ff; text-decoration: underline;">Datenschutzerklärung</a>.
            </p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button id="eg-cookie-reject" style="
              background: #21262d;
              color: #8b949e;
              border: 1px solid rgba(255,255,255,0.14);
              border-radius: 8px;
              padding: 9px 18px;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
            ">Nur notwendige</button>
            <button id="eg-cookie-accept" style="
              background: #f5a623;
              color: #000;
              border: none;
              border-radius: 8px;
              padding: 9px 18px;
              font-size: 13px;
              font-weight: 700;
              cursor: pointer;
            ">Alle akzeptieren</button>
            <a href="/impressum.html" style="
              color: #6e7681;
              font-size: 12px;
              text-decoration: none;
              align-self: center;
              margin-left: 8px;
            ">Impressum</a>
            <a href="/datenschutz.html" style="
              color: #6e7681;
              font-size: 12px;
              text-decoration: none;
              align-self: center;
            ">Datenschutz</a>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById("eg-cookie-accept").addEventListener("click", function() {
      setCookie(COOKIE_KEY, "accepted");
      document.getElementById("eg-cookie-banner").remove();
    });

    document.getElementById("eg-cookie-reject").addEventListener("click", function() {
      setCookie(COOKIE_KEY, "rejected");
      // Google Analytics deaktivieren falls vorhanden
      if (typeof window.gtag !== "undefined") {
        window["ga-disable-G-XXXXXXXX"] = true;
      }
      document.getElementById("eg-cookie-banner").remove();
    });
  }

  // Footer Links hinzufügen
  function createFooter() {
    const existingFooter = document.querySelector("footer");
    if (existingFooter) {
      const links = document.createElement("div");
      links.style.cssText = "text-align:center; padding: 12px; border-top: 1px solid rgba(255,255,255,0.08); margin-top: 8px;";
      links.innerHTML = `
        <a href="/impressum.html" style="color:#6e7681; font-size:12px; text-decoration:none; margin:0 8px;">Impressum</a>
        <span style="color:#6e7681; font-size:12px;">·</span>
        <a href="/datenschutz.html" style="color:#6e7681; font-size:12px; text-decoration:none; margin:0 8px;">Datenschutz</a>
        <span style="color:#6e7681; font-size:12px;">·</span>
        <span id="eg-cookie-settings" style="color:#6e7681; font-size:12px; cursor:pointer; margin:0 8px;">Cookie-Einstellungen</span>
      `;
      existingFooter.appendChild(links);

      document.getElementById("eg-cookie-settings").addEventListener("click", function() {
        localStorage.removeItem(COOKIE_KEY);
        createBanner();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      createBanner();
      createFooter();
    });
  } else {
    createBanner();
    createFooter();
  }
})();
