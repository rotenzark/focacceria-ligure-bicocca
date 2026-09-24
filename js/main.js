/* PLUMBING_V 4 — Bespoke Studio · meccanica invisibile canonica.
   ────────────────────────────────────────────────────────────────
   CONFINE (inviolabile): questo file contiene SOLO plumbing — la meccanica
   che il visitatore non percepisce come design. NIENTE markup di sezioni,
   NIENTE stile, NIENTE struttura: concept, griglia, tipografia, hero e
   animazioni-firma si progettano DA ZERO per ogni cliente (GATE #3).
   Se qui dentro scivola del layout, questo diventa il nuovo scheletro
   condiviso — cioè il difetto "copia-incolla" che il metodo combatte.

   Come si usa: si COPIA nella cartella js/ del sito e si adatta la sola
   costante SITE. Le animazioni-firma del sito si scrivono nel proprio
   main.js DOPO questo file (o in coda a questo file, sotto il marcatore).
   Ogni bug nuovo si corregge QUI (bump PLUMBING_V + changelog nel README)
   e poi nel sito: mai il contrario.

   Fix già incorporati (non rimuovere):
   - ScrollTrigger registrato SUBITO allo script load, MAI dentro l'intro
     o un setTimeout (bug APF #5 del 16/7: race col watchdog → sezioni
     che sparivano allo scroll).
   - Reveal con once:true (niente re-animazioni da zero ri-scorrendo).
   - Watchdog 1,5s che forza visibile e UCCIDE i trigger non scattati.
   - Lightbox su [hidden] + override CSS !important (bug: display:flex
     batteva [hidden] e la lightbox restava visibile).
   - Foto-contenuto MAI lazy (regola workflow §8): il plumbing non tocca
     il loading, ma il lint lo verifica.
   - Orari Europe/Rome con finestre multiple e scavalco di mezzanotte
     (pattern Il Cavallante 18:00–00:30). */

(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) root.classList.add('reduced-motion');

  /* ══════════ CONFIG PER-SITO — l'unica parte da adattare ══════════ */
  var SITE = {
    slug: 'focacceria-ligure-bicocca', // usato per localStorage lang
    whatsapp: {
      number: '',                     // '39xxxxxxxxxx' — vuoto = niente wiring
      message: 'Ciao! Vorrei informazioni.',
      ids: ['ctaPrenota', 'heroWhatsapp', 'doveWhatsapp', 'barWhatsapp'],
    },
    /* orari: per giorno (0=domenica) un array di finestre [inizio, fine]
       in minuti-stringa 'HH:MM'. Fine oltre '24:00' = scavalca mezzanotte
       (es. ['18:00','24:30'] = apre alle 18, chiude alle 00:30 del giorno
       dopo). Giorno chiuso = []. */
    /* Scheda Google (tabella letta a schermo il 24/9/2026, «aggiornata dall'attività»):
       lun–mer fino alle 19:30, gio–sab fino alle 23:30 (le sere del teatro), domenica chiuso. */
    hours: {
      0: [],
      1: [['10:00', '19:30']],
      2: [['10:00', '19:30']],
      3: [['10:00', '19:30']],
      4: [['10:00', '23:30']],
      5: [['10:00', '23:30']],
      6: [['11:00', '23:30']],
    },
    hoursStatusId: 'orarioStato',     // elemento testo stato
    hoursTableSelector: '[data-day]', // righe/li con data-day da evidenziare
    todayClass: 'is-today',
    introId: 'intro',
    introDuration: 1800,
    revealSelector: '.reveal',
    inViewClass: 'in-view',
    breakpointMenu: 960,
    /* dizionario EN: SOLO overlay — l'HTML è la versione italiana.
       Forma storica a due lingue, resta valida e invariata. */
    EN: {
      "intro.skip": "enter",
      "nav.home": "Focacceria Ligure e Non Solo, back to top",
      "nav.apri": "Open the menu",
      "marchio.c": "and more…",
      "nav.focaccia": "The focaccia",
      "nav.nonsolo": "And more",
      "nav.teatro": "Evenings",
      "nav.laurea": "Graduations & parties",
      "nav.dove": "Where & hours",
      "cta.chiama": "Call",
      "cta.chiama2": "Call 02 3966 2266",
      "h.eti": "Focacceria · Milano Bicocca · since 2006",
      "h.r1": "Ligurian",
      "h.r2": "focaccia.",
      "h.ref": "and more",
      "h.p": "Baked in the tray, low and soft, with dimples full of olive oil. Opposite the University, <b>on the same avenue as the Teatro degli Arcimboldi</b>: lunch for those who study, evenings for those going to the theatre.",
      "h.cta1": "Call",
      "h.cta2": "Where & hours",
      "h.alt": "Close-up of Genoese focaccia: the golden surface with dimples full of olive oil",
      "h.cap": "The classic with olive oil, just out of the tray",
      "f.k": "The focaccia",
      "f.h": "Low, soft, with dimples full of oil.",
      "f.p": "It is focaccia the way it is made in Genoa: spread in the tray, pressed with the fingers, soaked with olive oil and baked. Then it is cut into slices for lunch or into cubes for a platter, and eaten with your hands. These are the trays that come out of our oven.",
      "v.classica": "Classic with olive oil",
      "v.classica.d": "Only oil, coarse salt and the dimples. The base of everything.",
      "v.classica.alt": "The classic focaccia with olive oil, pale and golden, with its dimples",
      "v.pomodorini": "Cherry tomatoes",
      "v.pomodorini.d": "With oregano, cut into slices.",
      "v.pomodorini.alt": "Slices of focaccia with cherry tomatoes and oregano",
      "v.olive": "Olives",
      "v.olive.d": "The olives are pressed into the dough before baking.",
      "v.olive.alt": "Focaccia with green olives sunk into the dough",
      "v.patate": "Potatoes and pancetta",
      "v.patate.d": "Potato slices and pancetta on top of the dough.",
      "v.patate.alt": "Focaccia with potatoes and pancetta",
      "v.cotto": "Ham and cheese",
      "v.cotto.d": "Filled, for a lunch on your feet.",
      "v.cotto.alt": "Slices of focaccia filled with cooked ham and cheese",
      "v.verdure": "Grilled vegetables",
      "v.verdure.d": "Courgettes, aubergines, peppers.",
      "v.verdure.alt": "Focaccia filled with grilled vegetables",
      "v.dolce": "Sweet",
      "v.dolce.d": "Sugared on top: for breakfast or an afternoon snack.",
      "v.dolce.alt": "Slices of sweet focaccia, sugared on top",
      "v.farcita": "Filled to order",
      "v.farcita.d": "Opened and filled in front of you: cured ham, rocket, cheeses.",
      "v.farcita.alt": "A slice of focaccia filled with cured ham and salad",
      "n.ref": "and more",
      "n.h": "than focaccia.",
      "n.p": "The same oven also gives us the panzerotti, which we have been making since we opened, pizza in the tray and the Nutella parcels.",
      "n.panz": "Panzerotti",
      "n.panz.d": "Baked, filled: tomato and mozzarella, ragù, vegetables.",
      "n.panz.alt": "A panzerotto cut in half, filled with vegetables, on the counter",
      "n.pizza": "Pizza in the tray",
      "n.pizza.d": "Margherita, buffalo mozzarella and basil, ham and mushrooms, sausage: by the slice.",
      "n.pizza.alt": "Tray pizza with buffalo mozzarella and fresh basil",
      "n.fag": "Nutella parcels",
      "n.fag.d": "The house sweet, with icing sugar.",
      "n.fag.alt": "Nutella parcels dusted with icing sugar",
      "n.focaccine": "Small focaccias",
      "n.focaccine.d": "Round, ready to be filled.",
      "n.focaccine.alt": "Round small focaccias just baked",
      "n.calz": "Calzoni",
      "n.calz.d": "Folded and baked, with a handwritten label.",
      "n.calz.alt": "Baked calzoni with the handwritten label «grilled vegetables and mozzarella»",
      "n.piad": "Piadine",
      "n.piad.d": "With chicken, with cold cuts, with vegetables: made to order.",
      "t.ref": "and more",
      "t.h": "than lunch.",
      "t.p": "The Teatro degli Arcimboldi is <b>on the same avenue</b>, a few street numbers away. That is why on Thursday, Friday and Saturday we stay open <b>until 11.30 pm</b>: a slice before the show, or a panzerotto on the way out of the concert.",
      "t.p2": "By day, instead, we are the lunch break of those who study and work in Bicocca: you choose from the counter, eat standing or take it away.",
      "t.st.eti": "Today",
      "t.prog.aria": "Opening hours of the week",
      "gc.lun": "Mon",
      "gc.mar": "Tue",
      "gc.mer": "Wed",
      "gc.gio": "Thu",
      "gc.ven": "Fri",
      "gc.sab": "Sat",
      "gc.dom": "Sun",
      "gc.chiuso": "closed",
      "l.ref": "and more",
      "l.h": "than students.",
      "l.p": "Many get to know us during their university years. Then <b>graduation day</b> comes, and the party is here: trays of focaccia and mini pizzas cut into cubes, the platters, plates and flutes ready on the counter.",
      "l.p2": "The same trays work for an office meeting, a birthday, a party at home. You order by phone: call us in good time.",
      "l.alt1": "On the counter: flutes, plates and a bottle of sparkling wine ready for a toast, and the wall with the customers’ photos",
      "l.alt2": "A tray of focaccia cut into cubes with cherry tomatoes and olives",
      "l.alt3": "Plates, glasses and flutes stacked on the counter for a party",
      "a.ref": "and more",
      "a.h": "than here.",
      "a.p": "Everything on the counter can be taken away, in our boxes. And if you cannot drop by, we come to you.",
      "a.m1": "Takeaway",
      "a.m1d": "Choose from the counter and take it away, hot, in the box with our logo.",
      "a.m2": "Delivery",
      "a.m2d": "To your home or office with Deliveroo and Glovo.",
      "a.m3": "To order",
      "a.m3d": "Trays and platters for groups: a phone call a few days ahead.",
      "a.alt": "The takeaway boxes with the focacceria logo stacked on the counter, with a slice of focaccia in front",
      "w.k": "Since 2006",
      "w.h": "Federico and Roberta.",
      "w.p": "The shop is small: a counter, the trays behind the glass, two terracotta walls covered with customers’ photos. Whoever comes in talks to us, chooses with us, and if in a hurry is out in two minutes. We have been here since 2006, and we write it on the awning too.",
      "w.cit": "«Feel at home, always»",
      "w.citda": "The line we write under our photos",
      "w.alt1": "The counter with trays of focaccia and pizza behind the glass and the oval «Focacceria Ligure» sign",
      "w.alt2": "The awning above the window: «E non solo… dal 2006»",
      "w.alt3": "The inside of the shop: terracotta walls, the counter and the lamps",
      "d.h": "Where and when.",
      "d.p": "Opposite the University of Milano-Bicocca, a short walk from Greco Pirelli station and the Teatro degli Arcimboldi.",
      "d.no1": "<b>Sunday</b> closed.",
      "d.no2": "<b>Monday, Tuesday and Wednesday</b> we close at 7.30 pm.",
      "d.strada": "Take me there with Google Maps",
      "d.mappa": "Map: Focacceria Ligure e Non Solo, Viale dell’Innovazione 11, Milan",
      "o.cap": "Opening hours",
      "g.lun": "Monday",
      "g.mar": "Tuesday",
      "g.mer": "Wednesday",
      "g.gio": "Thursday",
      "g.ven": "Friday",
      "g.sab": "Saturday",
      "g.dom": "Sunday",
      "g.chiuso": "closed",
      "q.h": "Questions we often get.",
      "q.1": "Where is Focacceria Ligure e Non Solo?",
      "r.1": "At Viale dell’Innovazione 11, Milano Bicocca (postcode 20126): opposite the University and on the same avenue as the Teatro degli Arcimboldi.",
      "q.2": "How late are you open in the evening?",
      "r.2": "Thursday, Friday and Saturday until 11.30 pm. Monday to Wednesday we close at 7.30 pm. On Sunday we are closed.",
      "q.3": "Do you make trays and platters for graduation parties?",
      "r.3": "Yes: trays of focaccia and mini pizzas cut into cubes, platters for a graduation party, for the office or for a celebration. Order by phone, in good time: 02 3966 2266.",
      "q.4": "Can I order delivery?",
      "r.4": "Yes, with Deliveroo and Glovo. In the shop everything can be taken away.",
      "q.5": "What kind of focaccia do you make?",
      "r.5": "Genoese focaccia baked in the tray: low, soft, with dimples full of oil. Classic, with cherry tomatoes, olives, onion, potatoes and pancetta, ham and cheese, grilled vegetables, and sweet too.",
      "q.6": "What else is there besides focaccia?",
      "r.6": "Panzerotti, pizza in the tray, small focaccias and calzoni, piadine, Nutella parcels.",
      "piede.c": "and more… since 2006",
      "piede.d": "Viale dell’Innovazione 11, 20126 Milan · <a href='tel:+390239662266'>02 3966 2266</a>",
      "piede.b": "Demo website made by <a href='https://bespokestud.io' target='_blank' rel='noopener'>Bespoke Studio</a> · hours and information from the business’s public sources; photographs by the owner and by customers, published on Google Maps.",
      "b.chiama": "Call",
      "b.focacce": "Focaccia",
      "b.orari": "Hours",
      "b.mappa": "Map",
      "lb.chiudi": "Close",
    },
    /* MULTILINGUA (V4) — per i siti con più di due lingue, al posto di EN:
         LANGS: { en: {chiave:'...'}, ar: {chiave:'...'} }
       L'italiano resta SEMPRE la lingua del DOM e non ha dizionario.
       Se si valorizza EN e non LANGS, il comportamento è identico a prima. */
    LANGS: null,
    RTL: ['ar', 'he', 'fa', 'ur'],   // lingue che ribaltano dir=rtl
    /* etichette dello stato orari per lingua non-IT; l'IT è nel codice.
       Chiave mancante = fallback all'inglese, poi all'italiano. */
    HOURS_I18N: null,
  };
  /* normalizzazione: EN storico -> LANGS */
  if (!SITE.LANGS) SITE.LANGS = SITE.EN && Object.keys(SITE.EN).length ? { en: SITE.EN } : {};
  var LANG_CODES = Object.keys(SITE.LANGS);   // senza 'it', che è il DOM
  /* ═════════════════════════════════════════════════════════════════ */

  /* ---------- WhatsApp wiring ---------- */
  if (SITE.whatsapp.number) {
    var waHref = 'https://wa.me/' + SITE.whatsapp.number + '?text=' +
      encodeURIComponent(SITE.whatsapp.message);
    SITE.whatsapp.ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.href = waHref; el.target = '_blank'; el.rel = 'noopener'; }
    });
  }

  /* ---------- GSAP: registrazione IMMEDIATA + reveal + watchdog ---------- */
  var hasGsap = typeof gsap !== 'undefined';
  var hasST = hasGsap && typeof ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  function showAllReveals() {
    var els = document.querySelectorAll(SITE.revealSelector);
    els.forEach(function (el) { el.classList.add(SITE.inViewClass); });
    if (hasGsap) {
      if (hasST) {
        els.forEach(function (el) {
          ScrollTrigger.getAll().forEach(function (st) {
            if (st.trigger === el && !st.progress) st.kill();
          });
        });
      }
      gsap.set(els, { opacity: 1, y: 0, x: 0 });
    }
  }
  // FIX FOUC (18/7): il watchdog è SOLO un fallback se GSAP non c'è (o reduced-motion).
  // Rivelare in anticipo tutti i .reveal mentre gli scroll-trigger sono attivi causava il
  // flash (scompaiono/ricompaiono) sotto la piega. Con GSAP attivo, rivelano gli ScrollTrigger.
  setTimeout(function () { if (!hasGsap || reducedMotion) showAllReveals(); }, 1500);

  if (hasGsap && !reducedMotion) {
    // reveal generico: le animazioni-FIRMA del sito vanno oltre questo,
    // ma si registrano ANCHE LORO subito, mai dopo l'intro.
    // ⚠️ REGOLA ANTI-FLASH (18/7): un elemento .reveal deve avere UNA SOLA animazione che
    // ne porta l'opacità a 1. Se un elemento ha una FIRMA che ne anima l'opacità (stagger,
    // timeline, ecc.), ESCLUDILO da qui via SITE.revealSelector (es. '.reveal:not(.mondo)'),
    // altrimenti il reveal generico + la firma si sovrappongono e l'elemento FLASHA.
    // immediateRender:false → lo stato "from" (opacity:0) NON viene ri-applicato ad ogni
    // ScrollTrigger.refresh() (che scatta al window.load mentre scrolli) → niente flash su refresh.
    gsap.utils.toArray(SITE.revealSelector).forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  } else {
    // fallback senza GSAP: IntersectionObserver + classe
    if ('IntersectionObserver' in window && !reducedMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add(SITE.inViewClass); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(SITE.revealSelector).forEach(function (el) { io.observe(el); });
    } else {
      showAllReveals();
    }
  }

  /* ---------- intro skippabile (NON gate-a nulla) ---------- */
  var intro = document.getElementById(SITE.introId);
  /* ⚠️ L'hook si legge AL MOMENTO DELLA CHIAMATA, mai catturato per valore
     qui. Il codice-firma vive sotto il marcatore di fine plumbing — cioè
     gira DOPO questa riga — quindi `window.bespokeHeroEntrance ||
     function(){}` congelava la funzione vuota e l'entrata dell'hero non
     partiva più: titolo a opacity 0 per sempre, hero vuota sul live.
     (20/7/2026, riprodotto a schermo su Benessere Futuro #159.) */
  function heroEntrance() {
    if (typeof window.bespokeHeroEntrance === 'function') window.bespokeHeroEntrance();
  }
  function hideIntro() {
    if (!intro) return;
    var el = intro; intro = null;
    el.classList.add('hide');
    setTimeout(function () { el.remove(); }, 700);
    heroEntrance();
  }
  // rimozione IMMEDIATA (niente fade): serve quando qualcosa deve stare sopra
  // l'intro subito, es. l'apertura del menu. Durante il fade l'intro resta
  // hit-testable e i link del drawer non sono cliccabili.
  function killIntroNow() {
    if (!intro) return;
    var el = intro; intro = null;
    el.remove();
    heroEntrance();
  }
  if (reducedMotion || !intro) {
    if (intro) { intro.remove(); intro = null; }
    /* ⚠️ setTimeout 0 NON è decorativo: senza intro questo ramo gira in modo
       SINCRONO, cioè PRIMA che il codice-firma — che sta sotto il marcatore
       di fine plumbing, dentro questa stessa IIFE — abbia assegnato
       `window.bespokeHeroEntrance`. Il risultato è un'entrata dell'hero MUTA:
       nessun errore, elementi visibili, animazione semplicemente mai partita.
       Rimandando di un tick la IIFE è conclusa e l'hook esiste.
       (14/8/2026, A.S.FA. Sicilia: misurato h1 a opacity 1 già al load.)
       Cugino del bug `hero-hook-congelato` del 20/7: lì l'hook era catturato
       troppo presto, qui è CHIAMATO troppo presto. */
    setTimeout(heroEntrance, 0);
  } else {
    setTimeout(hideIntro, SITE.introDuration);
    setTimeout(hideIntro, 6000); // safety net: l'intro non può incastrarsi
    intro.addEventListener('click', hideIntro);
  }

  /* ---------- burger menu (inert + focus + Escape + resize) ---------- */
  var burger = document.getElementById('burger');
  /* 26/7/2026 (Il Papiro #168) — IL PANNELLO SI RISOLVE DA `aria-controls`.
     Il canone apriva sempre `#mainNav`, dando per scontato che la nav
     desktop FOSSE anche il drawer. Molti siti invece hanno un drawer
     separato (`#mobile-menu`) con `hidden`, mentre `#mainNav` su mobile è
     `display:none`: il burger aggiungeva `nav-open` a un elemento nascosto
     e il menu non si apriva. È la stessa decisione già presa il 20/7 per
     qa-motion — «è lì che il markup accessibile dice qual è il pannello» —
     che però non era mai rientrata qui. */
  var nav = (function () {
    var byAria = burger && burger.getAttribute('aria-controls');
    return (byAria && document.getElementById(byAria)) || document.getElementById('mainNav');
  })();
  if (burger && nav) {
    var navUsaHidden = nav.hasAttribute('hidden');
    var lastFocus = null;
    var closeNav = function () {
      nav.classList.remove('nav-open');
      if (navUsaHidden) nav.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    };
    var openNav = function () {
      // L'intro ha z-index alto ed è figlia del body: se è ancora a schermo
      // copre il drawer (che vive nello stacking context dell'header) e i link
      // risultano non cliccabili. Aprire il menu chiude l'intro.
      // (bug trovato da qa-motion su Linea Uomo, 19/7/2026 → PLUMBING_V 2)
      if (typeof killIntroNow === 'function') killIntroNow();
      lastFocus = document.activeElement;
      if (navUsaHidden) nav.hidden = false;
      nav.classList.add('nav-open');
      burger.setAttribute('aria-expanded', 'true');
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    };
    burger.addEventListener('click', function () {
      nav.classList.contains('nav-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > SITE.breakpointMenu) closeNav();
    });
  }

  /* ---------- lightbox accessibile ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  if (lightbox && lightboxImg) {
    var opener = null;
    var openLb = function (src, alt) {
      lightboxImg.src = src; lightboxImg.alt = alt || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    };
    var closeLb = function () {
      lightbox.hidden = true; lightboxImg.src = '';
      document.body.style.overflow = '';
      if (opener) { opener.focus(); opener = null; }
    };
    document.querySelectorAll('[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        var img = btn.querySelector('img');
        openLb(btn.getAttribute('data-full'), img ? img.alt : '');
      });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLb();
    });
  }

  /* ---------- orari dinamici Europe/Rome (finestre multiple + scavalco) ---------- */
  function romeNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var get = function (t) { return p.find(function (x) { return x.type === t; }).value; };
      return { day: map[get('weekday')], mins: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  var toMin = function (hm) {
    var a = hm.split(':');
    return parseInt(a[0], 10) * 60 + parseInt(a[1], 10);
  };
  var fmt = function (m) {
    m = m % 1440;
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
  };
  var DAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var HOURS_BASE = {
    it: { open: 'Aperto ora', closesAt: 'chiude alle ', opensToday: 'Chiuso · apre oggi alle ',
          opensOn: 'Chiuso · apre {day} alle ', closed: 'Chiuso', days: DAYS_IT },
    en: { open: 'Open now', closesAt: 'closes at ', opensToday: 'Closed · opens today at ',
          opensOn: 'Closed · opens {day} at ', closed: 'Closed', days: DAYS_EN },
  };
  /* risolve le etichette orari per la lingua richiesta, con fallback en -> it */
  function strings(lang) {
    var custom = (SITE.HOURS_I18N && SITE.HOURS_I18N[lang]) || null;
    var base = HOURS_BASE[lang] || HOURS_BASE.en;
    if (!custom) return base;
    var outp = {};
    Object.keys(HOURS_BASE.it).forEach(function (k) {
      outp[k] = custom[k] !== undefined ? custom[k] : base[k];
    });
    return outp;
  }

  function hoursState() {
    var now = romeNow();
    // finestra del giorno corrente
    var wins = SITE.hours[now.day] || [];
    for (var i = 0; i < wins.length; i++) {
      var s = toMin(wins[i][0]), e = toMin(wins[i][1]);
      if (now.mins >= s && now.mins < Math.min(e, 1440)) {
        return { open: true, day: now.day, closesAt: fmt(e) };
      }
    }
    // coda dopo mezzanotte della sera PRIMA
    var prev = (now.day + 6) % 7;
    var pw = SITE.hours[prev] || [];
    for (var j = 0; j < pw.length; j++) {
      var pe = toMin(pw[j][1]);
      if (pe > 1440 && now.mins < pe - 1440) {
        return { open: true, day: prev, closesAt: fmt(pe) };
      }
    }
    // chiuso: prossima apertura (oggi o nei prossimi 7 giorni)
    for (var k = 0; k < wins.length; k++) {
      if (now.mins < toMin(wins[k][0])) {
        return { open: false, day: now.day, opensToday: fmt(toMin(wins[k][0])) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var nd = (now.day + d) % 7;
      var nw = SITE.hours[nd] || [];
      if (nw.length) return { open: false, day: now.day, opensDay: nd, opensAt: fmt(toMin(nw[0][0])) };
    }
    return { open: false, day: now.day };
  }

  function renderHours() {
    var el = document.getElementById(SITE.hoursStatusId);
    var st = hoursState();
    document.querySelectorAll(SITE.hoursTableSelector).forEach(function (row) {
      row.classList.toggle(SITE.todayClass,
        parseInt(row.getAttribute('data-day'), 10) === st.day);
    });
    if (!el) return;
    /* V4: le etichette si risolvono per lingua corrente, non con un booleano
       en/it. Fallback a catena lingua -> en -> it, così un sito con AR o FR
       che non traduce lo stato orari resta comunque leggibile. */
    var L = strings(root.lang);
    var txt;
    if (st.open) {
      txt = L.open + ' · ' + L.closesAt + st.closesAt;
    } else if (st.opensToday) {
      txt = L.opensToday + st.opensToday;
    } else if (st.opensAt !== undefined) {
      txt = L.opensOn.replace('{day}', L.days[st.opensDay]) + st.opensAt;
    } else {
      txt = L.closed;
    }
    el.textContent = txt;
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ---------- i18n overlay (EN sopra l'IT del DOM) ---------- */
  var originals = {}; // attr -> key -> testo IT
  var I18N_ATTRS = [
    ['data-i18n', null],
    ['data-i18n-aria', 'aria-label'],
    ['data-i18n-alt', 'alt'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-title', 'title'],
  ];
  function setLang(lang) {
    /* V4: qualunque lingua dichiarata in SITE.LANGS, non più solo 'en'.
       'it' resta la lingua del DOM: nessun dizionario, nessuna sostituzione.
       Una lingua sconosciuta ricade su 'it' invece di rompere la pagina. */
    root.lang = (lang === 'it' || LANG_CODES.indexOf(lang) !== -1) ? lang : 'it';
    root.dir = SITE.RTL.indexOf(root.lang) !== -1 ? 'rtl' : 'ltr';
    var dict = SITE.LANGS[root.lang] || null;
    I18N_ATTRS.forEach(function (pair) {
      var dattr = pair[0], target = pair[1];
      if (!originals[dattr]) originals[dattr] = {};
      document.querySelectorAll('[' + dattr + ']').forEach(function (el) {
        var key = el.getAttribute(dattr);
        var store = originals[dattr];
        /* innerHTML, NON textContent: gli elementi tradotti contengono
           quasi sempre markup (<strong>, <br>) e con textContent il primo
           passaggio a EN lo appiattisce — tornando in italiano il grassetto
           non torna più. I valori del dizionario sono statici e scritti da
           noi. (20/7/2026: la flotta era già così, il boilerplate no.) */
        if (!(key in store)) store[key] = target ? el.getAttribute(target) : el.innerHTML;
        var val = dict && dict[key] !== undefined ? dict[key] : store[key];
        if (target) el.setAttribute(target, val); else el.innerHTML = val;
      });
    });
    renderHours();
    /* stato visivo della coppia di bottoni lingua, se il sito la usa */
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      var on = b.getAttribute('data-lang') === root.lang;
      b.classList.toggle('is-on', on);
      if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem(SITE.slug + '-lang', lang); } catch (e) {}
  }
  /* 26/7/2026 (Il Papiro #168) — SI CABLANO ENTRAMBE LE FORME DI SELETTORE.
     Il canone conosceva solo il toggle singolo `#langToggle`, ma nella
     flotta esiste da tempo anche la COPPIA di bottoni `[data-lang]`
     (Warsa, Mido…): `i18n-roundtrip` era già stato insegnato a riconoscerle
     il 20/7, il plumbing no. Chi copiava il boilerplate e usava la coppia
     si ritrovava il cambio lingua MORTO, e nessun lint statico se ne
     accorgeva (lo becca solo qa-motion, a runtime). */
  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    /* V4: il toggle singolo CICLA sull'anello ['it', ...LANG_CODES].
       Con due lingue il comportamento è identico a prima (it <-> en). */
    var RING = ['it'].concat(LANG_CODES);
    langToggle.addEventListener('click', function () {
      var i = RING.indexOf(root.lang);
      setLang(RING[(i + 1) % RING.length]);
    });
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  try {
    var saved = localStorage.getItem(SITE.slug + '-lang');
    if (saved && saved !== 'it' && LANG_CODES.indexOf(saved) !== -1) setLang(saved);
  } catch (e) {}

  /* ---------- action-bar mobile (opzionale: #actionBar) ---------- */
  var actionBar = document.getElementById('actionBar');
  if (actionBar) {
    var onScroll = function () {
      actionBar.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════ FINE PLUMBING — da qui in giù SOLO il codice-firma
     del sito (animazioni e interazioni uniche del cliente), che si
     registra comunque SUBITO, mai dentro setTimeout/intro. ══════════ */
  /* ═══ FIRMA · Focacceria Ligure — «E non solo…» ═══
     Il nome è una frase con i puntini, ed è scritto sulla loro tenda. Qui i tre puntini sono
     tre FOSSETTE di focaccia genovese: si fanno premendo l'impasto con le dita, una dopo
     l'altra. Ogni «e non solo…» della pagina viene premuto quando entra in vista.
     Regole: solo gsap.set + gsap.to (mai un "from" che un refresh possa riapplicare);
     nessun elemento-firma è un .reveal; senza GSAP le fossette restano visibili (il CSS
     non le nasconde: le nasconde solo GSAP, che poi le rivela). */

  /* il modulo «Oggi»: giorno, orario e frase della sera, dalla stessa tabella orari */
  var ST = {
    it: { giorni: ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'],
          chiuso: 'Chiuso', chiusoOggi: 'Oggi siamo chiusi: riapriamo {g} alle {h}.',
          sera: 'Stasera aperti fino alle {h}: prima o dopo lo spettacolo.',
          giorno: 'Oggi chiudiamo alle {h}. Le sere del teatro sono giovedì, venerdì e sabato.' },
    en: { giorni: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          chiuso: 'Closed', chiusoOggi: 'Closed today: we reopen on {g} at {h}.',
          sera: 'Open tonight until {h}: before or after the show.',
          giorno: 'Today we close at {h}. Theatre nights are Thursday, Friday and Saturday.' },
  };
  function renderStasera() {
    var g = document.getElementById('staseraGiorno'), o = document.getElementById('staseraOre'), st = document.getElementById('staseraStato');
    if (!g || !o || !st) return;
    var L = ST[root.lang] || ST.it;
    var now = romeNow();
    var wins = SITE.hours[now.day] || [];
    g.textContent = L.giorni[now.day];
    if (!wins.length) {
      o.textContent = L.chiuso;
      var nd = now.day, nw = [];
      for (var d = 1; d <= 7; d++) { nd = (now.day + d) % 7; nw = SITE.hours[nd] || []; if (nw.length) break; }
      st.textContent = L.chiusoOggi.replace('{g}', L.giorni[nd]).replace('{h}', nw.length ? nw[0][0] : '');
      return;
    }
    var a = wins[0][0], b = wins[wins.length - 1][1];
    o.textContent = a + ' – ' + b;
    var chiude = parseInt(b.split(':')[0], 10) * 60 + parseInt(b.split(':')[1], 10);
    st.textContent = (chiude >= 21 * 60 ? L.sera : L.giorno).replace('{h}', b);
  }
  renderStasera();
  setInterval(renderStasera, 60000);
  new MutationObserver(renderStasera).observe(root, { attributes: true, attributeFilter: ['lang'] });

  /* entrata dell'apertura: chiamata dal plumbing a fine intro */
  window.bespokeHeroEntrance = function () {
    if (!hasGsap || reducedMotion) return;
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.apertura__foto img', { scale: 1.07, duration: 1.4, ease: 'power2.out' }, 0)
      .from('.riga__in', { yPercent: 108, duration: 0.9, stagger: 0.12 }, 0.05)
      .from('.puntini--hero i', { scale: 0, duration: 0.45, stagger: 0.14, ease: 'back.out(3)' }, 0.5)
      .from('.apertura__refrain .corsivo', { opacity: 0, x: -10, duration: 0.5 }, 0.95)
      .from('.apertura__eti, .apertura__p, .apertura__azioni, .apertura__stato', { opacity: 0, y: 16, duration: 0.55, stagger: 0.08 }, 0.6);
  };

  if (hasGsap && hasST && !reducedMotion) {
    /* le fossette dei refrain: premute una dopo l'altra quando il blocco entra */
    gsap.utils.toArray('.refrain').forEach(function (r) {
      var punti = r.querySelectorAll('.puntini i');
      var cor = r.querySelector('.corsivo');
      if (!punti.length) return;
      gsap.set(punti, { scale: 0, transformOrigin: '50% 50%' });
      if (cor) gsap.set(cor, { opacity: 0, x: -10 });
      var tl = gsap.timeline({ scrollTrigger: { trigger: r, start: 'top 82%', once: true } });
      tl.to(punti, { scale: 1, duration: 0.45, stagger: 0.14, ease: 'back.out(3)' }, 0);
      if (cor) tl.to(cor, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0.35);
    });
    /* il modulo «Oggi» si accende: l'orario passa da crema a terracotta */
    var ore = document.getElementById('staseraOre');
    if (ore) {
      gsap.set(ore, { color: '#241A14' });
      gsap.to(ore, { color: '#B4531E', duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: ore, start: 'top 85%', once: true } });
    }
  }
})();
