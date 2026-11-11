#include "HolyCFmt"

#help_index "Cmd Line (Typically)"

Bool HolyCFmtFile(U8 *filename)
{//Format one file. Sprite data after the NUL is kept as it is.
  I64 size,len,len2;
  U8 *src=FileRead(filename,&size),*res=NULL,*buf=NULL;
  Bool chged=FALSE;
  if (!src)
    return FALSE;
  try {
    len=StrLen(src);
    res=HolyCFmtBuf(src);
    if (StrCmp(res,src)) {
      len2=StrLen(res);
      buf=MAlloc(len2+size-len);
      MemCpy(buf,res,len2);
      MemCpy(buf+len2,src+len,size-len);
      if (FileWrite(filename,buf,len2+size-len)) {
	"Formatted %s\n",filename;
	chged=TRUE;
      } else
	"Could not write %s\n",filename;
    }
  } catch {
    Free(buf);
    Free(res);
    Free(src);
  }
  Free(buf);
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
  try {
    while (tmpde) {
      if (HolyCFmtFile(tmpde->full_name))
	res++;
      tmpde=tmpde->next;
    }
  } catch
    DirTreeDel(tmpde1);
  DirTreeDel(tmpde1);
  return res;
}
