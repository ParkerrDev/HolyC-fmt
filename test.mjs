import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { formatSource as fmt } from "./cli.mjs";
import { tokenDiff, splitTail } from "./check.mjs";

let pass = 0, fail = 0;
function check(name, got, want) {
  if (got === want) {
    pass++;
    console.log(`  ok    ${name}`);
    return;
  }
  fail++;
  console.log(`  FAIL  ${name}`);
  console.log("    got:  " + JSON.stringify(got));
  console.log("    want: " + JSON.stringify(want));
}

const cases = [
  ["levels are 2 spaces, stored through S2T as tabs",
    "U0 Deep()\n{\nI64 i,j;\nfor(i=0;i<9;i++){\nfor(j=0;j<9;j++){\nif(i==j){\n\"%d\\n\",i;\n}\n}\n}\n}\n",
    "U0 Deep()\n{\n  I64 i,j;\n  for (i=0;i<9;i++) {\n    for (j=0;j<9;j++) {\n      if (i==j) {\n\t\"%d\\n\",i;\n      }\n    }\n  }\n}\n"],
  ["a space after if, for and while, and before a control's {",
    "U0 Foo(I64 x)\n{\nif(x>0){\n\"pos\\n\";\n}\n}\n",
    "U0 Foo(I64 x)\n{\n  if (x>0) {\n    \"pos\\n\";\n  }\n}\n"],
  ["case at +2 in a switch, its stmts at +4, labels at col 0",
    "U0 Bar(I64 x)\n{\nswitch(x){\ncase 1:\nBaz;\nbreak;\ndefault:\nQux;\n}\nbar_done:\nreturn;\n}\n",
    "U0 Bar(I64 x)\n{\n  switch (x) {\n    case 1:\n      Baz;\n      break;\n    default:\n      Qux;\n  }\nbar_done:\n  return;\n}\n"],
  ["} else {, do {, } while, try {, } catch, switch [x] {",
    "U0 G(I64 x)\n{\nif(x){\nx++;\n}else{\nx--;\n}\ndo{\nx++;\n}while(x<5);\ntry{\nFoo;\n}catch\nPutExcept;\nswitch[x]{\ncase 0:\nbreak;\n}\n}\n",
    "U0 G(I64 x)\n{\n  if (x) {\n    x++;\n  } else {\n    x--;\n  }\n  do {\n    x++;\n  } while (x<5);\n  try {\n    Foo;\n  } catch\n    PutExcept;\n  switch [x] {\n    case 0:\n      break;\n  }\n}\n"],
  ["the cases between start: and end: go a level in, as in StrPrint.HC",
    "U0 H(I64 x)\n{\nswitch (x) {\nstart:\ncase 1:\n\"b\";\nbreak;\nend:\n\"c\";\nbreak;\n}\n}\n",
    "U0 H(I64 x)\n{\n  switch (x) {\n    start:\n      case 1:\n\t\"b\";\n\tbreak;\n    end:\n      \"c\";\n      break;\n  }\n}\n"],
  ["the line after a {// comment goes to col 0, as his reindent left it",
    "U0 C()\n{//Says hi.\n//Own line comment.\n   \"hi\\n\"; //trailing\n}\n",
    "U0 C()\n{//Says hi.\n//Own line comment.\n  \"hi\\n\"; //trailing\n}\n"],
  ["a top-level item runs on a tab in",
    "public U8 *LongName(U8 *src,I64 a,\nI64 b)\n{\nreturn src;\n}\n",
    "public U8 *LongName(U8 *src,I64 a,\n\tI64 b)\n{\n  return src;\n}\n"],
  ["a top-level line that starts with a str goes to col 0",
    "U8 *fmt_kws=\"if\\0else\\0\"\n    \"for\\0while\\0\";\n",
    "U8 *fmt_kws=\"if\\0else\\0\"\n\"for\\0while\\0\";\n"],
  ["a top-level line that starts with * goes under the first line's *",
    "U8 *st1,\n*st2;\n",
    "U8 *st1,\n   *st2;\n"],
  ["an extern proto ends at its ) with no ;",
    "extern U0 Foo(I64 x)\nU0 Foo(I64 x)\n{\nx++;\n}\n",
    "extern U0 Foo(I64 x)\nU0 Foo(I64 x)\n{\n  x++;\n}\n"],
  ["a #define run on with \\ keeps its spaces",
    "#define MAX(a,b)\t\\\n  ((a)>(b))\n#define X\t1\n",
    "#define MAX(a,b)\t\\\n  ((a)>(b))\n#define X\t1\n"],
  ["a \\ then a space ends a #define, so the space stays",
    "#define Y\t\\ \nI64 y;\n",
    "#define Y\t\\ \nI64 y;\n"],
  ["DolDoc $$ runs are left alone",
    "U8 *s=\"$$$$$$DA\";\n",
    "U8 *s=\"$$$$$$DA\";\n"],
  ["strs and comments hold their braces; a comma's space is dropped",
    "U0 Q()\n{\nFoo(1, 2,3); //a } brace and { in comment\nS(\"a{b}c\");\n}\n",
    "U0 Q()\n{\n  Foo(1,2,3); //a } brace and { in comment\n  S(\"a{b}c\");\n}\n"],
  ["mid-line spaces that cross a tab stop become a tab, as in S2T, but not in a str",
    "U0 R()\n{\nI64 i,j;      //Count.\n\"      x\";\n}\n",
    "U0 R()\n{\n  I64 i,j;\t//Count.\n  \"      x\";\n}\n"],
  ["init braces keep their place; blank runs close up",
    "I64 a[3]={1,2,3};\n\n\nI64 b  =  5;\n",
    "I64 a[3]={1,2,3};\n\nI64 b  =  5;\n"],
  ["a file ends in exactly one newline",
    "U0 N()\n{\n}",
    "U0 N()\n{\n}\n"],
  ["sprite bytes after the NUL are kept as they are",
    "U0 T()\n{\n\"a\";\n}\n\0\x01\x02\xff",
    "U0 T()\n{\n  \"a\";\n}\n\0\x01\x02\xff"],
];

console.log("cases:");
for (const [name, input, want] of cases) {
  let got;
  try { got = await fmt(input); } catch (e) { got = "<<error: " + e.message + ">>"; }
  check(name, got, want);
  check("fixed point: " + name, await fmt(want), want);
}

console.log("options:");
check("--spaces --indent=4", await fmt("U0 S()\n{\nif(1){\n\"x\";\n}\n}\n", { tabs: false, indent: 4 }),
  "U0 S()\n{\n    if (1) {\n        \"x\";\n    }\n}\n");
for (const bad of [0, 9, 2.5]) {
  let msg = "no error";
  try { await fmt("U0 X()\n{\n}\n", { indent: bad }); } catch (e) { msg = e.message; }
  check(`indent ${bad} is refused`, msg, "indent must be an integer from 1 to 8");
}

const TOS = process.env.TOS_DIR || "../TempleOS";
const real = ["Demo/Games/TicTacToe.HC", "Demo/Graphics/Life.HC", "Compiler/Lex.HC", "Kernel/StrA.HC"];
if (existsSync(join(TOS, "Kernel"))) {
  console.log(`Terry's files from ${TOS}:`);
  for (const rel of real) {
    const src = readFileSync(join(TOS, rel)).toString("latin1");
    const once = await fmt(src);
    check(`fixed point: ${rel}`, await fmt(once), once);
    check(`same tokens: ${rel}`, JSON.stringify(tokenDiff(splitTail(src)[0], splitTail(once)[0])), "-1");
    check(`same tail: ${rel}`, splitTail(once)[1], splitTail(src)[1]);
  }
} else console.log(`(no TempleOS tree at ${TOS}, so Terry's files are skipped)`);

console.log(`\n${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
