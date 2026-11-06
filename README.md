# HolyC-fmt

A formatter for HolyC, the language of TempleOS, written in HolyC. It lays code
out the way Terry A. Davis's own tools left his tree.

Part of the TempleOS-Web family: [TempleOS-Web](https://github.com/ParkerrDev/TempleOS-Web)
(the site, with a Format button in its editor and a page at `/format.html`),
[HolyC-wasm](https://github.com/ParkerrDev/HolyC-wasm) (the compiler that runs this
formatter outside TempleOS) and [HEMU](https://github.com/ParkerrDev/HEMU).

## What it copies

TempleOS has two layout tools, and HolyC-fmt ports both and runs them over whole files.

* **Reindent.** In the editor, Ctrl+Shift+L opens Code Tools, and "Reindent HolyC Fun
  (Beware braces in strings.)" reindents the function under the cursor. That is
  `EdRICode` in `Adam/DolDoc/DocCodeTools.HC`, at two spaces a level
  (`C_INDENT_SPACES`).
* **S2T.** `S2T` in `Adam/Opt/Utils/StrUtils.HC` stores files through `Spaces2Tabs`
  (`Kernel/StrA.HC`): a run of spaces that reaches a tab stop becomes a tab. Terry's
  files are stored that way.

HolyC-fmt lexes strs, char consts, comments and DolDoc cmds, so braces inside strings
do not fool it, and it never changes any of them.

## How close it is

Measured on Terry's tree, TempleOS V5.03 as exported to
[cia-foundation/TempleOS](https://github.com/cia-foundation/TempleOS) at commit
`c26482b`: 544 `.HC`, `.HH` and `.IN` files.

* 340 come out byte for byte as Terry left them. Version 0.1 matched 141.
* Every file is a fixed point: formatting the output again changes nothing.
* No token ever changes. Strs, chars and DolDoc cmds match byte for byte, comments
  change only in their runs of spaces and tabs, and sprite data after the NUL is kept.
* Compiled by TempleOS itself and run on the V5.03 disk, it gives the same output as
  the HolyC-wasm build on 524 of the 525 files the disk shares with the export. The
  one left, `Demo/AcctExample/Registry.HC`, is a different file on the disk: a saved
  game time in it differs.

The other 204 files hold lines Terry typed by hand or never ran his tools over:

* spacing his tools never touch: `, ` (99 lines), `if(` (22), and double spaces before
  `{` or `else`;
* whitespace-only lines, and blank lines doubled or at the ends of files;
* continuation lines he placed by hand, such as function headers at col 2 and
  second-level continuations typed as a single tab;
* a few whole files he never reindented.

## The layout

* Two spaces a level, stored through S2T. `--spaces` writes spaces instead.
* No token moves to another line. Only the whitespace before and between tokens
  changes.
* A function's `{` and its `}` sit at col 0. A control's `{` goes after one space on
  its line: `if (x) {`, `} else {`, `do {`, `} while (x);`, `try {`, `switch [i] {`.
* One space after `if`, `for`, `while` and `switch`. No space after a comma. Operator
  spacing is left as it is (Terry writes `x=y+1`, but telling a unary `*` or `&` from a
  binary one safely needs a parser).
* `case` and `default` go 2 in from their `switch`, and their statements 4. The cases
  between `start:` and `end:` go a level deeper, as in `Kernel/StrPrint.HC`.
* Goto labels go to col 0.
* A braceless body goes a level in.
* A statement that runs on goes 6 spaces past its level, as `EdRICode` puts it, so a
  first-level statement runs on at col 8: one tab.
* At the top level, a line that runs on goes to col 8; one that starts with a str goes
  to col 0; one that starts with a `*` lines up under the first line's `*`
  (`U8 *a,` then `   *b;`). An `extern` proto ends at its `)`, with no `;`.
* In a top-level `asm` block, opcodes sit at col 8, and labels, directives and
  comment-only lines at col 0.
* A comment on its own line takes the level of the code around it. The line after a
  `{//` brace comment goes to col 0 and a third to col 2, which is how his reindent
  left 48 of the 51 three-line brace comments in his tree.
* Lines that start inside a str or a block comment, and lines that hold only DolDoc,
  keep their leading space.
* A `#define` that ends in `\` runs on to the next line, and that line keeps its
  spaces. A `\` followed by a space does not run on (see `Compiler/Lex.HC`), so that
  space stays: trimming it would join the next line to the define.
* Trailing spaces go, runs of blank lines close up to one, blank lines at the start
  and end go, and the text ends in exactly one newline, as 507 of Terry's 544 files
  do. Blank lines next to DolDoc stay: they are often the room for a sprite.

## Using it

### In TempleOS

Copy `HolyCFmt.HC` and `FmtUtils.HC` into a directory on the TempleOS disk, `Cd` to it
and run:

```
#include "FmtUtils"
HolyCFmt("*","+r");
```

`HolyCFmt(files_find_mask,fu_flags)` is made like Terry's `S2T` and takes the same
`ST_FILE_UTIL_FLAGS`, but it starts from `+f+F+S` where S2T starts from `+f+F+T`, so
only source files are touched. It
prints each file it changes and returns how many. `HolyCFmtBuf(src)` formats a string
and returns a new one. `fmt_indent` and `fmt_tabs` set the level and the tabs.

TempleOS already has a `Fmt`: it formats a drive (`Kernel/BlkDev/DskFmt.HC`). Version
0.1 named its command `Fmt` too and shadowed it, so the command is now `HolyCFmt`.

### From a shell

The CLI runs the same `HolyCFmt.HC`, compiled to WebAssembly by HolyC-wasm, which
must sit beside this repo:

```sh
git clone https://github.com/ParkerrDev/HolyC-wasm ../holyc-wasm
node cli.mjs File.HC                  # print the formatted source
node cli.mjs -w A.HC B.HC             # rewrite files in place
node cli.mjs --spaces --indent=4 F.HC # spaces, 4 a level
```

From JavaScript: `await formatSource(src, { tabs: true, indent: 2 })` from `cli.mjs`.
The file's bytes go straight into the program's memory, so DolDoc `$$` and every
other byte reach the HolyC as they are. Only the text before the first NUL is
formatted; the binary tail after it is kept byte for byte.

## Testing

```sh
npm test                 # cases with known answers, and 4 of Terry's files
npm run sweep            # all 544 of Terry's files
```

Both read Terry's tree from `../TempleOS` (or `TOS_DIR`, or the sweep's first
argument): `git clone https://github.com/cia-foundation/TempleOS ../TempleOS`. The
sweep fails if any file changes a token, loses its binary tail or is not a fixed
point.

## Notes

* **The GitHub tree is an export.** It was made with `TOSZ -ascii` (in `Linux/TOSZ.CPP`),
  which turns SHIFT-SPACE (byte 31) into a space and drops `CH_CURSOR` (byte 5).
  Terry's S2T makes tabs everywhere, so he typed hard spaces where it must not: in
  string consts (S2T's own comment says so) and after periods in comments. The export
  shows those as plain spaces. HolyC-fmt never changes a hard space and never touches
  a str, so it works on the disk files as they are and needs no hard spaces.
* **It runs under two compilers.** HolyC-wasm differs from TempleOS's compiler in
  places: it ignores `goto`, uses C's operator precedence, matches only one value of a
  `case 0...2:` range, sets `CH_SHIFT_SPACE` to 0xA0 and has no `CH_CURSOR`. So
  `HolyCFmt.HC` uses no `goto`, no numeric case ranges and no expression whose meaning
  depends on which precedence is used, and it gives the same output under both.

## Files

* `HolyCFmt.HC`: the formatter, `HolyCFmtBuf(src)`, with no I/O.
* `FmtUtils.HC`: the TempleOS command, `HolyCFmt(mask,flags)`.
* `cli.mjs`: the command line and `formatSource()`.
* `check.mjs`: the token check that the tests and the sweep share.
* `test.mjs`, `sweep.mjs`: the tests.
* `runhc.mjs`: runs any HolyC file headless through HolyC-wasm.
