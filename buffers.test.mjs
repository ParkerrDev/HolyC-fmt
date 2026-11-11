import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {resolve,join} from "node:path";
import {pathToFileURL} from "node:url";
import {FmtNew,FmtText} from "./Fmt.js";

const root=resolve(process.env.HOLYC_WASM || "../holyc-wasm"),
  {compileHolyC}=await import(pathToFileURL(join(root,"src/compiler.js"))),
  {createHost}=await import(pathToFileURL(join(root,"src/runtime/host.js")));
let host,allocations=0,fail_at=0;
const Format=await FmtNew(await readFile(new URL("HolyCFmt.HC",import.meta.url),"latin1"),
  compileHolyC,function (options) {
    host=createHost(options);
    const allocate=host.env.__malloc;
    host.env.__malloc=function (size) {
      allocations++;
      if (allocations==fail_at) return 0n;
      return allocate(size);
    };
    return host;
  }),
  high=Buffer.from(Array.from({length:128},(_,i)=>i+128)),
  tail=Buffer.from(Array.from({length:256},(_,i)=>i)),
  source=Buffer.concat([Buffer.from('U0 Bytes()\n{\n"'),high,
    Buffer.from('\x1f\x05";\n}\n'),tail]),
  expected=Buffer.concat([Buffer.from('U0 Bytes()\n{\n  "'),high,
    Buffer.from('\x1f\x05";\n}\n'),tail]);
assert.deepEqual(Buffer.from(Format(source)),expected);
assert.deepEqual(Buffer.from(Format(expected)),expected);
allocations=0;
Format(source);
const allocation_count=allocations,heap=host.state.heapPtr;
for (fail_at=1;fail_at<=allocation_count;fail_at++) {
  allocations=0;
  assert.throws(()=>Format(source),error=>error instanceof WebAssembly.Exception);
  assert.equal(host.state.heapPtr,heap,
    "A failed allocation releases every buffer acquired before it.");
}
fail_at=0;
assert.deepEqual(Buffer.from(Format(source)),expected,"Formatting recovers after allocation failure.");
assert.deepEqual(Format(new Uint8Array()),new Uint8Array());
assert.throws(()=>Format("not bytes"),/Uint8Array/);
assert.throws(()=>Format(source,{tabs:1}),/boolean/);
assert.throws(()=>Format(source,{indent:NaN}),/integer/);
const large=Buffer.from("I64 x;\n".repeat(90000));
assert.deepEqual(Buffer.from(Format(large)),large);
const memory_size=host.state.mem.buffer.byteLength;
for (let i=0;i<10;i++) {
  assert.deepEqual(Buffer.from(Format(large)),large);
  assert.equal(host.state.mem.buffer.byteLength,memory_size,
    "Repeated formatting reuses its allocations instead of growing forever.");
}
assert.deepEqual(Buffer.from(Format(source,{indent:4,tabs:false})),
  Buffer.concat([Buffer.from('U0 Bytes()\n{\n    "'),high,
    Buffer.from('\x1f\x05";\n}\n'),tail]));
assert.deepEqual(Buffer.from(Format(source)),expected,"Options do not leak between calls.");
assert.equal(FmtText(Format,'U0 Test()\n{\n"é Ç ╬ 🚀";\n}\n\0\xff'),
  'U0 Test()\n{\n  "é Ç ╬ 🚀";\n}\n\0\xff');
console.log("Formatter bytes, tails, options and repeated 630 KB allocation reuse pass.");
