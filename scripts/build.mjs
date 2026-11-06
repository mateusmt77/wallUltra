import { copyFile, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicFiles } from '../site-files.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
export async function buildSite(output = resolve(root, 'public')) {
  await rm(output, { recursive: true, force: true });
  for (const file of publicFiles) {
    const destination = resolve(output, file);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(resolve(root, file), destination);
  }
  return publicFiles.length;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`Site pronto: ${await buildSite()} arquivos publicados em public/.`);
}
