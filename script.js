/* =========================================================
   Thiago · 2 — script.js
   Starfield, parallax, countdown, reveals, lightbox, audio,
   custom cursor, shooting stars, interactive quote stars.
   ========================================================= */

(() => {
  "use strict";

  /* ---------- INTRO CURTAIN ---------- */
  window.addEventListener("load", () => {
    setTimeout(() => {
      document.getElementById("curtain")?.classList.add("is-gone");
    }, 1000);
  });

  /* ---------- STARFIELD CANVAS ---------- */
  const canvas = document.getElementById("starfield");
  const ctx = canvas.getContext("2d");
  let stars = [],
    W = 0,
    H = 0,
    dpr = Math.min(window.devicePixelRatio || 1, 2);
  function resizeCanvas() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedStars();
  }
  function seedStars() {
    const count = Math.floor((W * H) / 9000); // density
    stars = new Array(count).fill(0).map(() => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.2,
      base: Math.random() * 0.5 + 0.3,
      tw: Math.random() * Math.PI * 2,
      sp: 0.005 + Math.random() * 0.015,
      hue:
        Math.random() < 0.12 ? "gold" : Math.random() < 0.05 ? "rose" : "white",
    }));
  }
  function drawStars(t) {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      const a = s.base + Math.sin(t * s.sp + s.tw) * 0.4;
      const alpha = Math.max(0, Math.min(1, a));
      let color;
      if (s.hue === "gold") color = `rgba(233,196,106,${alpha})`;
      else if (s.hue === "rose") color = `rgba(244,163,168,${alpha * 0.85})`;
      else color = `rgba(253,246,227,${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }
  function tick(t) {
    drawStars(t);
    requestAnimationFrame(tick);
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  requestAnimationFrame(tick);

  /* ---------- SHOOTING STARS (occasional) ---------- */
  const shooter = document.getElementById("shootingStar");
  function fireShootingStar() {
    if (!shooter) return;
    const startX = Math.random() * window.innerWidth * 0.4;
    const startY = Math.random() * window.innerHeight * 0.4;
    shooter.style.left = startX + "px";
    shooter.style.top = startY + "px";
    shooter.classList.remove("is-flying");
    void shooter.offsetWidth; // reflow
    shooter.classList.add("is-flying");
  }
  setInterval(() => {
    if (document.hidden) return;
    if (Math.random() < 0.6) fireShootingStar();
  }, 6500);
  setTimeout(fireShootingStar, 2400);

  /* ---------- PARALLAX (subtle) ---------- */
  const parallaxEls = document.querySelectorAll("[data-parallax]");
  let scrollY = window.scrollY;
  function onScroll() {
    scrollY = window.scrollY;
    parallaxEls.forEach((el) => {
      const rate = parseFloat(el.dataset.parallax) || 0.2;
      el.style.transform = `translate3d(0, ${-(scrollY * rate)}px, 0)`;
      // hero orbit needs to keep its centering
      if (el.classList.contains("hero__orbit")) {
        el.style.transform = `translate(-50%, calc(-50% + ${-(scrollY * rate)}px))`;
      }
    });
    // Nav stuck state
    nav?.classList.toggle("is-stuck", scrollY > 24);
  }
  const nav = document.getElementById("nav");
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- COUNTDOWN ---------- */
  const TARGET = new Date("2026-08-30T15:00:00").getTime();
  const cdDays = document.getElementById("cd-days");
  const cdHrs = document.getElementById("cd-hours");
  const cdMin = document.getElementById("cd-mins");
  const cdSec = document.getElementById("cd-secs");
  const last = { d: null, h: null, m: null, s: null };
  function pad(n, l = 2) {
    return String(Math.max(0, n)).padStart(l, "0");
  }
  function setCell(el, key, val, len) {
    if (!el) return;
    if (last[key] === val) return;
    last[key] = val;
    el.textContent = pad(val, len);
    el.classList.remove("is-tick");
    void el.offsetWidth;
    el.classList.add("is-tick");
  }
  function updateCD() {
    const now = Date.now();
    let diff = Math.max(0, TARGET - now);
    const d = Math.floor(diff / 86400000);
    diff -= d * 86400000;
    const h = Math.floor(diff / 3600000);
    diff -= h * 3600000;
    const m = Math.floor(diff / 60000);
    diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    setCell(cdDays, "d", d, 3);
    setCell(cdHrs, "h", h, 2);
    setCell(cdMin, "m", m, 2);
    setCell(cdSec, "s", s, 2);
  }
  updateCD();
  setInterval(updateCD, 1000);

  /* ---------- REVEAL ON SCROLL ---------- */
  const revealEls = document.querySelectorAll(".reveal, .tl__item");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // small stagger for timeline items
          if (entry.target.classList.contains("tl__item")) {
            const idx = Array.from(entry.target.parentElement.children).indexOf(
              entry.target,
            );
            entry.target.style.transitionDelay = idx * 90 + "ms";
          }
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
  );
  revealEls.forEach((el) => io.observe(el));

  /* ---------- LIGHTBOX ---------- */
  const tiles = document.querySelectorAll(".tile");
  const lb = document.getElementById("lightbox");
  const lbArt = document.getElementById("lbArt");
  const lbCap = document.getElementById("lbCaption");
  const lbClose = document.getElementById("lbClose");
  const lbPrev = document.getElementById("lbPrev");
  const lbNext = document.getElementById("lbNext");
  let lbIdx = 0;
  const tileData = Array.from(tiles).map((t) => ({
    caption: t.querySelector(".tile__caption")?.textContent || "",
    n: t.dataset.tile,
  }));
  function openLB(i) {
    lbIdx = (i + tileData.length) % tileData.length;
    const d = tileData[lbIdx];
    lbArt.textContent = "✦  Foto " + d.n + "  ✦";
    lbCap.textContent = d.caption;
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
  }
  function closeLB() {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
  }
  tiles.forEach((t, i) => t.addEventListener("click", () => openLB(i)));
  lbClose?.addEventListener("click", closeLB);
  lb?.addEventListener("click", (e) => {
    if (e.target === lb) closeLB();
  });
  lbPrev?.addEventListener("click", () => openLB(lbIdx - 1));
  lbNext?.addEventListener("click", () => openLB(lbIdx + 1));
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLB();
    if (e.key === "ArrowLeft") openLB(lbIdx - 1);
    if (e.key === "ArrowRight") openLB(lbIdx + 1);
  });

  /* ---------- AUDIO TOGGLE (gentle WebAudio pad, no external file) ---------- */
  const audioBtn = document.getElementById("audioToggle");
  let audioCtx = null,
    masterGain = null,
    oscNodes = [];
  function buildAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(audioCtx.destination);

    // Soft pad: a few detuned sines + slow LFO on filter
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.Q.value = 0.6;
    filter.connect(masterGain);

    const notes = [220, 277.18, 329.63, 440]; // A3, C#4, E4, A4 — open major
    notes.forEach((f, i) => {
      const o = audioCtx.createOscillator();
      o.type = i === 0 ? "sine" : i === 3 ? "triangle" : "sine";
      o.frequency.value = f * (1 + (Math.random() - 0.5) * 0.002);
      const g = audioCtx.createGain();
      g.gain.value = (0.12 / notes.length) * (i === 0 ? 1.4 : 1);
      o.connect(g);
      g.connect(filter);
      o.start();
      oscNodes.push({ o, g });
    });

    // LFO on filter cutoff
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 380;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
  }
  function setAudio(on) {
    if (!audioCtx) buildAudio();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const target = on ? 0.18 : 0;
    const t = audioCtx.currentTime;
    masterGain.gain.cancelScheduledValues(t);
    masterGain.gain.linearRampToValueAtTime(target, t + 1.6);
    audioBtn.setAttribute("aria-pressed", on ? "true" : "false");
  }
  audioBtn?.addEventListener("click", () => {
    const on = audioBtn.getAttribute("aria-pressed") !== "true";
    setAudio(on);
  });

  /* ---------- CUSTOM CURSOR ---------- */
  const cursor = document.getElementById("cursor");
  const dot = cursor.querySelector(".cursor__dot");
  const ring = cursor.querySelector(".cursor__ring");
  let mx = window.innerWidth / 2,
    my = window.innerHeight / 2;
  let dx = mx,
    dy = my,
    rx = mx,
    ry = my;
  let cursorActive = false;
  window.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (!cursorActive) {
      cursor.style.opacity = 1;
      cursorActive = true;
    }
  });
  window.addEventListener("mouseout", () => {
    cursor.style.opacity = 0;
    cursorActive = false;
  });
  function cursorTick() {
    dx += (mx - dx) * 0.55;
    dy += (my - dy) * 0.55;
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    dot.style.left = dx + "px";
    dot.style.top = dy + "px";
    ring.style.left = rx + "px";
    ring.style.top = ry + "px";
    requestAnimationFrame(cursorTick);
  }
  if (window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
    requestAnimationFrame(cursorTick);
    document.querySelectorAll("a, button, .tile, .qstar").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () =>
        cursor.classList.remove("is-hover"),
      );
    });
  } else {
    cursor.style.display = "none";
  }

  /* ---------- INTERACTIVE QUOTE STARS ---------- */
  const field = document.getElementById("quotesField");
  if (field) {
    const N = 60;
    const qstars = [];
    for (let i = 0; i < N; i++) {
      const s = document.createElement("span");
      s.className = "qstar";
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const sz = 2 + Math.random() * 3;
      s.style.left = x + "%";
      s.style.top = y + "%";
      s.style.width = sz + "px";
      s.style.height = sz + "px";
      field.appendChild(s);
      qstars.push({ el: s, x, y });
    }
    field.addEventListener("mousemove", (e) => {
      const r = field.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * 100;
      const py = ((e.clientY - r.top) / r.height) * 100;
      qstars.forEach((q) => {
        const dxp = q.x - px,
          dyp = q.y - py;
        const dist = Math.sqrt(dxp * dxp + dyp * dyp);
        if (dist < 14) {
          const force = (14 - dist) / 14;
          q.el.classList.add("is-near");
          q.el.style.transform = `translate(${dxp * force * 0.6}px, ${dyp * force * 0.6}px) scale(${1 + force * 0.8})`;
        } else {
          q.el.classList.remove("is-near");
          q.el.style.transform = "";
        }
      });
    });
    field.addEventListener("mouseleave", () => {
      qstars.forEach((q) => {
        q.el.classList.remove("is-near");
        q.el.style.transform = "";
      });
    });
  }

  /* ---------- VISIBILITY: pause heavy work ---------- */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && audioCtx && audioCtx.state === "running") {
      audioCtx.suspend();
      audioBtn?.setAttribute("aria-pressed", "false");
    }
  });


  /* ---------- SPA TRANSITIONS ---------- */
  const mainView = document.getElementById('main-view');
  const invView = document.getElementById('invitation-view');
  const backBtn = document.getElementById('backToHomeBtn');

  // Instead of navigating, we switch views
  document.querySelectorAll('a[href="invitación.html"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      mainView.style.opacity = '0';
      setTimeout(() => {
        mainView.classList.add('view-hidden');
        invView.style.opacity = '0';
        invView.classList.remove('view-hidden');
        // trigger reflow
        void invView.offsetWidth;
        invView.style.opacity = '1';
        window.scrollTo(0, 0);
      }, 600);
    });
  });

  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      invView.style.opacity = '0';
      setTimeout(() => {
        invView.classList.add('view-hidden');
        mainView.style.opacity = '0';
        mainView.classList.remove('view-hidden');
        void mainView.offsetWidth;
        mainView.style.opacity = '1';
      }, 600);
    });
  }

  (() => {
    'use strict';
    const card = document.getElementById('postcard');
    const flipBtn = document.getElementById('flipBtn');
    const printBtn = document.getElementById('printBtn');

    /* ---- FLIP ---- */
    function toggleFlip() { card.classList.toggle('is-flipped'); }
    card.addEventListener('click', (e) => {
      // ignore clicks inside form fields / buttons
      if (e.target.closest('input, textarea, button')) return;
      toggleFlip();
    });
    card.addEventListener('keydown', (e) => {
      if (e.target !== card) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFlip(); }
    });
    flipBtn.addEventListener('click', toggleFlip);

    /* ---- TWO-WAY BIND (panel ↔ postcard) ---- */
    const state = { family: '', adults: 0, kids: 0 };

    function refresh() {
      document.querySelectorAll('[data-bind-display]').forEach(el => {
        const key = el.dataset.bindDisplay;
        const v = state[key];
        if (key === 'family') {
          el.textContent = (v && v.trim()) ? v : '_____________';
        } else {
          el.textContent = v;
        }
      });
      document.querySelectorAll('[data-bind]').forEach(el => {
        const key = el.dataset.bind;
        if (el.value !== String(state[key])) el.value = state[key];
      });
      // disable steppers at edges
      document.querySelectorAll('[data-counter]').forEach(c => {
        const key = c.dataset.counter;
        const minus = c.querySelector('[data-step="-1"]');
        const plus = c.querySelector('[data-step="+1"]');
        if (minus) minus.disabled = state[key] <= 0;
        if (plus) plus.disabled = state[key] >= 20;
      });
    }

    document.querySelectorAll('[data-bind]').forEach(el => {
      el.addEventListener('input', () => {
        const key = el.dataset.bind;
        if (key === 'family') {
          state.family = el.value;
        } else {
          let n = parseInt(el.value, 10);
          if (isNaN(n)) n = 0;
          state[key] = Math.max(0, Math.min(20, n));
        }
        refresh();
      });
    });

    document.querySelectorAll('[data-counter] [data-step]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const counter = btn.closest('[data-counter]');
        const key = counter.dataset.counter;
        const step = parseInt(btn.dataset.step, 10);
        state[key] = Math.max(0, Math.min(20, state[key] + step));
        refresh();
      });
    });

    /* ---- FETCH FROM API ---- */
    async function loadInvitation() {
      const urlParams = new URLSearchParams(window.location.search);
      const hash = urlParams.get('inv');

      if (hash) {
        try {
          // Usa localhost si se abre localmente, de lo contrario usa ruta relativa
          const baseUrl = 'https://project-bpyrl.vercel.app';

          const res = await fetch(`${baseUrl}/api/invitation/${hash}`);
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              state.family = json.data.f || '';
              state.adults = json.data.nj || 0;
              state.kids = json.data.j || 0;
            }
          }
        } catch (e) {
          console.error("Error al cargar la invitación:", e);
        }
      }
      refresh();
    }

    loadInvitation();

    /* ---- PRINT (now prints both sides) ---- */
    printBtn?.addEventListener('click', () => {
      window.print();
    });

    /* ---- KEYBOARD SHORTCUTS ---- */
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea')) return;
      if (e.key.toLowerCase() === 'f') { toggleFlip(); }
      if (e.key.toLowerCase() === 'p') { e.preventDefault(); printBtn?.click(); }
    });
  })();
})();