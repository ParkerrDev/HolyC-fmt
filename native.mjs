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
  {name:"WRITE.HC",bytes:sample});
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
`,result=await QemuRun([program,command],{files,timeout:180});
await mkdir(new URL(".oracle/",import.meta.url),{recursive:true});
await writeFile(new URL(".oracle/native.json",import.meta.url),JSON.stringify({
  ...result,paths:paths.map(path=>path.slice(tree.length+1))},null,2)+"\n");
assert.equal(result.results[0].except,"");
assert.deepEqual(result.results[0].out.trim().split("\n"),expected);
assert.equal(result.results[1].except,"");
assert(result.results[1].out.includes("CMD:1:0:"+command_expected.length+":"+
  command_hash.toString(16).toUpperCase().padStart(16,"0")),result.results[1].out);
console.log(paths.length+" native V5.03/WASM formatter lengths and FNV hashes match.");
console.log(JSON.stringify({backend:result.backend,evidence:result.evidence}));
