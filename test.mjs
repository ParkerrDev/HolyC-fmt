// test.mjs - drive the REAL HolyCFmt.HC through the holyc-wasm compiler.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { formatSource } from "./cli.mjs";
export const fmt = formatSource;

let pass = 0, fail = 0;
function check(name, got, want) {
  if (got === want) { pass++; console.log(`  ✓ ${name}`); }
  else {
    fail++; console.log(`  ✗ ${name}`);
    console.log("    --- got ---\n" + got.split("\n").map(l => "    |" + l).join("\n"));
    console.log("    --- want ---\n" + want.split("\n").map(l => "    |" + l).join("\n"));
  }
}

const cases = [
  ["DolDoc dollar runs survive unchanged", 'U8 *s="$$$$$$DA";\n', 'U8 *s="$$$$$$DA";\n'],
  ["basic indent + if-space + brace-space",
`U0 Foo(I64 x)
{
if(x>0){
"pos\\n";
}
}
`,
`U0 Foo(I64 x)
{
  if (x>0) {
    "pos\\n";
  }
}
`],
  ["switch/case/default + goto-label at col0",
`U0 Bar(I64 x)
{
switch(x){
case 1:
baz();
break;
default:
qux();
}
done:
return;
}
`,
`U0 Bar(I64 x)
{
  switch (x) {
    case 1:
      baz();
      break;
    default:
      qux();
  }
done:
  return;
}
`],
  ["braces/quotes in strings & comments are ignored; comma normalized",
`U0 Q()
{
Foo(1, 2,3);   //a } brace and { in comment
S("a{b}c");
}
`,
`U0 Q()
{
  Foo(1,2,3);   //a } brace and { in comment
  S("a{b}c");
}
`],
  ["initializer braces keep no space; trailing ws + blank runs collapsed",
`I64 a[3]={1,2,3};


I64 b  =  5;
`,
`I64 a[3]={1,2,3};

I64 b  =  5;
`],
];

console.log("unit cases (run through the real HolyC formatter):");
for (const [name, input, want] of cases) {
  let got;
  try { got = await fmt(input); } catch (e) { got = "<<error: " + e.message + ">>"; }
  check(name, got, want);
}

// idempotency: formatting the output again must be a fixed point
console.log("idempotency (format(format(x)) == format(x)):");
for (const [name, input] of cases) {
  const once = await fmt(input);
  const twice = await fmt(once);
  check("idem: " + name, twice, once);
}

// real TempleOS files: must be idempotent (a fixed point), and changes vs the
// original should only be whitespace/layout (same tokens once whitespace is stripped)
// real TempleOS source lives in the TempleOS-Web checkout; override with TOS_DIR
const TOS = process.env.TOS_DIR || "../TempleOS-wasm/reference/TempleOS";
const real = ["Demo/Graphics/Life.HC", "Demo/Games/TicTacToe.HC", "Compiler/Lex.HC"];
const denoise = (s) => s.replace(/[ \t]+/g, "").replace(/\n+/g, "\n").trim();
console.log("real TempleOS files:");
for (const rel of real) {
  let orig;
  try { orig = readFileSync(join(TOS, rel), "latin1"); } catch { console.log(`  - ${rel} (missing, skip)`); continue; }
  const once = await fmt(orig);
  const twice = await fmt(once);
  check(`idem: ${rel}`, twice, once);
  // token-equivalence: formatting must not add/drop/reorder non-whitespace
  check(`tokens-preserved: ${rel}`, denoise(once), denoise(orig));
  const changed = orig.split("\n").length;
  console.log(`      (${rel}: ${changed} lines, reformatted ok)`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
