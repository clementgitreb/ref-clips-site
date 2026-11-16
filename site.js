// REF CLIPS — site : bon bouton de téléchargement selon l'ordinateur, onglets Mac / Windows.
// Les liens de téléchargement viennent de version.json (même fichier que lit l'app pour proposer une nouvelle version).
(async () => {
  const isWin = /Windows/i.test(navigator.userAgent), isMac = /Macintosh|Mac OS X/i.test(navigator.userAgent);
  const tab = os => {
    document.querySelectorAll('[data-os]').forEach(b => b.classList.toggle('on', b.dataset.os === os));
    document.querySelectorAll('[data-pane]').forEach(p => { p.hidden = p.dataset.pane !== os; });
  };
  document.querySelectorAll('[data-os]').forEach(b => b.addEventListener('click', () => tab(b.dataset.os)));
  if (isWin) tab('win');

  let v = null;
  try { v = await (await fetch('version.json', { cache: 'no-store' })).json(); } catch { /* pas de fichier : les boutons mènent à l'aide */ }
  const auto = isWin ? 'win' : isMac ? 'mac' : null;
  const label = document.querySelector('[data-os-label]'), sub = document.querySelector('[data-os-sub]');
  if (auto && label) label.textContent = `Télécharger pour ${auto === 'win' ? 'Windows' : 'Mac'}`;
  if (v?.version && sub) sub.textContent = `Version ${v.version} · gratuit en accès anticipé`;
  document.querySelectorAll('[data-dl]').forEach(a => {
    const os = a.dataset.dl === 'auto' ? auto : a.dataset.dl;
    const url = os && v?.[os];
    if (!url) return; // pas encore disponible : le bouton mène à l'aide d'installation
    a.href = url;
    a.addEventListener('click', () => { tab(os); setTimeout(() => document.getElementById('installer').scrollIntoView({ behavior: 'smooth' }), 400); });
  });
})();
