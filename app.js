import { palettes, templates, initialState, validateState, render } from './wallpaper.js';
const $ = id => document.getElementById(id);
const canvas = $('wallpaper');
let state = { ...initialState }, history = [], future = [], textTimer, toastTimer, revision = 0;
try { const saved = localStorage.getItem('wallultra-project'); if (saved) state = validateState(JSON.parse(saved)); } catch { /* Local storage may be unavailable. */ }
const clone = () => ({ ...state });
function toast(message) { $('toast').textContent = message; $('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 3400); }
function commit(patch) {
  if (Object.entries(patch).every(([key, value]) => state[key] === value)) return;
  history.push(clone()); if (history.length > 60) history.shift(); future = []; state = { ...state, ...patch }; revision++; $('save-status').textContent = 'RASCUNHO'; sync();
}
function sync() {
  for (const [id, key] of [['headline','text'], ['font','font'], ['resolution','resolution'], ['accent','accent'], ['intensity','intensity'], ['project-name','name']]) { if ($(id).value !== String(state[key])) $(id).value = state[key]; }
  $('show-text').checked = state.showText; $('grain').checked = state.grain;
  $('headline').disabled = !state.showText; $('font').disabled = !state.showText;
  $('intensity-value').textContent = state.intensity + '%'; $('hex-label').textContent = state.accent.toUpperCase();
  document.querySelectorAll('[data-template]').forEach(el => { const active = el.dataset.template === state.template;el.classList.toggle('active',active);el.setAttribute('aria-pressed',active); });
  document.querySelectorAll('[data-palette]').forEach(el => { const active = Number(el.dataset.palette) === state.palette;el.classList.toggle('active',active);el.setAttribute('aria-pressed',active); });
  document.querySelectorAll('[data-align]').forEach(el => { const active = el.dataset.align === state.align;el.classList.toggle('active',active);el.setAttribute('aria-pressed',active); });
  $('undo').disabled = !history.length; $('redo').disabled = !future.length;
  const [width,height] = state.resolution.split('x').map(Number);
  // Keep interactive previews light; export renders the full selected resolution.
  canvas.width = width / height > 2 ? 1600 : 1440; canvas.height = Math.round(canvas.width * height / width);
  $('canvas-dimensions').textContent = `${width} × ${height} px`;
  $('aspect-label').textContent = width / height > 2 ? '64:27' : '16:9';
  $('resolution-label').textContent = $('resolution').selectedOptions[0].textContent.split(' · ')[0];
  canvas.setAttribute('aria-label', `Wallpaper ${templates.find(t=>t.id===state.template).name}, paleta ${palettes[state.palette].name}${state.showText ? ', texto: ' + state.text : ', sem texto'}`);
  render(canvas,state);
}
for (const template of templates) {
  const button = document.createElement('button');button.className = 'template-card';button.dataset.template = template.id;button.title = 'Usar estilo ' + template.name;
  const thumb = document.createElement('canvas');thumb.width = 480;thumb.height = 160;thumb.setAttribute('aria-hidden','true');
  render(thumb,{ ...initialState, template:template.id,palette:template.palette,accent:palettes[template.palette].accent,showText:false },{thumbnail:true});
  const caption = document.createElement('div');caption.className = 'template-caption';
  const name = document.createElement('strong');name.textContent = template.name;
  const tag = document.createElement('span');tag.textContent = template.tag;
  caption.append(name,tag);button.append(thumb,caption);$('templates').append(button);
  button.addEventListener('click',()=>commit({template:template.id,palette:template.palette,accent:palettes[template.palette].accent,text:template.text,font:template.id==='landscape'||template.id==='aurora'?'serif':'sans'}));
}
palettes.forEach((p,i)=>{const b=document.createElement('button');b.className='palette';b.dataset.palette=i;b.title=p.name;b.setAttribute('aria-label','Paleta '+p.name);const swatch=document.createElement('span');swatch.style.background=`linear-gradient(135deg, ${p.accent} 50%, ${p.second} 50%)`;b.append(swatch);b.addEventListener('click',()=>commit({palette:i,accent:p.accent}));$('palettes').append(b);});
for (const [id,key] of [['resolution','resolution'],['font','font']]) $(id).addEventListener('change',e=>commit({[key]:e.target.value}));
for (const [id,key] of [['show-text','showText'],['grain','grain']]) $(id).addEventListener('change',e=>commit({[key]:e.target.checked}));
for (const [id,key] of [['headline','text'],['project-name','name']]) {
  $(id).addEventListener('input',e=>{clearTimeout(textTimer);const value=e.target.value;textTimer=setTimeout(()=>commit({[key]:value}),180);});
  $(id).addEventListener('blur',e=>{clearTimeout(textTimer);commit({[key]:e.target.value});});
}
// A drag is one history entry, even though every movement updates the preview.
for (const [id,key,convert] of [['intensity','intensity',Number],['accent','accent',String]]) {
  let start;
  $(id).addEventListener('input',e=>{start ??= clone();state={...state,[key]:convert(e.target.value)};sync();});
  $(id).addEventListener('change',e=>{const before=start||clone();start=undefined;state={...state,[key]:convert(e.target.value)};if(JSON.stringify(before)!==JSON.stringify(state)){history.push(before);future=[];revision++;$('save-status').textContent='RASCUNHO';}sync();});
}
document.querySelectorAll('[data-align]').forEach(b=>b.addEventListener('click',()=>commit({align:b.dataset.align})));
function travel(undo) {const source=undo?history:future,target=undo?future:history;if(!source.length)return;target.push(clone());state=source.pop();revision++;$('save-status').textContent='RASCUNHO';sync();}
$('undo').addEventListener('click',()=>travel(true));$('redo').addEventListener('click',()=>travel(false));
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();travel(!e.shiftKey);}});
$('shuffle').addEventListener('click',()=>{const t=templates[Math.floor(Math.random()*templates.length)];const p=Math.floor(Math.random()*palettes.length);commit({template:t.id,palette:p,accent:palettes[p].accent,text:t.text,font:t.id==='aurora'||t.id==='landscape'?'serif':'sans',intensity:40+Math.floor(Math.random()*61)});toast('Uma nova combinação para chamar de sua.');});
$('save').addEventListener('click',()=>{clearTimeout(textTimer);commit({text:$('headline').value,name:$('project-name').value});try{localStorage.setItem('wallultra-project',JSON.stringify(state));$('save-status').textContent='SALVO';toast('Projeto salvo neste navegador. Volte quando quiser.');}catch{toast('Não foi possível salvar. Verifique o armazenamento do navegador.');}});
$('download').addEventListener('click',async()=>{
  clearTimeout(textTimer);commit({text:$('headline').value,name:$('project-name').value});
  const button=$('download');button.disabled=true;button.setAttribute('aria-busy','true');const exportState=clone();const exportRevision=revision;
  try {
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const output=document.createElement('canvas');[output.width,output.height]=exportState.resolution.split('x').map(Number);render(output,exportState);
    const blob=await new Promise(resolve=>output.toBlob(resolve,'image/png'));if(!blob)throw new Error('Export failed');
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=(exportState.name.trim().replace(/[^\p{L}\p{N}_-]+/gu,'-')||'wallultra')+'-'+exportState.resolution+'.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
    toast(`Wallpaper em ${exportState.resolution.replace('x',' × ')} pronto!${exportRevision!==revision?' Exportada a versão do momento do clique.':''}`);
  } catch {toast('Não foi possível exportar. Tente uma resolução menor.');}finally{button.disabled=false;button.removeAttribute('aria-busy');}
});
sync();
