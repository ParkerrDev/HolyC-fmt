#!/usr/bin/env node
import {readFileSync,writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {FmtNew,FmtText} from "./Fmt.js";

const compiler_root=pathToFileURL(resolve(process.env.HOLYC_WASM ||
  new URL("../holyc-wasm/",import.meta.url).pathname)+"/");
let formatter;

async function FmtLoad()
{
  if (!formatter) {
    formatter=Promise.all([
      import(new URL("src/compiler.js",compiler_root)),
      import(new URL("src/runtime/host.js",compiler_root))
    ]).then(function ([compiler,host]) {
      return FmtNew(readFileSync(new URL("HolyCFmt.HC",import.meta.url),"latin1"),
        compiler.compileHolyC,host.createHost);
    }).catch(function (error) {
      formatter=null;
      if (error.code=="ERR_MODULE_NOT_FOUND")
        throw new Error("HolyC-wasm is missing. Check out ../holyc-wasm or set "+
          "HOLYC_WASM to its directory.",{cause:error});
      throw error;
    });
  }
  return formatter;
}

export async function formatBytes(source,options)
{
  const Format=await FmtLoad();
  return Format(source,options);
}

export async function formatSource(source,options)
{
  return FmtText(await FmtLoad(),source,options);
}

if (process.argv[1] && import.meta.url==pathToFileURL(resolve(process.argv[1])).href) {
  const args=process.argv.slice(2),files=[],options={tabs:true,indent:2};
  let write=false;
  for (const arg of args) {
    if (arg=="-w") write=true;
    else if (arg=="--spaces") options.tabs=false;
    else if (arg.startsWith("--indent=")) options.indent=Number(arg.slice(9));
    else if (arg.startsWith("-")) throw new Error("Unknown option: "+arg);
    else files.push(arg);
  }
  if (!files.length) {
    console.error("usage: node cli.mjs [-w] [--spaces] [--indent=N] FILE.HC...");
    process.exitCode=2;
  } else for (const file of files) {
    const src=readFileSync(file),out=Buffer.from(await formatBytes(src,options));
    if (write) {
      if (!out.equals(src)) {
        writeFileSync(file,out);
        console.error("formatted "+file);
      }
    } else process.stdout.write(out);
  }
}
