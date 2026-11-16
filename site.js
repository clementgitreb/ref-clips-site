// REF CLIPS — site : téléchargement selon l'ordinateur, onglets Mac / Windows, démo à essayer, barre de temps de la page.
// Même fichier pour la version française et anglaise (langue lue sur <html lang>).
(() => {
  const EN = document.documentElement.lang === 'en';
  const T = EN
    ? { dl: os => `Download for ${os}`, ver: v => `Version ${v} · free during early access`, made: (c, n, t) => `Clip ${c} (${n}) created · ${t}` }
    : { dl: os => `Télécharger pour ${os}`, ver: v => `Version ${v} · gratuit en accès anticipé`, made: (c, n, t) => `Clip ${c} (${n}) créé · ${t}` };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mac / Windows ---------- */
  const isWin = /Windows/i.test(navigator.userAgent), isMac = /Macintosh|Mac OS X/i.test(navigator.userAgent);
  const tab = os => {
    document.querySelectorAll('[data-os]').forEach(b => { b.classList.toggle('on', b.dataset.os === os); b.setAttribute('aria-selected', b.dataset.os === os); });
    document.querySelectorAll('[data-pane]').forEach(p => { p.hidden = p.dataset.pane !== os; });
  };
  document.querySelectorAll('[data-os]').forEach(b => b.addEventListener('click', () => tab(b.dataset.os)));
  if (isWin) tab('win');
  // Liens de téléchargement : version.json (le même fichier que lit l'app pour proposer une nouvelle version).
  fetch((EN ? '../' : '') + 'version.json', { cache: 'no-store' }).then(r => r.json()).then(v => {
    const auto = isWin ? 'win' : isMac ? 'mac' : null;
    const label = document.querySelector('[data-os-label]'), sub = document.querySelector('[data-os-sub]');
    if (auto && label) label.textContent = T.dl(auto === 'win' ? 'Windows' : 'Mac');
    if (v?.version && sub) sub.textContent = T.ver(v.version);
    document.querySelectorAll('[data-dl]').forEach(a => {
      const os = a.dataset.dl === 'auto' ? auto : a.dataset.dl, url = os && v?.[os];
      if (url) a.href = url; // sinon le bouton mène à l'aide d'installation
    });
  }).catch(() => {});

  /* ---------- Démo : on tape un code, le clip se crée ---------- */
  const CODES = [
    ['V-MAR', 'Marcher', 'Travelling', 'viol'], ['V-DRI', 'Reprise de dribble', 'Double dribble', 'viol'], ['V-3s', '3 secondes', '3 seconds', 'viol'],
    ['V-24s', '24 secondes', '24 seconds', 'viol'], ['F-DEF-POU', 'Pousser', 'Pushing', 'faute'], ['F-DEF-HOLD', 'Tenir', 'Holding', 'faute'],
    ['F-OFF-CHA', 'Charge', 'Charge', 'faute'], ['F-OFF-ECR', 'Écran illégal', 'Illegal screen', 'faute'], ['FAS-C1', 'Antisportive C1', 'Unsportsmanlike C1', 'faute'],
    ['M-AT-BAD', 'AT mauvaise position', 'AT poor position', 'meca'], ['M-AK-BAD', 'AK mauvaise position', 'AK poor position', 'meca'],
    ['G-TM', 'Temps-mort', 'Time-out', 'gest'], ['G-ENT', 'Gestion entraîneur', 'Coach management', 'gest'],
  ].map(([code, fr, en, cat]) => ({ code, label: EN ? en : fr, cat }));
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const input = document.getElementById('demoIn'), list = document.getElementById('demoSugg'), said = document.getElementById('demoSaid');
  const bar = document.querySelector('.tl-bar'), fill = bar?.querySelector('b');
  let res = [], sel = 0, play = 61, count = {};
  const find = q => {
    q = norm(q.trim()); if (!q) return [];
    return CODES.map(c => { const l = norm(c.label), k = norm(c.code);
      const s = l.startsWith(q) ? 3 : l.split(/[\s(-]+/).some(w => w.startsWith(q)) ? 2 : k.includes(q) ? 1 : 0; return { c, s }; })
      .filter(x => x.s).sort((a, b) => b.s - a.s).slice(0, 3).map(x => x.c);
  };
  const draw = () => {
    list.innerHTML = res.map((c, i) => `<li role="option" aria-selected="${i === sel}" data-i="${i}" class="${i === sel ? 'on' : ''}"><em style="--c:var(--${c.cat})"></em><span>${c.label}</span><code>${c.code}</code></li>`).join('');
    list.hidden = !res.length;
  };
  const replay = els => { document.querySelector('.stage')?.classList.add('again');
    els.forEach(e => { if (!e) return; e.style.animation = 'none'; void e.getBoundingClientRect(); e.style.animation = ''; }); };
  const mark = c => {
    if (!c) return;
    play = play >= 94 ? 6 : play + 3 + Math.random() * 4; // la lecture avance ; en fin de match, on repart du début
    const min = play / 100 * 40, qt = Math.min(4, Math.floor(play / 25) + 1), time = `QT${qt} · ${String(Math.floor(min)).padStart(2, '0')}:${String(Math.floor(min % 1 * 60)).padStart(2, '0')}`;
    count[c.code] = (count[c.code] || 0) + 1;
    if (bar) {
      bar.querySelectorAll('i.now').forEach(i => i.classList.remove('now'));
      const m = document.createElement('i'); m.className = 'now new'; m.style.left = play + '%'; m.style.setProperty('--c', `var(--${c.cat})`); bar.appendChild(m);
      fill.style.width = play + '%';
    }
    document.querySelector('.lt-code').textContent = c.code;
    document.querySelector('.lt-name').textContent = c.label;
    document.querySelector('.lt-time').textContent = time;
    const word = document.querySelector('.t-word'); if (word) { word.textContent = c.label; word.classList.toggle('long', c.label.length > 11); }
    if (!reduce) replay([...document.querySelectorAll('.t-arrow,.t-head,.t-ring,.t-word')]);
    const lower = document.querySelector('.lower'); lower.classList.remove('flash'); void lower.offsetWidth; lower.classList.add('flash');
    said.textContent = T.made(c.code, count[c.code], time);
    input.value = ''; res = []; draw();
  };
  if (input) {
    input.addEventListener('input', () => { res = find(input.value); sel = 0; draw(); });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (res.length) { sel = (sel + (e.key === 'ArrowDown' ? 1 : res.length - 1)) % res.length; draw(); } }
      if (e.key === 'Enter') { e.preventDefault(); mark(res[sel]); }
      if (e.key === 'Escape') { input.value = ''; res = []; draw(); }
    });
    list.addEventListener('mousedown', e => { const li = e.target.closest('[data-i]'); if (li) { e.preventDefault(); mark(res[+li.dataset.i]); input.focus(); } });
  }

  /* ---------- Barre de temps de la page : se remplit en descendant, un repère par partie ---------- */
  const ptl = document.querySelector('.page-tl');
  if (ptl) {
    const secs = [...document.querySelectorAll('[data-mk]')];
    const marks = secs.map(s => { const i = document.createElement('i'); i.style.setProperty('--c', `var(--${s.dataset.mk})`); ptl.appendChild(i); return i; });
    const place = () => { const H = document.documentElement.scrollHeight - innerHeight; secs.forEach((s, k) => { marks[k].style.left = Math.min(99, (s.offsetTop - innerHeight * .5) / H * 100) + '%'; }); };
    let ticking = false;
    const upd = () => { ticking = false; const H = document.documentElement.scrollHeight - innerHeight, p = H > 0 ? scrollY / H * 100 : 0;
      ptl.style.setProperty('--p', p + '%'); marks.forEach(m => m.classList.toggle('lit', parseFloat(m.style.left) <= p + .5)); };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    addEventListener('resize', () => { place(); upd(); });
    addEventListener('load', () => { place(); upd(); });
    place(); upd();
  }

  /* ---------- Une seule apparition orchestrée : le contenu de l'export se range quand on arrive dessus ---------- */
  const out = document.querySelector('.out');
  if (out && !reduce && 'IntersectionObserver' in window) {
    out.classList.add('wait');
    new IntersectionObserver((es, ob) => { if (es.some(e => e.isIntersecting)) { out.classList.add('in'); ob.disconnect(); } }, { threshold: .35 }).observe(out);
  }
})();
