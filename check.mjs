const OPS=["<<=",">>=","...","->","++","--","<<",">>","<=",">=","==","!=","&&",
  "||","^^","+=","-=","*=","/=","%=","&=","|=","^=","::"],
  WORD=/[A-Za-z0-9_\x80-\xff]/,
  NUMBER=new RegExp("^(?:[0-9][xX][0-9a-fA-F]*|[0-9][bB][01]*|"+
    "(?:[0-9]+(?:\\.(?!\\.)[0-9]*)?|\\.[0-9]+)(?:[eE]-?[0-9]*)?)");

function CommentKey(source)
{//DolDoc inside a comment is protected even when nearby spaces become tabs.
  let out="",i=0,start=0,end,part;
  while (i<source.length) {
    if (source[i]=="$" && source[i+1]=="$") i+=2;
    else if (source[i]=="$" && (end=source.indexOf("$",i+1))>=0) {
      part=source.slice(start,i).replace(/[ \t]+/g," ").replace(/ \n/g,"\n");
      out+=part+source.slice(i,end+1);
      start=i=end+1;
    } else i++;
  }
  return out+source.slice(start).replace(/[ \t]+/g," ")
    .replace(/ \n/g,"\n").trimEnd();
}

export function tokens(source)
{
  const out=[];
  let i=0,j,n=source.length,c,depth,end,op;
  while (i<n) {
    c=source[i];
    if (/[ \t\r\n\x05\x1f]/.test(c)) i++;
    else {
      j=i+1;
      if (source.startsWith("//",i)) {
        j=source.indexOf("\n",i);
        if (j<0) j=n;
        out.push("C"+CommentKey(source.slice(i,j)));
      } else if (source.startsWith("/*",i)) {
        j=i+2;depth=1;
        while (j<n && depth) {
          if (source.startsWith("/*",j)) {depth++;j+=2;}
          else if (source.startsWith("*/",j)) {depth--;j+=2;}
          else j++;
        }
        out.push("C"+CommentKey(source.slice(i,j)));
      } else if (c=='"' || c=="'") {
        while (j<n && source[j]!=c) {
          if (source[j]=="\\") j+=2;
          else if (c=='"' && source[j]=="$" &&
              (end=source.indexOf("$",j+1))>=0) j=end+1;
          else j++;
        }
        j=Math.min(j+1,n);
        out.push("S"+source.slice(i,j));
      } else if (c=="$") {
        j=source.indexOf("$",i+1);
        if (j<0) j=n;
        else j++;
        out.push("D"+source.slice(i,j));
      } else if (/[0-9]/.test(c) || c=="." && /[0-9]/.test(source[i+1] || "")) {
        const number=NUMBER.exec(source.slice(i));
        j=i+number[0].length;
        out.push("N"+number[0]);
      } else if (WORD.test(c)) {
        while (j<n && WORD.test(source[j])) j++;
        out.push("W"+source.slice(i,j));
      } else {
        for (op of OPS)
          if (source.startsWith(op,i)) {j=i+op.length;break;}
        out.push("O"+source.slice(i,j));
      }
      i=j;
    }
  }
  return out;
}

export function tokenDiff(a,b)
{
  const ta=tokens(a),tb=tokens(b),count=Math.min(ta.length,tb.length);
  let i;
  for (i=0;i<count;i++)
    if (ta[i]!=tb[i]) return {at:i,a:ta[i],b:tb[i]};
  if (ta.length!=tb.length) return {at:count,a:ta[count],b:tb[count]};
  return -1;
}

export function splitTail(source)
{
  const zero=source.indexOf("\0");
  if (zero<0) return [source,""];
  return [source.slice(0,zero),source.slice(zero)];
}
