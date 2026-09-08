/* Idempotent final wiring: i18n Nav keys, MobileNav media item, profile-edit media link.
   Text-based (no JSON.parse) so BOM/comments can't break it. Safe to re-run. */
const fs = require('fs');
const path = require('path');
const R = process.cwd();
const log = [];
const rd = (p) => fs.readFileSync(path.join(R, p), 'utf8');
const wr = (p, c) => { fs.writeFileSync(path.join(R, p), c, 'utf8'); log.push('PATCHED ' + p); };

function navObjectSpan(src) {
  const m = /"Nav"\s*:\s*\{/.exec(src);
  if (!m) return null;
  const open = src.indexOf('{', m.index);
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) return { open, end: i }; }
  }
  return null;
}

/* A. i18n: ensure Nav.chat / Nav.media exist in en + ur */
for (const [file, keys] of [
  ['messages/en.json', { chat: 'Chat', media: 'My Work' }],
  ['messages/ur.json', { chat: 'چیٹ', media: 'میری مہارت' }],
]) {
  try {
    if (!fs.existsSync(path.join(R, file))) { log.push('SKIP ' + file + ' (missing)'); continue; }
    const s = rd(file);
    const span = navObjectSpan(s);
    if (!span) { log.push('SKIP ' + file + ' (no Nav obj)'); continue; }
    const body = s.slice(span.open, span.end + 1);
    const missing = Object.keys(keys).filter((k) => !new RegExp('"' + k + '"\\s*:').test(body));
    if (!missing.length) { log.push('OK ' + file + ' Nav keys'); continue; }
    let nb;
    if (/^\{\s*\}$/.test(body)) {
      nb = '{\n    ' + missing.map((k) => '"' + k + '": "' + keys[k] + '"').join(',\n    ') + '\n  }';
    } else {
      nb = body.replace(/^\{/, '{\n    ' + missing.map((k) => '"' + k + '": "' + keys[k] + '",').join(''));
    }
    wr(file, s.slice(0, span.open) + nb + s.slice(span.end + 1));
  } catch (e) { log.push('ERR ' + file + ': ' + e.message); }
}

/* B. MobileNav: clone a single-line chat item into a media item (worker side) */
try {
  const p = 'src/components/layout/MobileNav.tsx';
  let s = rd(p);
  if (s.includes('"/media"')) log.push('OK MobileNav media');
  else {
    const lines = s.split('\n');
    const idx = lines.findIndex((l) => l.includes('"/chat"') && /(label|title|name)/.test(l) && l.trim().length < 300);
    if (idx === -1) log.push('SKIP MobileNav (no single-line chat item)');
    else {
      const ml = lines[idx]
        .replace('"/chat"', '"/media"')
        .replace(/(["'\(])chat(["'\)])/g, '$1media$2')
        .replace('{/* ROZ-WIRE:chat */}', '');
      lines.splice(idx + 1, 0, ml + ' {/* ROZ-WIRE:media-link */}');
      wr(p, lines.join('\n'));
    }
  }
} catch (e) { log.push('ERR MobileNav: ' + e.message); }

/* C. worker profile edit: link card to /worker/media (photo uploads live there) */
try {
  const p = 'src/app/[locale]/worker/profile/edit/page.tsx';
  let s = rd(p);
  if (s.includes('/worker/media')) log.push('OK profile-edit media link');
  else {
    const fi = s.indexOf('<form');
    if (fi === -1) log.push('SKIP profile-edit (no <form>)');
    else {
      const card =
        '        {/* ROZ-WIRE:media-link */}\n' +
        '        <Link href="/worker/media" className="mb-4 flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10">\n' +
        '          <span>📸 Add photos — avatar &amp; work gallery</span>\n' +
        '          <span aria-hidden="true">→</span>\n' +
        '        </Link>\n';
      let out = s.slice(0, fi) + card + s.slice(fi);
      if (!/import\s+\{[^}]*\bLink\b[^}]*\}\s+from/.test(out)) {
        out = out.replace(/^(import .*?\n)/, '$1import { Link } from "@/i18n/navigation";\n');
      }
      wr(p, out);
    }
  }
} catch (e) { log.push('ERR profile-edit: ' + e.message); }

console.log(log.join('\n'));
console.log('WIRE-DONE');