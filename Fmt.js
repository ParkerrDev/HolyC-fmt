export async function FmtNew(source,compileHolyC,createHost)
{//Runs the native formatter over byte strings, including binary DolDoc tails.
  const compiled=compileHolyC(source,{filename:"HolyCFmt.HC",lenient:false,
    resilient:false,exports:["HolyCFmtBufOpts","MAlloc","Free","StrLen"]}),
    host=createHost({}),
    {instance}=await WebAssembly.instantiate(compiled.bytes,{env:host.env}),
    fn=instance.exports;
  host.attach(instance);
  fn.__main();

  function Format(source,{tabs=true,indent=2}={})
  {
    let zero,size,input=0n,output=0n,
      memory,length,result;
    if (!(source instanceof Uint8Array))
      throw new TypeError("source must be a Uint8Array");
    if (!Number.isInteger(indent) || indent<1 || indent>8)
      throw new Error("indent must be an integer from 1 to 8");
    if (typeof tabs!="boolean") throw new Error("tabs must be a boolean");
    size=source.length;
    zero=source.indexOf(0);
    if (zero>=0) size=zero;
    try {
      input=fn.MAlloc(BigInt(size+1),0n);
      if (!input) throw new Error("Not enough memory for the source.");
      memory=new Uint8Array(fn.memory.buffer);
      memory.set(source.subarray(0,size),Number(input));
      memory[Number(input)+size]=0;
      output=fn.HolyCFmtBufOpts(input,BigInt(indent),BigInt(tabs));
      if (!output) throw new Error("Not enough memory for the formatted source.");
      length=Number(fn.StrLen(output));
      result=new Uint8Array(length+source.length-size);
      result.set(new Uint8Array(fn.memory.buffer,Number(output),length));
      result.set(source.subarray(size),length);
      return result;
    } finally {
      fn.Free(output);
      fn.Free(input);
    }
  }
  return Format;
}

export function FmtText(Format,source,options)
{//The browser editor holds UTF-16; HolyC gives every non-ASCII unit one column.
  const bytes=new Uint8Array(source.length),high=[];
  let i,ch,out="",next=0,formatted;
  for (i=0;i<source.length;i++) {
    ch=source.charCodeAt(i);
    if (ch>=128) {
      high.push(source[i]);
      ch=128;
    }
    bytes[i]=ch;
  }
  formatted=Format(bytes,options);
  for (ch of formatted) {
    if (ch>=128) out+=high[next++];
    else out+=String.fromCharCode(ch);
  }
  if (next!=high.length)
    throw new Error("The formatter changed a non-ASCII character.");
  return out;
}
