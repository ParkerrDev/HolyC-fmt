import assert from "node:assert/strict";
import {tokenDiff} from "./check.mjs";

for (const [before,after] of [
  ['I64 a,b;','I64 a,c;'],
  ['a + + b;','a ++ b;'],
  ['a b;','ab;'],
  ['"a  b";','"a b";'],
  ["'a b';","'ab';"],
  ['/* outer /* nested */ " hello */','/* outer /* nested */ " bye */'],
  ['//message here','//message gone'],
  ['$LK,"a  b"$','$LK,"a b"$'],
  ['//See $LK,"a  b"$ now','//See $LK,"a b"$ now'],
  ['"$LK,"a  b"$";','"$LK,"a b"$";']
]) assert.notEqual(tokenDiff(before,after),-1,JSON.stringify([before,after]));
for (const [before,after] of [
  ['U0 F()\n{\nx++;\n}\n','U0 F()\n{\n  x++;\n}\n'],
  ['/* a\t /* b */ " c */\nI64 x;','/* a  /* b */ " c */\n I64 x;'],
  ['//before   $LK,"a  b"$   after','//before\t$LK,"a  b"$\tafter'],
  ['"$LK,"a  b"$";','  "$LK,"a  b"$";']
]) assert.equal(tokenDiff(before,after),-1,JSON.stringify([before,after]));
console.log("Independent token check rejects semantic/comment/DolDoc edits and accepts layout changes.");
