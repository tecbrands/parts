(function () {
  // Our own visit record (27 Oct 2026, 4:00 to 4:15 am and 2:45 pm). No cookie, no storage, no third party: one small request per page view to the address in data/site.json (visitBeaconUrl).
  var U = "https://flt.app.n8n.cloud/webhook/site-visit", w = window, d = document, L = location, ref = d.referrer || "", t0 = Date.now(), v = "", half = 0, gone = 0;
  try { v = (new URLSearchParams(L.search).get("v") || "").slice(0, 64); } catch (e) {}
  function url(x) { return U + "?p=" + encodeURIComponent(L.pathname) + "&h=" + encodeURIComponent(L.hostname) + "&r=" + encodeURIComponent(ref) + (v ? "&v=" + encodeURIComponent(v) : "") + (x || ""); }
  function hit(x) { try { var i = new Image(1, 1); i.alt = ""; i.referrerPolicy = "no-referrer-when-downgrade"; i.setAttribute("aria-hidden", "true"); i.src = url(x); } catch (e) {} }
  function send(x) { try { if (w.fetch) { fetch(url(x), { method: "GET", mode: "no-cors", keepalive: true, credentials: "omit", referrerPolicy: "no-referrer-when-downgrade" }); return; } } catch (e) {} hit(x); }
  w.fltBeacon = hit;
  hit("");
  // Engagement: one "half" when the visitor scrolls past 50% of a page that scrolls, one "exit" with the seconds on the page when the tab is hidden or closed. Nothing under one second.
  function scrolled() { var h = d.documentElement, max = Math.max(h.scrollHeight, d.body ? d.body.scrollHeight : 0) - (w.innerHeight || h.clientHeight); return max > 80 && (w.pageYOffset || h.scrollTop || 0) / max >= 0.5; }
  w.addEventListener("scroll", function () { if (!half && scrolled()) { half = 1; send("&e=half"); } }, { passive: true });
  function exit() { if (gone) return; var s = Math.round((Date.now() - t0) / 1000); if (s < 1) return; gone = 1; send("&e=exit&s=" + s); }
  d.addEventListener("visibilitychange", function () { if (d.visibilityState === "hidden") exit(); });
  w.addEventListener("pagehide", exit);
  // A tagged link (?v=) is held in this variable only. Links to our own hosts carry it to the next page, so the next page can send it too.
  if (v) { var carry = function (e) { var a = e.target && e.target.closest ? e.target.closest("a[href]") : null; if (!a) return; try { var u = new URL(a.href, L.href); if ((u.hostname === L.hostname || /(^|\.)firstlighttec\.com$/.test(u.hostname)) && !u.searchParams.has("v") && !(u.pathname === L.pathname && u.hostname === L.hostname && u.hash)) { u.searchParams.set("v", v); a.href = u.href; } } catch (x) {} }; d.addEventListener("click", carry, true); d.addEventListener("auxclick", carry, true); }
  // A request sent from this page (the form's thank-you box appears): one more hit, so the visit and the request line up.
  var sent = 0; new MutationObserver(function (ms) { if (sent) return; for (var i = 0; i < ms.length; i++) for (var j = 0; j < ms[i].addedNodes.length; j++) { var n = ms[i].addedNodes[j]; if (n.nodeType === 1 && (n.matches(".qf-done") || n.querySelector(".qf-done"))) { sent = 1; hit("&e=request"); return; } } }).observe(d.documentElement, { childList: true, subtree: true });
})();
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("consent","default",{ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",analytics_storage:"granted"});gtag("js",new Date());gtag("config","G-7FW8Q3YCPM",{allow_google_signals:false,allow_ad_personalization_signals:false});(function(){var s=document.createElement("script");s.async=true;s.src="https://www.googletagmanager.com/gtag/js?id=G-7FW8Q3YCPM";document.head.appendChild(s)})();
