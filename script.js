(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const precio = (n) => '$' + n.toLocaleString('es-AR');

  /* ───────────── Intro del logo ───────────── */
  const hero = $('.hero');
  const INTRO_MS = 3400;
  let introTimer;

  function playIntro() {
    if (reducedMotion) return;
    clearTimeout(introTimer);
    hero.classList.remove('is-playing');
    void hero.offsetWidth; // reinicia las animaciones
    hero.classList.add('is-playing');
    introTimer = setTimeout(endIntro, INTRO_MS);
  }
  function endIntro() {
    clearTimeout(introTimer);
    hero.classList.remove('is-playing');
    kick();
  }

  playIntro();
  // Cualquier toque o scroll durante la intro la saltea
  hero.addEventListener('click', endIntro);
  addEventListener('scroll', () => { if (scrollY > 80) endIntro(); }, { passive: true });

  /* ───────────── Nav: fondo sólido y taza que se llena con el scroll ───────────── */
  const nav = $('#nav');
  const navFill = $('#nav-fill');
  const navLinks = [...document.querySelectorAll('.nav nav a')];
  const LAYER_H = 412;

  function onScroll() {
    nav.classList.toggle('is-solid', scrollY >= hero.offsetHeight - nav.offsetHeight - 1);
    const max = document.documentElement.scrollHeight - innerHeight;
    const progress = max > 0 ? Math.min(scrollY / max, 1) : 0;
    navFill.style.transform = `translateY(${(1 - progress) * LAYER_H}px)`;
    // Marca en el nav la sección que ocupa el centro de la pantalla
    navLinks.forEach((link) => {
      const box = $(link.hash).getBoundingClientRect();
      const on = box.top <= innerHeight / 2 && box.bottom > innerHeight / 2;
      if (on) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }
  addEventListener('scroll', () => { onScroll(); renderCup(); }, { passive: true });
  addEventListener('resize', () => { onScroll(); kick(); });
  onScroll();

  /* ───────────── Carta ───────────── */
  const tabsEl = $('#tabs');
  const panelsEl = $('#panels');
  const bodyEl = $('#menu-body');
  const viewer = $('#viewer');
  const slot = $('#viewer-slot');
  const floatCup = $('#float-cup');
  const layers = [...floatCup.querySelectorAll('.layer')];
  const SIZE = { 80: 0.6, 200: 0.84, 280: 1 };
  const selected = {}; // última bebida elegida por pestaña
  let levels = [0, 0, 0, 0]; // nivel de cada rect (de la capa de arriba a la de abajo), 0 a 1

  const info = $('.viewer__info');
  let shown = null;

  function showDrink(section, item) {
    selected[section.id] = item;
    if (item !== shown) {
      shown = item;
      info.classList.remove('swap');
      void info.offsetWidth; // reinicia la animación
      info.classList.add('swap');
    }
    $('#viewer-name').textContent = item.nombre;
    $('#viewer-price').textContent = precio(item.precio);
    $('#viewer-size').textContent = item.ml ? `Taza de ${item.ml} ml` : 'Con hielo';
    slot.style.setProperty('--size', SIZE[item.ml] || 1);
    floatCup.classList.toggle('is-iced', !!section.hielo);

    // Niveles acumulados; los rect van de la capa de arriba a la de abajo
    const acc = [];
    item.capas.reduce((sum, [, part], i) => (acc[i] = sum + part), 0);
    levels = layers.map((rect, d) => {
      const j = item.capas.length - 1 - d;
      if (j < 0) { rect.style.transitionDelay = '0s'; return 0; }
      rect.style.fill = INGREDIENTES[item.capas[j][0]].color;
      rect.style.transitionDelay = `${j * 0.12}s`;
      return acc[j];
    });
    kick(900); // acompaña la transición de tamaño del visor

    $('#viewer-legend').replaceChildren(
      ...[...item.capas].reverse().map(([id], i) => {
        const li = document.createElement('li');
        li.style.setProperty('--i', i);
        const dot = document.createElement('i');
        dot.style.background = INGREDIENTES[id].color;
        li.append(dot, INGREDIENTES[id].nombre);
        return li;
      })
    );
  }

  function buildDrinks(section) {
    const list = document.createElement('ul');
    list.className = 'drinks';
    section.items.forEach((item, i) => {
      const li = document.createElement('li');
      li.style.setProperty('--i', i);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'drink';
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML = `<span>${item.nombre}</span><span class="price">${precio(item.precio)}</span>`;
      const pick = () => {
        list.querySelectorAll('.drink').forEach((b) => b.setAttribute('aria-pressed', b === btn));
        showDrink(section, item);
      };
      btn.addEventListener('click', pick);
      btn.addEventListener('focus', pick);
      btn.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') pick(); });
      li.append(btn);
      list.append(li);
    });
    return list;
  }

  function buildGroups(section) {
    const wrap = document.createElement('div');
    wrap.className = 'groups';
    section.grupos.forEach((grupo) => {
      const div = document.createElement('div');
      div.className = 'group' + (grupo.columnas ? ' group--wide' : '');
      const rows = grupo.items.map((item, i) => `
        <li class="row" style="--i: ${i}">
          <div class="row__top">
            <span class="row__name">${item.nombre}</span>
            ${item.vegano ? '<span class="badge">Vegano</span>' : ''}
            ${item.sinTacc ? '<span class="badge">Sin TACC</span>' : ''}
            <span class="price">${precio(item.precio)}</span>
          </div>
          ${item.detalle ? `<p class="row__detail">${item.detalle}</p>` : ''}
        </li>`).join('');
      div.innerHTML = `<h3>${grupo.titulo}</h3><ul>${rows}</ul>`;
      wrap.append(div);
    });
    return wrap;
  }

  function selectTab(id, focus) {
    const section = CARTA.find((s) => s.id === id);
    tabsEl.querySelectorAll('.tab').forEach((tab) => {
      const on = tab.dataset.id === id;
      tab.setAttribute('aria-selected', on);
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
      // Centra la pestaña elegida deslizando solo la fila de pestañas: scrollIntoView movía
      // también la página y, al cargar, salteaba la animación del inicio
      if (on) tabsEl.scrollTo({ left: tab.offsetLeft - (tabsEl.clientWidth - tab.offsetWidth) / 2, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
    panelsEl.querySelectorAll('.panel').forEach((p) => (p.hidden = p.dataset.id !== id));
    bodyEl.classList.toggle('has-viewer', !!section.taza);
    $('#menu-hint').hidden = !section.taza;
    if (section.taza) {
      const item = selected[id] || section.items.find((i) => i.nombre === section.inicial) || section.items[0];
      const idx = section.items.indexOf(item);
      $(`.panel[data-id="${id}"]`).querySelectorAll('.drink')
        .forEach((b, i) => b.setAttribute('aria-pressed', i === idx));
      showDrink(section, item);
    }
    kick();
  }

  CARTA.forEach((section, i) => {
    const tab = document.createElement('button');
    tab.style.setProperty('--i', i);
    tab.type = 'button';
    tab.className = 'tab';
    tab.id = `tab-${section.id}`;
    tab.dataset.id = section.id;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `panel-${section.id}`);
    tab.textContent = section.nombre;
    tab.addEventListener('click', () => selectTab(section.id));
    tabsEl.append(tab);

    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.id = `panel-${section.id}`;
    panel.dataset.id = section.id;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.hidden = true;
    panel.append(section.taza ? buildDrinks(section) : buildGroups(section));
    if (section.nota) {
      const note = document.createElement('p');
      note.className = 'note';
      note.innerHTML = `<strong>${section.nota.titulo}</strong>${section.nota.texto}`;
      panel.append(note);
    }
    panelsEl.append(panel);
  });

  tabsEl.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const i = CARTA.findIndex((s) => s.id === e.target.dataset.id);
    selectTab(CARTA[(i + step + CARTA.length) % CARTA.length].id, true);
  });

  /* ───────────── Títulos palabra por palabra ─────────────
     Cada palabra (o letra, con data-split="letters") queda en su propio span para
     animarla; el texto completo se mantiene en un span oculto para lectores de pantalla. */
  document.querySelectorAll('[data-split]').forEach((el) => {
    const text = el.textContent.trim();
    const byLetter = el.dataset.split === 'letters';
    const parts = byLetter ? [...text] : text.split(/\s+/);
    const words = parts.flatMap((part, i) => {
      const w = document.createElement('span');
      const inner = document.createElement('span');
      w.className = 'w';
      w.setAttribute('aria-hidden', 'true');
      inner.textContent = part === ' ' ? '\u00a0' : part;
      inner.style.setProperty('--i', i);
      w.append(inner);
      return byLetter || i === parts.length - 1 ? [w] : [w, ' '];
    });
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = text;
    el.replaceChildren(sr, ...words);
  });

  /* ───────────── Aparición al hacer scroll + sección activa en el nav ───────────── */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    // Las opciones entran del costado apenas la carta asoma por abajo, sin esperar a la taza.
    // La carta es muy alta: por eso alcanza con que asome, en vez de pedir un porcentaje visible.
    new IntersectionObserver(([entry], obs) => {
      if (entry.isIntersecting) { bodyEl.classList.add('is-in'); obs.disconnect(); }
    }, { rootMargin: '0px 0px -15% 0px' }).observe(bodyEl);
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
    bodyEl.classList.add('is-in');
  }

  /* ───────────── Taza viajera ─────────────
     Una sola taza para toda la página. Al empezar a bajar, la taza sale sola de la última
     "a" del logo y vuela hasta el visor de la carta, llenándose con el café elegido. El vuelo
     dura lo mismo siempre: no depende de cuánto ni de qué tan rápido se haga scroll.
     Ya apoyada, se queda en el visor (se va con la carta al subir). Al volver arriba de
     todo, el logo recupera su taza y el vuelo se rearma. */
  const logoBox = $('.logo__cup-box');
  const CUP_W = 541, CUP_H = 550; // tamaño base del SVG, igual a su viewBox
  const FLIGHT_MS = 1100;
  const LEAVE_AT = 40; // px de scroll para que la taza salga del logo
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const smooth = (a, b, x) => { const k = Math.min(Math.max((x - a) / (b - a), 0), 1); return k * k * (3 - 2 * k); };
  let running = false;
  let until = 0;
  let state = 'home'; // home: en el logo · flying: volando · docked: apoyada en el visor
  let flightStart = 0;

  function renderCup() {
    const intro = hero.classList.contains('is-playing');
    const to = slot.getBoundingClientRect();
    const hasSlot = to.width > 0;

    if (intro) {
      floatCup.classList.add('is-hidden');
      hero.classList.remove('cup-out');
      return;
    }

    // Con movimiento reducido no vuela: el logo conserva su taza y la del visor ya está ahí
    if (reducedMotion) state = 'docked';
    else if (scrollY < 10) state = 'home';
    else if (state === 'home' && scrollY > LEAVE_AT && hasSlot) {
      state = 'flying';
      flightStart = performance.now();
      kick(FLIGHT_MS + 50);
    }

    const showFloat = state !== 'home' && hasSlot;
    floatCup.classList.toggle('is-hidden', !showFloat);
    hero.classList.toggle('cup-out', showFloat && !reducedMotion);
    if (!showFloat) return;

    let p = 1;
    if (state === 'flying') {
      p = Math.min((performance.now() - flightStart) / FLIGHT_MS, 1);
      if (p >= 1) state = 'docked';
    }
    const e = ease(p);
    const from = logoBox.getBoundingClientRect();
    const w = from.width + (to.width - from.width) * e;
    const x = from.left + (to.left - from.left) * e + w / 2;
    const y = from.top + (to.top - from.top) * e + (w * CUP_H / CUP_W) / 2;
    const tilt = Math.sin(e * Math.PI) * -14; // se ladea un poco en el camino
    floatCup.style.transform =
      `translate(${x}px, ${y}px) rotate(${tilt}deg) scale(${w / CUP_W}) translate(${-CUP_W / 2}px, ${-CUP_H / 2}px)`;

    // Blanca sobre el verde del inicio, verde sobre la carta
    floatCup.classList.toggle('on-dark', y < hero.getBoundingClientRect().bottom);

    // Se llena en la segunda mitad del vuelo; ya apoyada, los cambios de café se animan solos
    const fill = smooth(0.4, 1, p);
    floatCup.classList.toggle('is-scrubbing', state === 'flying');
    floatCup.style.setProperty('--ice', fill);
    layers.forEach((rect, i) => {
      rect.style.transform = `translateY(${(1 - levels[i] * fill) * LAYER_H}px)`;
    });
  }

  // Redibuja en el próximo cuadro y sigue haciéndolo `ms` milisegundos más
  function kick(ms = 0) {
    until = Math.max(until, performance.now() + ms);
    if (running) return;
    running = true;
    requestAnimationFrame(function tick(now) {
      renderCup();
      if (now < until) requestAnimationFrame(tick);
      else running = false;
    });
  }

  selectTab(CARTA[0].id);
  kick(INTRO_MS);
  document.fonts?.ready.then(() => kick());
})();
