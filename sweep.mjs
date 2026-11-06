// sweep.mjs: run the formatter over Terry's whole tree.
//
// Every file must come out with the same tokens and the same binary tail, and must be
// a fixed point (formatting the output again changes nothing). The sweep also counts
// the files that come out byte for byte as Terry left them.
//
//   git clone https://github.com/cia-foundation/TempleOS ../TempleOS
//   node sweep.mjs [TEMPLEOS_DIR]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { formatSource } from "./cli.mjs";
import { tokenDiff, splitTail } from "./check.mjs";

const TOS = process.argv[2] || process.env.TOS_DIR || "../TempleOS";
if (!existsSync(join(TOS, "Kernel"))) {
  console.error(`no TempleOS tree at ${TOS}: clone https://github.com/cia-foundation/TempleOS there`);
  process.exit(2);
}

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== ".git" && e.name !== "Linux") out.push(...walk(p));
    } else if (/\.(HC|HH|IN)$/.test(e.name)) out.push(p);
  }
  return out.sort();
}

let files = 0, same = 0, bad = 0;
const t0 = Date.now();
for (const path of walk(TOS)) {
  const rel = path.slice(TOS.length + 1);
  const src = readFileSync(path).toString("latin1");
  files++;
  let once, twice;
  try {
    once = await formatSource(src);
    twice = await formatSource(once);
  } catch (e) {
    bad++;
    console.log(`ERROR  ${rel}: ${e.message}`);
    continue;
  }
  if (once === src) same++;
  const problems = [];
  if (twice !== once) problems.push("not a fixed point");
  const d = tokenDiff(splitTail(src)[0], splitTail(once)[0]);
  if (d !== -1) problems.push(`token ${d.at} changed: ${JSON.stringify(d.a)} became ${JSON.stringify(d.b)}`);
  if (splitTail(src)[1] !== splitTail(once)[1]) problems.push("binary tail changed");
  if (problems.length) {
    bad++;
    console.log(`FAIL   ${rel}: ${problems.join("; ")}`);
  }
}
const secs = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`${files} files in ${secs} s: ${same} byte for byte as Terry left them, ${bad} failed`);
process.exitCode = bad ? 1 : 0;
