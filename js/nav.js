/* =============================================================================
   Rathmines BC — site navigation
   =============================================================================
   Two jobs:
     1. Collapse the main nav into a drawer below 768px and drive the toggle.
     2. Mark the current page with aria-current for assistive technology.

   Progressive enhancement. This file adds the `js` class to <html>; every
   drawer rule in layout.css is scoped to `.js`. If this script fails to load
   the class is never added, the toggle button stays hidden and the nav
   renders as a plain, always-visible list. Nothing becomes unreachable.

   Loaded with `defer` from the <head> of every page, so the DOM is parsed
   before this runs and there is no flash of an open drawer.

   The 768px literal below must stay in sync with the drawer media queries in
   layout.css and with --bp-md in tokens.css.
   ========================================================================== */

(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");

  /* ---------------------------------------------------------------------
     Current page — aria-current
     ---------------------------------------------------------------------
     The visible marker is CSS, driven by the data-page attribute on <body>,
     so that it survives without JS and the header markup can stay identical
     across all seven pages. This adds the part CSS cannot: the announcement
     for screen reader users.
     --------------------------------------------------------------------- */

  var page = document.body.getAttribute("data-page");

  if (page) {
    var current = document.querySelectorAll('[data-nav="' + page + '"]');

    for (var i = 0; i < current.length; i++) {
      current[i].setAttribute("aria-current", "page");
    }
  }

  /* ---------------------------------------------------------------------
     Drawer
     --------------------------------------------------------------------- */

  if (!toggle || !nav) {
    return;
  }

  var mobile = window.matchMedia("(max-width: 767px)");

  function isOpen() {
    return toggle.getAttribute("aria-expanded") === "true";
  }

  function open() {
    nav.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
  }

  function close(returnFocus) {
    nav.hidden = true;
    toggle.setAttribute("aria-expanded", "false");

    /* Only pull focus back to the button when the reader closed the drawer
       deliberately (Escape). Doing it on every close would yank focus away
       from a link they just followed. */
    if (returnFocus) {
      toggle.focus();
    }
  }

  /* Sync the drawer to the viewport. Above 768px the nav is always visible
     and the hidden attribute must come off, or the links vanish on a
     desktop that was resized down and back up. */
  function sync() {
    if (mobile.matches) {
      if (!isOpen()) {
        nav.hidden = true;
      }
    } else {
      nav.hidden = false;
      toggle.setAttribute("aria-expanded", "false");
    }
  }

  sync();

  toggle.addEventListener("click", function () {
    if (isOpen()) {
      close(false);
    } else {
      open();
    }
  });

  /* Escape closes and returns focus to the button. */
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && isOpen() && mobile.matches) {
      close(true);
    }
  });

  /* A tap outside the header closes the drawer. */
  document.addEventListener("click", function (event) {
    if (!isOpen() || !mobile.matches) {
      return;
    }

    if (!event.target.closest(".site-header")) {
      close(false);
    }
  });

  /* Following a link inside the drawer closes it. Matters for same-page
     anchors, where no navigation happens to close it for us. */
  nav.addEventListener("click", function (event) {
    if (event.target.closest("a") && mobile.matches) {
      close(false);
    }
  });

  /* addEventListener on a MediaQueryList is the modern form; addListener is
     the fallback for older Safari. */
  if (typeof mobile.addEventListener === "function") {
    mobile.addEventListener("change", sync);
  } else if (typeof mobile.addListener === "function") {
    mobile.addListener(sync);
  }
})();

/* =============================================================================
   Header: transparent over a full-bleed media band, solid everywhere else.
   =============================================================================
   This used to be an inline IIFE on index.html, deliberately kept out of this
   shared file because only the home page had a hero. Every page now opens with
   a full-bleed photograph — the home hero on index.html, the narrow `.page-band`
   on the other five — so the reason it was inline is gone and duplicating it
   six times would be worse. See DECISIONS.md.

   Solid is the CSS default and this only ever ADDS a class, so with no JS, no
   IntersectionObserver, or a thrown error, the header simply stays solid and
   legible. A page with neither element is a no-op.
   ========================================================================== */

(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var band = document.querySelector(".hero, .page-band");

  if (!header || !band || !("IntersectionObserver" in window)) {
    return;
  }

  var observer = null;

  /* Shrink the observation root down from the top by the header's own height,
     so "intersecting" means "the band is still underneath the header".
     Re-attached on resize because the header height changes at the 480px
     breakpoint. */
  function attach() {
    if (observer) {
      observer.disconnect();
    }

    observer = new IntersectionObserver(function (entries) {
      header.classList.toggle("is-over-hero", entries[0].isIntersecting);
    }, {
      rootMargin: "-" + Math.round(header.offsetHeight) + "px 0px 0px 0px",
      threshold: 0
    });

    observer.observe(band);
  }

  attach();

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(attach, 150);
  });
})();
