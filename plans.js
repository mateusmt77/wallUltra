// Shared policy: the server determines membership; project data never grants it.
export const plans = {
  basic: { name: 'wallBasic', level: 0 },
  medium: { name: 'wallMedium', level: 1 },
  high: { name: 'wallHigh', level: 2 }
};
export const featurePlans = { advancedShapes: 'medium', premiumTemplates: 'medium', textEffects: 'medium', gradient3: 'medium', imageAdjust: 'medium', savedPalettes: 'medium', blend: 'high', extractPalette: 'high', batch: 'high', stylePresets: 'high' };
export const basicShapes = ['ellipse', 'rectangle', 'pill', 'triangle', 'star', 'ring', 'diamond', 'line'];
export const basicTemplates = ['orbit', 'landscape', 'aurora', 'minimal', 'blank'];
export const canUse = (plan, feature) => Object.hasOwn(plans, plan) && Object.hasOwn(featurePlans, feature) && plans[plan].level >= plans[featurePlans[feature]].level;
export function resolutionPlan(resolution) {
  const [w,h] = String(resolution).split('x').map(Number);
  if (!w || !h || w > 7680 || h > 4320) return 'high';
  if (w > 3840 || h > 2160 || w / h >= 3.4) return 'high';
  return w > 1920 || h > 1200 ? 'medium' : 'basic';
}
export function requiredPlan(s) {
  let level = plans[resolutionPlan(s.resolution)].level;
  const requireFeature = f => { level = Math.max(level, plans[featurePlans[f]].level); };
  if (!basicTemplates.includes(s.template) && s.mode !== 'blank') requireFeature('premiumTemplates');
  if (s.shapes?.some(x => !basicShapes.includes(x?.type))) requireFeature('advancedShapes');
  if (s.texts?.some(x => x?.shadow || x?.outline)) requireFeature('textEffects');
  if (s.gradient3) requireFeature('gradient3');
  if (s.image && ((s.image.saturation ?? 100) !== 100 || (s.image.contrast ?? 100) !== 100)) requireFeature('imageAdjust');
  if (s.image?.blend && s.image.blend !== 'source-over') requireFeature('blend');
  return Object.keys(plans).find(p => plans[p].level === level);
}
export const hasPlan = (actual, required) => Object.hasOwn(plans, actual) && Object.hasOwn(plans, required) && plans[actual].level >= plans[required].level;
