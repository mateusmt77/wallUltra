// Both pages share the editor instance, so visiting the guide never discards a draft.
const editor = document.getElementById('page-editor');
const about = document.getElementById('page-sobre');
const pages = { editor, sobre: about };
const scrollPositions = { editor: 0, sobre: 0 };
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let activePage, navigationRequest = 0, exitAnimation, enterAnimation;
const pageForHash = hash => ['#sobre', '#como-funciona', '#perguntas-frequentes'].includes(hash) ? 'sobre' : 'editor';
function enterPage(page, offset, from = { opacity: 0, transform: `translate3d(${offset}px, 0, 0)` }) {
  const animation = pages[page].animate([from, { opacity: 1, transform: 'translate3d(0, 0, 0)' }], {
    duration: 280, easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
  });
  enterAnimation = animation;
  animation.finished.catch(() => {}).finally(() => { if (enterAnimation === animation) enterAnimation = undefined; });
}
async function showPage(page, { focus = true } = {}) {
  // Only the most recent request may change the page, scroll or focus.
  const request = ++navigationRequest;
  const previous = pages[activePage];
  const canAnimate = previous && !reducedMotion.matches && typeof previous.animate === 'function';
  const visual = canAnimate ? { opacity: getComputedStyle(previous).opacity, transform: getComputedStyle(previous).transform } : undefined;
  const wasMoving = !!enterAnimation || !!exitAnimation;
  exitAnimation?.cancel(); enterAnimation?.cancel();
  exitAnimation = enterAnimation = undefined;
  if (page === activePage) {
    if (canAnimate && wasMoving) enterPage(page, 0, visual);
    return true;
  }
  const offset = page === 'sobre' ? 24 : -24;
  if (canAnimate) {
    const leaving = previous.animate([visual, { opacity: 0, transform: `translate3d(${-offset}px, 0, 0)` }], {
      duration: 120, easing: 'ease-in', fill: 'forwards'
    });
    exitAnimation = leaving;
    await leaving.finished.catch(() => {});
    if (request !== navigationRequest) return false;
  }
  if (activePage) scrollPositions[activePage] = window.scrollY;
  if (page === 'sobre' && document.body.classList.contains('editor-expanded')) document.getElementById('board-expand').click();
  editor.hidden = page !== 'editor'; about.hidden = page !== 'sobre';
  document.getElementById('save').hidden = page === 'sobre';
  document.getElementById('nav-create').hidden = page !== 'sobre';
  document.querySelectorAll('[data-page-link]').forEach(link => {
    if (link.dataset.pageLink === page) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  activePage = page;
  document.title = page === 'sobre' ? 'Sobre o WallUltra — Conheça e comece a criar' : 'WallUltra — Sua tela merece personalidade';
  window.scrollTo(0, scrollPositions[page]);
  if (focus) document.getElementById(page === 'sobre' ? 'about-title' : 'editor-title').focus({ preventScroll: true });
  exitAnimation?.cancel(); exitAnimation = undefined;
  if (canAnimate && !reducedMotion.matches) enterPage(page, offset);
  return true;
}
async function route({ focus = true } = {}) {
  const hash = window.location.hash;
  if (!await showPage(pageForHash(hash), { focus })) return;
  if (['#como-funciona', '#perguntas-frequentes'].includes(hash)) document.querySelector(hash).scrollIntoView({ block: 'start', behavior: 'instant' });
}
window.addEventListener('hashchange', () => route());
reducedMotion.addEventListener('change', event => {
  if (event.matches) { exitAnimation?.finish(); enterAnimation?.finish(); }
});
document.querySelectorAll('[data-start-mode], [data-open-tool]').forEach(link => {
  link.addEventListener('click', async event => {
    event.preventDefault();
    if (window.location.hash !== '#editor') window.history.pushState(null, '', '#editor');
    if (!await showPage('editor', { focus: false })) return;
    const mode = link.dataset.startMode, tool = link.dataset.openTool;
    if (mode) document.getElementById('mode-' + mode).click();
    if (tool) document.getElementById('tab-' + tool).click();
    document.getElementById('studio').scrollIntoView({ block: 'start', behavior: 'instant' });
    const target = tool ? document.getElementById('tab-' + tool) : document.querySelector('.creation-nav [aria-selected="true"]');
    target.focus({ preventScroll: true });
  });
});
route({ focus: false });
