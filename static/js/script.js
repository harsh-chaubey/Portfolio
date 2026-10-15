(() => {
  "use strict";
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Mobile nav (keyboard accessible) ---- */
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");
  if (toggle && links) {
    const setOpen = (open) => {
      links.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", () => setOpen(!links.classList.contains("open")));
    toggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(!links.classList.contains("open")); }
    });
    links.addEventListener("click", (e) => {
      if (e.target.tagName === "A") setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { setOpen(false); toggle.focus(); }
    });
  }

  /* ---- Active nav link on scroll ---- */
  const sections = [...document.querySelectorAll("section[id]")];
  const navAnchors = [...document.querySelectorAll(".nav-links a[href^='#']")];
  if ("IntersectionObserver" in window && sections.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navAnchors.forEach((a) =>
          a.classList.toggle("active", a.getAttribute("href") === `#${en.target.id}`)
        );
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach((s) => obs.observe(s));
  }

  /* ---- Scroll reveal ---- */
  const revealEls = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("visible"));
  } else {
    const robs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("visible"); robs.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => robs.observe(el));
  }

  /* ---- Typing animation (decorative only; content duplicated for AT via noscript/static) ---- */
  const typingEl = document.getElementById("typing");
  const phrases = ["AI/ML · Flask · React", "IoT · Sensors · Automation", "Python · SQL · MongoDB", "Data-driven web apps"];
  if (typingEl && !prefersReduced) {
    let pi = 0, ci = 0, deleting = false;
    const tick = () => {
      const word = phrases[pi];
      typingEl.textContent = word.slice(0, ci);
      if (!deleting && ci < word.length) { ci++; setTimeout(tick, 55); }
      else if (!deleting) { deleting = true; setTimeout(tick, 1400); }
      else if (ci > 0) { ci--; setTimeout(tick, 28); }
      else { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(tick, 300); }
    };
    tick();
  } else if (typingEl) {
    typingEl.textContent = phrases[0];
  }

  /* ---- Low-intensity particle background ---- */
  const canvas = document.getElementById("hero-particles");
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext("2d");
    let w, h, parts = [], raf;
    const N = window.innerWidth < 680 ? 28 : 55;
    const resize = () => {
      const r = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = r.width; h = canvas.height = r.height;
    };
    const seed = () => {
      parts = Array.from({ length: N }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.8 + 0.6,
        c: Math.random() > 0.88 ? "255,45,85" : "0,229,255",
        a: Math.random() * 0.5 + 0.15,
      }));
    };
    const step = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c},${p.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(step);
    };
    resize(); seed(); step();
    window.addEventListener("resize", () => { resize(); seed(); });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf); else step();
    });
  }

  /* ---- Contact form: client-side validation (server re-validates) ---- */
  const form = document.getElementById("contact-form");
  const errBox = document.getElementById("cf-error");
  if (form) {
    form.addEventListener("submit", (e) => {
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
      const problems = [];
      if (name.length < 2) problems.push("name (min 2 characters)");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) problems.push("a valid email");
      if (message.length < 10) problems.push("message (min 10 characters)");
      if (problems.length) {
        e.preventDefault();
        if (errBox) {
          errBox.hidden = false;
          errBox.textContent = `Please provide ${problems.join(", ")}.`;
        }
        (form.querySelector("input:invalid, textarea:invalid") || form.querySelector("input")).focus();
      } else if (errBox) {
        errBox.hidden = true;
      }
    });
  }

  /* ---- Live GitHub feed (via Flask proxy /api/github) ---- */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
  const ghProfile = document.getElementById("github-profile");
  const ghRepos = document.getElementById("github-repos");
  const ghLoading = document.getElementById("github-loading");
  const ghError = document.getElementById("github-error");
  const ghErrorMsg = document.getElementById("github-error-msg");
  const ghRetry = document.getElementById("github-retry");
  const starSvg = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="m12 2 2.9 6.26 6.6.57-5 4.36 1.5 6.45L12 16.9 5.99 19.64l1.5-6.45-5-4.36 6.6-.57L12 2Z"/></svg>';

  async function loadGitHub() {
    if (!ghRepos) return;
    if (ghLoading) ghLoading.hidden = false;
    if (ghError) ghError.hidden = true;
    try {
      const res = await fetch("/api/github", { headers: { Accept: "application/json" } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || `GitHub responded with ${res.status}`);
      const p = data.profile || {};
      if (ghProfile && p.login) {
        ghProfile.hidden = false;
        ghProfile.classList.add("visible");
        ghProfile.innerHTML =
          (p.avatar_url ? `<img class="gh-avatar" src="${esc(p.avatar_url)}" alt="" width="72" height="72" loading="lazy" />` : "") +
          `<div class="gh-profile-info">` +
          `<h3><a href="${esc(p.html_url)}" target="_blank" rel="noopener noreferrer">@${esc(p.login)}</a>` +
          (p.name ? ` · ${esc(p.name)}` : "") + `</h3>` +
          (p.bio ? `<p class="gh-bio">${esc(p.bio)}</p>` : "") +
          `<p class="gh-stats"><span>${esc(p.public_repos)} public repos</span>` +
          `<span>${esc(p.followers)} followers</span>` +
          `<span>${esc(p.following)} following</span></p></div>`;
      }
      const repos = Array.isArray(data.repos) ? data.repos : [];
      ghRepos.innerHTML = repos.length ? repos.map((r) => (
        `<article class="glass card proj reveal visible">` +
        `<p class="proj-kicker">${esc(r.language || "Repository")}</p>` +
        `<div class="repo-top"><h3><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.name)}</a></h3></div>` +
        `<p class="repo-desc">${esc(r.description || "No description provided.")}</p>` +
        `<p class="repo-meta">` +
        (r.language ? `<span class="repo-lang">${esc(r.language)}</span>` : "") +
        `<span class="repo-stars">${starSvg} ${esc(r.stars)} · ${esc(r.forks)} forks</span>` +
        `<a class="repo-link" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(r.name)} on GitHub (opens in new tab)">Code →</a>` +
        `</p></article>`
      )).join("") : `<p class="section-lede">No public repositories found. <a href="https://github.com/harsh-chaubey" target="_blank" rel="noopener noreferrer">Browse the profile directly</a>.</p>`;
    } catch (err) {
      if (ghError) ghError.hidden = false;
      if (ghErrorMsg) ghErrorMsg.textContent = err instanceof Error ? err.message : "GitHub is unreachable right now.";
    } finally {
      if (ghLoading) ghLoading.hidden = true;
    }
  }
  if (ghRepos) {
    loadGitHub();
    if (ghRetry) ghRetry.addEventListener("click", loadGitHub);
  }

  /* ---- Certificate viewer modal ---- */
  const certBtns = [...document.querySelectorAll(".cert-btn")];
  const certModal = document.getElementById("cert-modal");
  const certBackdrop = document.getElementById("cert-backdrop");
  const certDialog = certModal ? certModal.querySelector(".cert-dialog") : null;
  const certTitle = document.getElementById("cert-title");
  const certImg = document.getElementById("cert-img");
  const certPdf = document.getElementById("cert-pdf");
  const certFull = document.getElementById("cert-full");
  const certClose = document.getElementById("cert-close");
  const certZoomBox = document.getElementById("cert-zoom-controls");
  const certZoomIn = document.getElementById("cert-zoom-in");
  const certZoomOut = document.getElementById("cert-zoom-out");
  const certZoomReset = document.getElementById("cert-zoom-reset");
  const certZoomLevel = document.getElementById("cert-zoom-level");
  let certInvoker = null;
  let certZoom = 1;
  let certPdfTimer = null;
  let certPdfPending = "";

  const certLoadError = document.createElement("p");
  certLoadError.className = "form-error";
  certLoadError.hidden = true;
  if (certModal) document.getElementById("cert-body").appendChild(certLoadError);

  const setZoom = (z) => {
    certZoom = Math.min(3, Math.max(0.5, Math.round(z * 100) / 100));
    if (certImg) certImg.style.transform = `scale(${certZoom})`;
    if (certZoomLevel) certZoomLevel.textContent = `${Math.round(certZoom * 100)}%`;
  };

  const openCert = (btn) => {
    if (!certModal) return;
    const src = btn.getAttribute("data-cert-src") || "";
    const title = btn.getAttribute("data-cert-title") || "Certificate";
    const type = btn.getAttribute("data-cert-type") || "image";
    if (!src) return;
    certInvoker = btn;
    if (certTitle) certTitle.textContent = title;
    certLoadError.hidden = true;
    certLoadError.textContent = "";
    if (certPdfTimer) { clearTimeout(certPdfTimer); certPdfTimer = null; }
    certPdfPending = "";
    setZoom(1);
    if (type === "pdf") {
      if (certImg) { certImg.hidden = true; certImg.removeAttribute("src"); }
      if (certPdf) {
        certPdf.hidden = false;
        certPdfPending = src;
        certPdf.src = src;
        // Browsers don't reliably fire error events for blocked/failed
        // iframe embeds, so fall back to a helpful message on timeout.
        certPdfTimer = setTimeout(() => {
          if (!certModal.hidden && certPdfPending && certPdf.getAttribute("src") === certPdfPending) {
            certLoadError.hidden = false;
            certLoadError.textContent = "The certificate preview could not be loaded here. Please use “Open full size” to view it in a new tab.";
          }
          certPdfTimer = null;
        }, 12000);
      }
      if (certZoomBox) certZoomBox.style.visibility = "hidden";
    } else {
      if (certPdf) { certPdf.hidden = true; certPdf.src = "about:blank"; }
      if (certImg) {
        certImg.hidden = false;
        certImg.alt = title;
        certImg.src = src;
      }
      if (certZoomBox) certZoomBox.style.visibility = "visible";
    }
    if (certFull) certFull.href = src;
    certModal.hidden = false;
    document.body.style.overflow = "hidden";
    if (certClose) certClose.focus();
  };

  const closeCert = () => {
    if (!certModal || certModal.hidden) return;
    certModal.hidden = true;
    document.body.style.overflow = "";
    if (certPdfTimer) { clearTimeout(certPdfTimer); certPdfTimer = null; }
    certPdfPending = "";
    if (certImg) certImg.removeAttribute("src");
    if (certPdf) certPdf.src = "about:blank";
    if (certInvoker) certInvoker.focus();
    certInvoker = null;
  };

  if (certModal && certBtns.length) {
    certBtns.forEach((btn) => btn.addEventListener("click", () => openCert(btn)));
    if (certClose) certClose.addEventListener("click", closeCert);
    if (certBackdrop) certBackdrop.addEventListener("click", closeCert);
    if (certImg) certImg.addEventListener("error", () => {
      certImg.hidden = true;
      certLoadError.hidden = false;
      certLoadError.textContent = "The certificate image could not be loaded. Please use “Open full size” to view it directly.";
    });
    if (certPdf) certPdf.addEventListener("load", () => {
      // Ignore the intentional "about:blank" navigations.
      const src = certPdf.getAttribute("src") || "";
      if (!src || src === "about:blank" || src !== certPdfPending) return;
      certPdfPending = "";
      if (certPdfTimer) { clearTimeout(certPdfTimer); certPdfTimer = null; }
      certLoadError.hidden = true;
      certLoadError.textContent = "";
    });
    if (certZoomIn) certZoomIn.addEventListener("click", () => setZoom(certZoom + 0.25));
    if (certZoomOut) certZoomOut.addEventListener("click", () => setZoom(certZoom - 0.25));
    if (certZoomReset) certZoomReset.addEventListener("click", () => setZoom(1));

    document.addEventListener("keydown", (e) => {
      if (certModal.hidden) return;
      if (e.key === "Escape") { e.preventDefault(); closeCert(); return; }
      // Image zoom shortcuts
      if (certImg && !certImg.hidden && ["+", "=", "-", "_", "0"].includes(e.key)) {
        if (e.key === "0") setZoom(1);
        else if (e.key === "+" || e.key === "=") setZoom(certZoom + 0.25);
        else setZoom(certZoom - 0.25);
        return;
      }
      // Focus trap: keep Tab cycling inside the dialog
      if (e.key === "Tab" && certDialog) {
        const focusables = [...certDialog.querySelectorAll(
          'button, [href], iframe, [tabindex]:not([tabindex="-1"])'
        )].filter((el) => !el.hidden && el.offsetParent !== null);
        if (!focusables.length) { e.preventDefault(); return; }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---- Dynamic year fallback (server already renders it) ---- */
  const year = document.getElementById("year");
  if (year && !year.textContent.trim()) year.textContent = String(new Date().getFullYear());
})();
