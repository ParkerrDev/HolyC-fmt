import assert from "node:assert/strict";
import {readFile,readdir,mkdir,writeFile} from "node:fs/promises";
import {resolve,join} from "node:path";
import {pathToFileURL} from "node:url";
import {formatBytes} from "./cli.mjs";

const tree=resolve(process.argv[2] || process.env.TOS_DIR || "../TempleOS"),
  compiler=resolve(process.env.HOLYC_WASM || "../holyc-wasm"),
  {QemuRun}=await import(pathToFileURL(join(compiler,"tests/oracle/Qemu.mjs"))),
  files=[],expected=[],paths=[];

async function Walk(dir)
{
  for (const entry of await readdir(dir,{withFileTypes:true})) {
    const path=join(dir,entry.name);
    if (entry.isDirectory()) {
      if (entry.name!=".git" && entry.name!="Linux") await Walk(path);
    } else if (/\.(HC|HH|IN)$/.test(entry.name)) paths.push(path);
  }
}

await Walk(tree);
paths.sort();
assert(paths.length,"The TempleOS source tree is empty.");
for (const [index,path] of paths.entries()) {
  const source=await readFile(path),bytes=await formatBytes(source);
  let hash=0xCBF29CE484222325n;
  for (const byte of bytes)
    hash=BigInt.asUintN(64,(hash^BigInt(byte))*0x100000001B3n);
  files.push({name:"S"+index.toString().padStart(6,"0")+".HC",bytes:source});
  expected.push(index+":"+bytes.length+":"+
    hash.toString(16).toUpperCase().padStart(16,"0"));
}
const core=await readFile(new URL("HolyCFmt.HC",import.meta.url),"latin1"),
  program=core+String.raw`
U0 FmtNativeCheck(I64 count)
{
  I64 i,j,size,len,len2,hash;
  U8 *src,*res,name[64];
  for (i=0;i<count;i++) {
    StrPrint(name,"C:/ORACLE/S%06d.HC",i);
    src=FileRead(name,&size);
    if (!src) throw('FmtFile');
    len=StrLen(src);
    res=HolyCFmtBuf(src);
    len2=StrLen(res);
    hash=0xCBF29CE484222325;
    for (j=0;j<len2;j++) hash=(hash^res[j])*0x100000001B3;
    for (j=len;j<size;j++) hash=(hash^src[j])*0x100000001B3;
    "%d:%d:%016X\n",i,len2+size-len,hash;
    Free(res);
    Free(src);
  }
}
`+"FmtNativeCheck("+paths.length+");\n",
  sample=Buffer.concat([Buffer.from('U0 Test()\n{\n"hi";\n}\n'),Buffer.from([0,255,1,2])]),
  command_expected=await formatBytes(sample,{indent:4,tabs:false});
let command_hash=0xCBF29CE484222325n;
for (const byte of command_expected)
  command_hash=BigInt.asUintN(64,(command_hash^BigInt(byte))*0x100000001B3n);
files.push({name:"HOLYCFMT.HC",bytes:Buffer.from(core,"latin1")},
  {name:"FMTUTILS.HC",bytes:await readFile(new URL("FmtUtils.HC",import.meta.url))},
  {name:"WRITE.HC",bytes:sample},{name:"REJECT.HC",bytes:sample});
const command=String.raw`
#exe {Cd("C:/ORACLE");Copy("HOLYCFMT.HC","HolyCFmt.HC");}
#include "C:/ORACLE/FMTUTILS.HC"
fmt_indent=4;
fmt_tabs=FALSE;
I64 changed=HolyCFmt("WRITE.HC"),again=HolyCFmt("WRITE.HC"),size,i,
    hash=0xCBF29CE484222325;
U8 *bytes=FileRead("WRITE.HC",&size);
for (i=0;i<size;i++) hash=(hash^bytes[i])*0x100000001B3;
"CMD:%d:%d:%d:%016X\n",changed,again,size,hash;
Free(bytes);
`,reject=String.raw`
#exe {Cd("C:/ORACLE");}
I64 write_attempts=0;
I64 FmtWriteFail(U8 *,U8 *,I64)
{
  write_attempts++;
  return 0;
}
#define FileWrite FmtWriteFail
#include "C:/ORACLE/FMTUTILS.HC"
Bool changed=HolyCFmtFile("REJECT.HC");
I64 size,i,hash=0xCBF29CE484222325;
U8 *bytes=FileRead("REJECT.HC",&size);
for (i=0;i<size;i++) hash=(hash^bytes[i])*0x100000001B3;
"REJECT:%d:%d:%d:%016X\n",changed,write_attempts,size,hash;
Free(bytes);
`,memory=String.raw`
I64 fmt_calls=0,fmt_fail=0,fmt_live=0;
U8 *fmt_allocs[64];
MemSet(fmt_allocs,0,sizeof(fmt_allocs));
U8 *FmtTestAlloc(I64 size)
{
  I64 i;
  U8 *res;
  if (++fmt_calls==fmt_fail) throw('OutMem');
  res=MAlloc(size);
  for (i=0;i<64;i++)
    if (!fmt_allocs[i]) {
      fmt_allocs[i]=res;
      fmt_live++;
      break;
    }
  return res;
}
U8 *FmtTestZero(I64 size)
{
  U8 *res=FmtTestAlloc(size);
  MemSet(res,0,size);
  return res;
}
U0 FmtTestFree(U8 *ptr)
{
  I64 i;
  if (!ptr) return;
  for (i=0;i<64;i++)
    if (fmt_allocs[i]==ptr) {
      fmt_allocs[i]=NULL;
      fmt_live--;
      break;
    }
  Free(ptr);
}
#define MAlloc FmtTestAlloc
#define CAlloc FmtTestZero
#define Free FmtTestFree
`+core+String.raw`
U0 FmtMemoryTest()
{
  I64 i,count,failures=0;
  U8 *res;
  res=HolyCFmtBuf("U0 Test()\n{\nI64 x;\n}\n");
  count=fmt_calls;
  Free(res);
  for (i=1;i<=count;i++) {
    fmt_calls=0;
    fmt_fail=i;
    try {
      res=HolyCFmtBuf("U0 Test()\n{\nI64 x;\n}\n");
      Free(res);
    } catch {
      if (Fs->except_ch!='OutMem') throw('Wrong');
      Fs->catch_except=TRUE;
      failures++;
    }
    if (fmt_live) throw('Leak');
  }
  fmt_fail=0;
  res=HolyCFmtBuf("U0 Test()\n{\nI64 x;\n}\n");
  Free(res);
  "MEM:%d:%d:%d\n",count,failures,fmt_live;
}
FmtMemoryTest;
`,result=await QemuRun([program,command,reject,memory],{files,timeout:180});
await mkdir(new URL(".oracle/",import.meta.url),{recursive:true});
await writeFile(new URL(".oracle/native.json",import.meta.url),JSON.stringify({
  ...result,paths:paths.map(path=>path.slice(tree.length+1))},null,2)+"\n");
assert.equal(result.results[0].except,"");
assert.deepEqual(result.results[0].out.trim().split("\n"),expected);
assert.equal(result.results[1].except,"");
assert(result.results[1].out.includes("CMD:1:0:"+command_expected.length+":"+
  command_hash.toString(16).toUpperCase().padStart(16,"0")),result.results[1].out);
let source_hash=0xCBF29CE484222325n;
for (const byte of sample)
  source_hash=BigInt.asUintN(64,(source_hash^BigInt(byte))*0x100000001B3n);
assert.equal(result.results[2].except,"");
assert(result.results[2].out.includes("REJECT:0:1:"+sample.length+":"+
  source_hash.toString(16).toUpperCase().padStart(16,"0")),result.results[2].out);
assert(!result.results[2].out.includes("Formatted "));
assert.equal(result.results[3].except,"");
const allocation=result.results[3].out.match(/MEM:(\d+):(\d+):0/);
assert(allocation && +allocation[1]>=10 && allocation[1]==allocation[2],result.results[3].out);
console.log(paths.length+" native V5.03/WASM formatter lengths and FNV hashes match.");
console.log(JSON.stringify({backend:result.backend,evidence:result.evidence}));
