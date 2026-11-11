import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdtempSync,readFileSync,rmSync,symlinkSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {fileURLToPath} from "node:url";

const root=fileURLToPath(new URL("./",import.meta.url)),
  temp=mkdtempSync(join(tmpdir(),"holyc-fmt-cli-")),
  source=Buffer.from('U0 Hi()\n{\n"hi";\n}\n\0\x80\xff',"latin1"),
  expected=Buffer.from('U0 Hi()\n{\n  "hi";\n}\n\0\x80\xff',"latin1"),
  file=join(temp,"Input.HC");
function Run(args,options={})
{
  const result=spawnSync(process.execPath,args,{cwd:temp,...options});
  assert.equal(result.error,undefined);
  assert.equal(result.signal,null);
  assert.equal(result.status,0,result.stderr.toString());
  return result;
}
try {
  symlinkSync(root,join(temp,"linked-directory"),"dir");
  symlinkSync(join(root,"cli.mjs"),join(temp,"linked-command"),"file");
  for (const entry of [join(root,"cli.mjs"),join(temp,"linked-directory/cli.mjs"),
      join(temp,"linked-command")]) {
    writeFileSync(file,source);
    assert.deepEqual(Run([entry,file]).stdout,expected);
    assert.deepEqual(readFileSync(file),source,"Printing preserves the source file.");
    const written=Run([entry,"-w",file]);
    assert.equal(written.stdout.length,0);
    assert.match(written.stderr.toString(),/formatted /);
    assert.deepEqual(readFileSync(file),expected);
    assert.equal(Run([entry,"-w",file]).stderr.length,0);
  }
  const module_url=new URL("cli.mjs",import.meta.url).href,
    imported='import '+JSON.stringify(module_url)+'; console.log("imported");';
  writeFileSync(join(temp,"import.mjs"),imported);
  for (const [args,options] of [
    [[join(temp,"import.mjs"),"-w",file],{}],
    [["--input-type=module","-","-w",file],{input:imported}]
  ]) {
    writeFileSync(file,source);
    const result=Run(args,options);
    assert.equal(result.stdout.toString(),"imported\n");
    assert.equal(result.stderr.length,0);
    assert.deepEqual(readFileSync(file),source,"Library import never runs the CLI.");
  }
  console.log("CLI direct/symlink printing, rewriting, binary tails and library imports pass.");
} finally {
  rmSync(temp,{recursive:true,force:true});
}
