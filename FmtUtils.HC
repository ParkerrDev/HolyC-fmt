//TempleOS cmd for $LK,"HolyCFmtBuf",A="MN:HolyCFmtBuf"$, made like $LK,"S2T",A="MN:S2T"$.
//Copy this dir to the TempleOS disk, then
//  #include "FmtUtils"
//  HolyCFmt("*","+r");
#include "HolyCFmt"

#help_index "Cmd Line (Typically)"

Bool HolyCFmtFile(U8 *filename)
{//Format one file. Sprite data after the NUL is kept as it is.
  I64 size,len,len2;
  U8 *src=FileRead(filename,&size),*res,*buf;
  Bool chged=FALSE;
  if (!src)
    return FALSE;
  len=StrLen(src);
  res=HolyCFmtBuf(src);
  if (StrCmp(res,src)) {
    len2=StrLen(res);
    buf=MAlloc(len2+size-len);
    MemCpy(buf,res,len2);
    MemCpy(buf+len2,src+len,size-len);
    FileWrite(filename,buf,len2+size-len);
    Free(buf);
    "Formatted %s\n",filename;
    chged=TRUE;
  }
  Free(res);
  Free(src);
  return chged;
}

public I64 HolyCFmt(U8 *files_find_mask,U8 *fu_flags=NULL)
{//Lay out HolyC src files the way Terry's tools left his tree.
//Returns the number of files chged.
  //See $LK,"ST_FILE_UTIL_FLAGS",A="MN:ST_FILE_UTIL_FLAGS"$ for fu_flags.
  I64 res=0,fuf_flags=0;
  CDirEntry *tmpde,*tmpde1;
  ScanFlags(&fuf_flags,Define("ST_FILE_UTIL_FLAGS"),"+f+F+S");
  ScanFlags(&fuf_flags,Define("ST_FILE_UTIL_FLAGS"),fu_flags);
  tmpde=tmpde1=FilesFind(files_find_mask,fuf_flags&FUG_FILES_FIND);
  while (tmpde) {
    if (HolyCFmtFile(tmpde->full_name))
      res++;
    tmpde=tmpde->next;
  }
  DirTreeDel(tmpde1);
  return res;
}
