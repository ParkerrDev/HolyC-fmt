// check.mjs: the checks that test.mjs and sweep.mjs share.
//
// A formatter may only move whitespace. tokens() cuts HolyC into what the compiler
// sees, plus its comments, so two texts can be compared token for token. Strs, chars
// and DolDoc cmds must match byte for byte. A str runs to its closing quote even
// across lines, as in Terry's LexInStr. Inside a comment only the runs of spaces and
// tabs may change, since S2T changes them there just as Terry's did.

const OPS = ["<<=", ">>=", "...", "->", "++", "--", "<<", ">>", "<=", ">=", "==", "!=", "&&",
  "||", "^^", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "::"];
const WORD = /[A-Za-z0-9_\x80-\xff]/;

export function tokens(src) {
  const out = [];
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === " " || c === "\t" || c === "\r" || c === "\n") { i++; continue; }
    let j = i + 1;
    if (src.startsWith("//", i)) {
      j = src.indexOf("\n", i);
      if (j < 0) j = n;
      out.push("C" + src.slice(i, j).replace(/[ \t]+/g, " ").trimEnd());
    } else if (src.startsWith("/*", i)) {
      j = src.indexOf("*/", i + 2);
      j = j < 0 ? n : j + 2;
      out.push("C" + src.slice(i, j).replace(/[ \t]+/g, " ").replace(/ \n/g, "\n"));
    } else if (c === '"' || c === "'") {
      while (j < n && src[j] !== c) j += src[j] === "\\" ? 2 : 1;
      j = Math.min(j + 1, n);
      out.push("S" + src.slice(i, j));
    } else if (c === "$") {
      j = src.indexOf("$", i + 1);
      j = j < 0 ? n : j + 1;
      out.push("D" + src.slice(i, j));
    } else if (WORD.test(c)) {
      while (j < n && WORD.test(src[j])) j++;
      out.push("W" + src.slice(i, j));
    } else {
      const op = OPS.find((o) => src.startsWith(o, i));
      if (op) j = i + op.length;
      out.push("O" + src.slice(i, j));
    }
    i = j;
  }
  return out;
}

// Where two texts first differ in their tokens, or -1 when they hold the same ones.
export function tokenDiff(a, b) {
  const ta = tokens(a), tb = tokens(b);
  const m = Math.min(ta.length, tb.length);
  for (let i = 0; i < m; i++) if (ta[i] !== tb[i]) return { at: i, a: ta[i], b: tb[i] };
  if (ta.length !== tb.length) return { at: m, a: ta[m], b: tb[m] };
  return -1;
}

// The text before the first NUL, and the binary tail from it on.
export function splitTail(src) {
  const nul = src.indexOf("\0");
  return nul < 0 ? [src, ""] : [src.slice(0, nul), src.slice(nul)];
}
