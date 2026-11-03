import { initialState, blankState, validateState, validImageSource } from './wallpaper.js';

export function loadWorkspaces(raw) {
  const result = { activeMode: 'templates', projects: { templates: structuredClone(initialState), blank: blankState() } };
  if (!raw) return result;
  const value = JSON.parse(raw);
  if (value?.app === 'wallultra-workspaces' && value.projects) {
    for (const mode of ['templates', 'blank']) {
      const saved = value.projects[mode];
      if (saved && typeof saved === 'object') result.projects[mode] = validateState({ ...saved, mode, template: mode === 'blank' ? 'blank' : saved.template === 'blank' ? 'orbit' : saved.template });
    }
    result.activeMode = value.activeMode === 'blank' ? 'blank' : 'templates';
  } else {
    const saved = validateState(value);
    result.projects[saved.mode] = saved;
    result.activeMode = saved.mode;
  }
  return result;
}
export function parseProject(raw) {
  if (raw.length > 32 * 1024 * 1024) throw new Error('O projeto deve ter no máximo 32 MB.');
  let data;
  try { data = JSON.parse(raw); } catch { throw new Error('O arquivo não contém um projeto válido.'); }
  if (data?.app !== 'wallultra' || !data.project || typeof data.project !== 'object' || !Array.isArray(data.project.texts)) throw new Error('Escolha um projeto exportado pelo WallUltra.');
  if (!Number.isInteger(data.schema) || data.schema > 4 || data.schema < 1) throw new Error('Esta versão do projeto não é compatível.');
  if (data.project.image && !validImageSource(data.project.image.src)) throw new Error('A imagem dentro do projeto é inválida ou muito grande.');
  return validateState(data.project);
}
export function serializeProject(state) {
  return JSON.stringify({ app: 'wallultra', schema: 4, project: state }, null, 2);
}
export async function normalizeImageFile(file) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('Escolha uma imagem PNG, JPEG ou WebP.');
  if (file.size > 10 * 1024 * 1024) throw new Error('A imagem deve ter no máximo 10 MB.');
  let bitmap;
  try { bitmap = await createImageBitmap(file); } catch { throw new Error('Não foi possível ler essa imagem. Tente outro arquivo.'); }
  try {
    if (bitmap.width * bitmap.height > 30_000_000) throw new Error('Escolha uma imagem de até 30 megapixels.');
    const scale = Math.min(1, 2560 / Math.max(bitmap.width, bitmap.height));
    const output = document.createElement('canvas'); output.width = Math.max(1, Math.round(bitmap.width * scale)); output.height = Math.max(1, Math.round(bitmap.height * scale));
    output.getContext('2d').drawImage(bitmap, 0, 0, output.width, output.height);
    const src = output.toDataURL('image/webp', .88);
    if (!validImageSource(src)) throw new Error('A imagem continua muito grande. Tente uma versão menor.');
    return { src, name: file.name.slice(0, 100), fit: 'cover', opacity: 100, zoom: 100, x: 50, y: 50 };
  } finally { bitmap.close(); }
}
