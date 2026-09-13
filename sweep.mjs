// _sweep.mjs - run the real HolyC formatter over many TempleOS files; assert it is
// idempotent and token-preserving (only whitespace/layout changes).
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { formatSource as fmt } from "./cli.mjs";
const dn = s => s.replace(/[ \t]+/g, "").replace(/\n+/g, "\n").trim();
const TOS = process.env.TOS_DIR || "../TempleOS-wasm/reference/TempleOS";
function sources(dir) {
  const out = [];
  for (const entry of readdirSync(dir, {withFileTypes:true})) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...sources(path));
    else if (entry.isFile() && /\.HC$/i.test(entry.name)) out.push(path);
  }
  return out;
}
const all = sources(TOS);
// spread across the tree, cap size (string-literal path), take a sample
const N = +(process.argv[2] || 60);
// skip DolDoc files with embedded BINARY (sprites etc.) - a NUL byte means it is not
// plain-text HolyC; those are edited in TempleOS's DolDoc editor, out of scope here.
const pick = all.filter(f => { try { const b = readFileSync(f); return b.length < 14000 && !b.includes(0); } catch { return false; } });
const step = Math.max(1, (pick.length / N) | 0);
const files = pick.filter((_, i) => i % step === 0).slice(0, N);

let ok = 0, idemBad = 0, tokBad = 0, err = 0;
for (const f of files) {
  const rel = f.slice(TOS.length + 1);
  let orig;
  try { orig = readFileSync(f, "latin1"); } catch { continue; }
  try {
    const once = await fmt(orig);
    const twice = await fmt(once);
    let bad = false;
    if (once !== twice) { idemBad++; bad = true; console.log("IDEM ✗", rel); }
    if (dn(once) !== dn(orig)) {
      tokBad++; bad = true;
      const a = dn(once), b = dn(orig); let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++;
      console.log("TOK  ✗", rel, "@", i, "\n   fmt:", JSON.stringify(a.slice(Math.max(0, i - 30), i + 30)), "\n   org:", JSON.stringify(b.slice(Math.max(0, i - 30), i + 30)));
    }
    if (!bad) ok++;
  } catch (e) { err++; console.log("ERR  ", rel, String(e.message).slice(0, 80)); }
}
console.log(`\n${files.length} files: ${ok} clean, ${idemBad} idem-fail, ${tokBad} token-fail, ${err} error`);

process.exitCode = idemBad || tokBad || err ? 1 : 0;
