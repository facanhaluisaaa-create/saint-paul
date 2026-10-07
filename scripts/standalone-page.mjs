// Converte dist-standalone/index.html num fragmento com CSS e JS embutidos, para publicação.
import fs from 'node:fs';
import path from 'node:path';
const dir = 'dist-standalone';
let html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const title = /<title>(.*?)<\/title>/.exec(html)?.[1] ?? 'P1 Contabilidade';
const fonts = [...html.matchAll(/<link[^>]+fonts\.googleapis[^>]*>/g)].map((m) => m[0]).join('\n');
const preconnect = [...html.matchAll(/<link rel="preconnect"[^>]*>/g)].map((m) => m[0]).join('\n');
const css = [...html.matchAll(/<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+)"[^>]*>/g)].map((m) => fs.readFileSync(path.join(dir, m[1]), 'utf8')).join('\n');
const js = [...html.matchAll(/<script type="module"[^>]*src="\.\/(assets\/[^"]+)"[^>]*><\/script>/g)].map((m) => fs.readFileSync(path.join(dir, m[1]), 'utf8')).join('\n');
if (!js) throw new Error('bundle JS não encontrado');
const safeJs = js.replace(/<\/script/gi, '<\\/script');
const out = `<title>${title}</title>
<meta name="theme-color" content="#1d4a37">
${preconnect}
${fonts}
<style>
html, body { height: auto; }
${css}
</style>
<div id="root"></div>
<script type="module">
${safeJs}
</script>
`;
fs.writeFileSync(path.join(dir, 'page.html'), out);
console.log('page.html', (out.length / 1024).toFixed(0), 'KB');
