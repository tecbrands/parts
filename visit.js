(function () {
  // Our own first-party events (27 Oct 2026, 6:20 pm, BRIDGE Contract 4). No tag manager, no third party. A link we send carries ?t=<token> and utm_*; both are kept in sessionStorage key flt.visit for the life of the tab (no cookie, no localStorage) and ride on every event.
  // Each event is one POST of JSON to its own address (data/site.json: eventUrls, default eventBase + the event name). Events marked extended send only while site.json extendedEvents is true.
  var C = {"u":{"landed":"https://flt.app.n8n.cloud/webhook/site-landed","cta_clicked":"https://flt.app.n8n.cloud/webhook/site-cta_clicked","form_submitted":"https://flt.app.n8n.cloud/webhook/site-form_submitted","store_viewed":"https://flt.app.n8n.cloud/webhook/site-store_viewed","trial_started":"https://flt.app.n8n.cloud/webhook/site-trial_started","booking":"https://flt.app.n8n.cloud/webhook/site-booking","visit":"https://flt.app.n8n.cloud/webhook/site-visit","engaged":"https://flt.app.n8n.cloud/webhook/site-engaged","left":"https://flt.app.n8n.cloud/webhook/site-left","form_started":"https://flt.app.n8n.cloud/webhook/site-form_started","cart_added":"https://flt.app.n8n.cloud/webhook/site-cart_added","checkout_started":"https://flt.app.n8n.cloud/webhook/site-checkout_started","outbound_clicked":"https://flt.app.n8n.cloud/webhook/site-outbound_clicked","lookup_query":"https://flt.app.n8n.cloud/webhook/site-lookup_query"},"x":false}, w = window, d = document, L = location, KEY = "flt.visit", t0 = Date.now(), V = {}, EXT = { visit: 1, engaged: 1, left: 1, form_started: 1, cart_added: 1, checkout_started: 1, outbound_clicked: 1, lookup_query: 1 };
  function ss(v) { try { if (v === undefined) return w.sessionStorage.getItem(KEY); w.sessionStorage.setItem(KEY, v); } catch (e) {} return null; }
  try { V = JSON.parse(ss() || "{}") || {}; } catch (e) { V = {}; }
  var arrived = false;
  try {
    var q = new URLSearchParams(L.search), t = (q.get("t") || "").slice(0, 64), u = {}, any = 0;
    ["source", "medium", "campaign", "content", "term"].forEach(function (k) { var x = q.get("utm_" + k); if (x) { u[k] = x.slice(0, 120); any = 1; } });
    if (t || any) { if (t) { V.t = t; arrived = true; } V.utm = V.utm || {}; for (var k in u) V.utm[k] = u[k]; ss(JSON.stringify(V)); }
  } catch (e) {}
  function mobile() { return !!(w.matchMedia && w.matchMedia("(max-width: 767px)").matches); }
  function emit(ev, f) {
    if (EXT[ev] && !C.x) return;
    var url = C.u[ev]; if (!url) return;
    var b = { event: ev }; if (V.t) b.t = V.t;
    b.ts = new Date().toISOString(); b.path = L.pathname; b.page_title = d.title; b.referrer = d.referrer || ""; b.device = mobile() ? "mobile" : "desktop";
    b.utm = {}; var U = V.utm || {}; for (var k in U) b.utm[k] = U[k];
    for (var j in f) b[j] = f[j];
    var s = JSON.stringify(b);
    // fetch with keepalive survives a closing page and sends no credentials, so the webhook can answer with a plain wildcard origin; sendBeacon always sends credentials, which a wildcard answer refuses, so it is only the fallback
    try { if (w.fetch) { w.fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: s, keepalive: true, credentials: "omit" }).catch(function () {}); return; } } catch (e) {}
    try { w.navigator.sendBeacon(url, new Blob([s], { type: "application/json" })); } catch (e) {}
  }
  w.fltEvent = function (ev, f) { emit(ev, f || {}); };
  w.fltVisit = function () { return V; };
  // the four calls to action: data-cta says which; a button without the attribute is read from where it goes
  function ctaOf(a) {
    var c = a.getAttribute("data-cta"); if (c) return c;
    var h = a.getAttribute("href") || "";
    if (/\/trial\.html/.test(h)) return "fit";
    if (/second-opinion\.html/.test(h)) return "second-opinion";
    if (/^tel:/.test(h) || /(^|\/)\?request=talk/.test(h) || /^(\/)?#contact$/.test(h) && !a.hasAttribute("data-ask-interest")) return "engineers";
    if (/interest=quote/.test(h) || a.getAttribute("data-ask-interest") === "quote") return "price";
    return "";
  }
  d.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href],button[data-cta]") : null; if (!a) return;
    var c = ctaOf(a); if (c) emit("cta_clicked", { cta: c, path: L.pathname });
    var h = a.getAttribute && a.getAttribute("href") || "";
    try {
      var x = new URL(h, L.href);
      if (/^https?:$/.test(x.protocol) && !/(^|\.)firstlighttec\.com$/.test(x.hostname)) emit("outbound_clicked", { host: x.hostname });
      // the parts host is another origin, so the tab's storage does not reach it: its part pages get the token on the link
      else if (V.t && x.hostname === "parts.firstlighttec.com" && L.hostname !== x.hostname && !x.searchParams.has("t")) { x.searchParams.set("t", V.t); a.href = x.href; }
    } catch (e) {}
  }, true);
  // Ask our IBM engineers: the form below on a wide screen, the phone under 768 px (one element)
  function tel() { var m = mobile(); [].forEach.call(d.querySelectorAll("[data-tel]"), function (a) { if (!a.hasAttribute("data-href")) a.setAttribute("data-href", a.getAttribute("href")); a.setAttribute("href", m ? a.getAttribute("data-tel") : a.getAttribute("data-href")); }); }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", tel); else tel();
  try { w.matchMedia("(max-width: 767px)").addEventListener("change", tel); } catch (e) {}
  function page() {
    if (arrived) emit("landed", { path: L.pathname }); else emit("visit", { path: L.pathname });
    var m = function (n) { var e = d.querySelector('meta[name="' + n + '"]'); return e ? e.getAttribute("content") : ""; };
    if (m("flt:product")) { var f = { product_id: m("flt:product") }; if (m("flt:part")) f.part_number = m("flt:part"); emit("store_viewed", f); }
    var bk = d.querySelector("[data-booking]"); if (bk) emit("booking", { slot: bk.getAttribute("data-booking-slot") || "", location: bk.getAttribute("data-booking-location") || "" });
  }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", page); else page();
  // engagement and form starts (extended)
  var half = 0, gone = 0, started = 0;
  function scrolled() { var h = d.documentElement, max = Math.max(h.scrollHeight, d.body ? d.body.scrollHeight : 0) - (w.innerHeight || h.clientHeight); return max > 80 && (w.pageYOffset || h.scrollTop || 0) / max >= 0.5; }
  w.addEventListener("scroll", function () { if (!half && scrolled()) { half = 1; emit("engaged", { path: L.pathname }); } }, { passive: true });
  function left() { if (gone) return; var s = Math.round((Date.now() - t0) / 1000); if (s < 1) return; gone = 1; emit("left", { seconds: s }); }
  d.addEventListener("visibilitychange", function () { if (d.visibilityState === "hidden") left(); });
  w.addEventListener("pagehide", left);
  d.addEventListener("input", function (e) { if (started || !e.target.closest) return; var f = e.target.closest("form, .qf, [data-form-label], [data-so-box], [data-watch-box]"); if (f && !e.target.closest("[data-store-search],[data-lk-search],[data-hero-search]")) { started = 1; emit("form_started", { form: f.getAttribute("data-form-label") || f.id || "form" }); } }, true);
})();
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("consent","default",{ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",analytics_storage:"granted"});gtag("js",new Date());gtag("config","G-7FW8Q3YCPM",{allow_google_signals:false,allow_ad_personalization_signals:false});(function(){var s=document.createElement("script");s.async=true;s.src="https://www.googletagmanager.com/gtag/js?id=G-7FW8Q3YCPM";document.head.appendChild(s)})();
