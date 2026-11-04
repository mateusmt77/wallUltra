// Both pages share the editor instance, so visiting the guide never discards a draft.
const editor = document.getElementById('page-editor');
const about = document.getElementById('page-sobre');
const scrollPositions = { editor: 0, sobre: 0 };
let activePage;
const pageForHash = hash => ['#sobre', '#como-funciona', '#perguntas-frequentes'].includes(hash) ? 'sobre' : 'editor';
function showPage(page, { focus = true } = {}) {
  if (page === activePage) return;
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
}
function route({ focus = true } = {}) {
  const hash = window.location.hash;
  showPage(pageForHash(hash), { focus });
  if (['#como-funciona', '#perguntas-frequentes'].includes(hash)) document.querySelector(hash).scrollIntoView({ block: 'start', behavior: 'instant' });
}
window.addEventListener('hashchange', () => route());
document.querySelectorAll('[data-start-mode], [data-open-tool]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    if (window.location.hash !== '#editor') window.history.pushState(null, '', '#editor');
    showPage('editor', { focus: false });
    const mode = link.dataset.startMode, tool = link.dataset.openTool;
    if (mode) document.getElementById('mode-' + mode).click();
    if (tool) document.getElementById('tab-' + tool).click();
    document.getElementById('studio').scrollIntoView({ block: 'start', behavior: 'instant' });
    const target = tool ? document.getElementById('tab-' + tool) : document.querySelector('.creation-nav [aria-selected="true"]');
    target.focus({ preventScroll: true });
  });
});
route({ focus: false });
