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
    nav.classList.toggle('is-solid', scrollY > hero.offsetHeight - nav.offsetHeight);
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
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ───────────── Carta ───────────── */
  const tabsEl = $('#tabs');
  const panelsEl = $('#panels');
  const bodyEl = $('#menu-body');
  const viewer = $('#viewer');
  const layers = [...viewer.querySelectorAll('.layer')];
  const SIZE = { 80: 0.6, 200: 0.84, 280: 1 };
  const selected = {}; // última bebida elegida por pestaña

  function showDrink(section, item) {
    selected[section.id] = item;
    $('#viewer-name').textContent = item.nombre;
    $('#viewer-price').textContent = precio(item.precio);
    $('#viewer-size').textContent = item.ml ? `Taza de ${item.ml} ml` : 'Con hielo';
    $('#viewer-cup').style.setProperty('--size', SIZE[item.ml] || 1);
    viewer.classList.toggle('is-iced', !!section.hielo);

    // Niveles acumulados; los rect van de la capa de arriba a la de abajo
    const levels = [];
    item.capas.reduce((acc, [, part], i) => (levels[i] = acc + part), 0);
    layers.forEach((rect, d) => {
      const j = item.capas.length - 1 - d;
      if (j < 0) {
        rect.style.transform = `translateY(${LAYER_H}px)`;
        rect.style.transitionDelay = '0s';
        return;
      }
      rect.style.fill = INGREDIENTES[item.capas[j][0]].color;
      rect.style.transform = `translateY(${(1 - levels[j]) * LAYER_H}px)`;
      rect.style.transitionDelay = `${j * 0.12}s`;
    });

    $('#viewer-legend').replaceChildren(
      ...[...item.capas].reverse().map(([id]) => {
        const li = document.createElement('li');
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
    section.items.forEach((item) => {
      const li = document.createElement('li');
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
      const rows = grupo.items.map((item) => `
        <li class="row">
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
      if (on) tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reducedMotion ? 'auto' : 'smooth' });
    });
    panelsEl.querySelectorAll('.panel').forEach((p) => (p.hidden = p.dataset.id !== id));
    bodyEl.classList.toggle('has-viewer', !!section.taza);
    $('#menu-hint').hidden = !section.taza;
    if (section.taza) {
      const item = selected[id] || section.items[0];
      const idx = section.items.indexOf(item);
      $(`.panel[data-id="${id}"]`).querySelectorAll('.drink')
        .forEach((b, i) => b.setAttribute('aria-pressed', i === idx));
      showDrink(section, item);
    }
  }

  CARTA.forEach((section) => {
    const tab = document.createElement('button');
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

  // La taza queda vacía hasta que la carta entra en pantalla: ahí se sirve el primer café
  let menuSeen = false;
  const firstTab = () => { if (!menuSeen) { menuSeen = true; selectTab(CARTA[0].id); } };

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

    new IntersectionObserver(([entry], obs) => {
      if (entry.isIntersecting) { firstTab(); obs.disconnect(); }
    }, { rootMargin: '0px 0px -25% 0px' }).observe(bodyEl);
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
  }

  // Pinta las pestañas ya (vacías de selección) para que nunca se vea un hueco
  bodyEl.classList.add('has-viewer');
  tabsEl.firstElementChild.setAttribute('aria-selected', 'true');
  panelsEl.firstElementChild.hidden = false;
  tabsEl.querySelectorAll('.tab').forEach((t, i) => (t.tabIndex = i ? -1 : 0));
  if (!('IntersectionObserver' in window)) firstTab();
})();
