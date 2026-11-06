#!/usr/bin/env node
// cli.mjs: run HolyCFmt.HC, the formatter written in HolyC, on files.
//
// The HolyC is compiled by HolyC-wasm. The file's bytes are written straight into
// the program's linear memory, above the heap, and the HolyC reads them there, so
// DolDoc "$$" and every other byte reach it untouched.
//
// A TempleOS file can hold binary data (sprites) after a NUL. Only the text before
// the first NUL is formatted; the binary tail is kept byte for byte.
//
//   node cli.mjs File.HC              print the formatted source
//   node cli.mjs -w A.HC B.HC         rewrite files in place
//   node cli.mjs --spaces File.HC     indent with spaces, not S2T tabs
//   node cli.mjs --indent=4 File.HC   spaces a level (default 2, like Terry's)
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { compileHolyC } from "../holyc-wasm/src/compiler.js"; // HolyC-wasm checked out as a sibling
import { createHost } from "../holyc-wasm/src/runtime/host.js";

const DIR = dirname(fileURLToPath(import.meta.url));
const CORE = readFileSync(join(DIR, "HolyCFmt.HC"), "latin1");
const INP = 28 * 1024 * 1024; // above the heap (16 MiB), below the initial memory (32 MiB)

const modules = new Map();

function compiled(cfg) {
  let mod = modules.get(cfg);
  if (!mod) {
    const prog = CORE + `\n${cfg}U8 *__inp=${INP};\nHolyCFmtPrint(__inp);\n`;
    const { bytes } = compileHolyC(prog, { filename: "HolyCFmt.HC", lenient: true, resilient: true });
    mod = WebAssembly.compile(bytes);
    modules.set(cfg, mod);
    mod.catch(() => modules.delete(cfg));
  }
  return mod;
}

// Format a source string. Text after a NUL is kept as it is.
export async function formatSource(source, { tabs = true, indent = 2 } = {}) {
  if (!Number.isInteger(indent) || indent < 1 || indent > 8) throw new Error("indent must be an integer from 1 to 8");
  if (typeof tabs !== "boolean") throw new Error("tabs must be a boolean");
  const nul = source.indexOf("\0");
  const text = nul < 0 ? source : source.slice(0, nul);
  const tail = nul < 0 ? "" : source.slice(nul);
  const cfg = `fmt_tabs=${tabs ? "TRUE" : "FALSE"};\nfmt_indent=${indent};\n`;
  let out = "";
  const host = createHost({ onText: (s) => { out += s; }, ansi: false });
  const inst = await WebAssembly.instantiate(await compiled(cfg), { env: host.env });
  host.attach?.(inst);
  const mem = new Uint8Array(inst.exports.memory.buffer);
  if (INP + text.length + 1 > mem.length) throw new Error("file too large for this tool");
  for (let i = 0; i < text.length; i++) mem[INP + i] = text.charCodeAt(i) & 0xff;
  mem[INP + text.length] = 0;
  inst.exports.__main();
  return out + tail;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const files = args.filter((a) => !a.startsWith("-"));
  const ind = args.find((a) => a.startsWith("--indent="));
  const opts = { tabs: !args.includes("--spaces"), indent: ind ? Number(ind.slice(9)) : 2 };
  if (!files.length) {
    console.error("usage: node cli.mjs [-w] [--spaces] [--indent=N] FILE.HC...");
    process.exit(2);
  }
  for (const file of files) {
    const src = readFileSync(file, "latin1");
    const out = await formatSource(src, opts);
    if (args.includes("-w")) {
      if (out !== src) {
        writeFileSync(file, out, "latin1");
        console.error("formatted " + file);
      }
    } else process.stdout.write(Buffer.from(out, "latin1"));
  }
}
