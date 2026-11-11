#define FT_EOF		0
#define FT_IDENT	0x100
#define FT_VAL		0x101	//Num, str, char or $$IB$$.
#define FT_OP		0x102	//Op of two or three chars.
#define FT_DBL_COLON	0x103

#define FKW_IF		0
#define FKW_ELSE	1
#define FKW_TRY 	2
#define FKW_CATCH	3
#define FKW_LOCK	4
#define FKW_FOR 	5
#define FKW_WHILE	6
#define FKW_ASM 	7
#define FKW_CLASS	8
#define FKW_UNION	9
#define FKW_DO		10
#define FKW_SWITCH	11
#define FKW_START	12
#define FKW_END 	13
#define FKW_CASE	14
#define FKW_DFT 	15
#define FKW_EXE 	16	//Lexed like the union Terry swaps in.
#define FKW_OPCODE	17

#define FC_CODE 	0
#define FC_CMT		1
#define FC_STR		2	//Never chged.
#define FC_DOL		3	//Never chged.
#define FC_DIR		4
#define FC_GAP		5	//Gap that gets redone.

#define FLF_TOKS	1
#define FLF_CMT 	2
#define FLF_DOL 	4
#define FLF_IN_STR	8	//Starts inside a str or DolDoc cmd.
#define FLF_IN_CMT	16	//Starts inside a block comment.
#define FLF_DIR 	32
#define FLF_ASM 	64	//In a top-level asm blk.
#define FLF_KEEP	128	//Keeps its leading space.
#define FLF_DOL_CODE	256	//DolDoc cmd outside a comment.

#define FBK_FUN 	0
#define FBK_CLASS	1
#define FBK_EXE 	2
#define FBK_INIT	3
#define FBK_ASM 	4
#define FBK_OTHER	5

U8 *fmt_kws="if\0else\0try\0catch\0lock\0for\0while\0asm\0class\0union\0"
"do\0switch\0start\0end\0case\0default\0",
   *fmt_ops3="<<=\0>>=\0...\0",
   *fmt_ops2="::\0->\0++\0--\0<<\0>>\0<=\0>=\0==\0!=\0&&\0||\0^^\0+=\0-=\0"
"*=\0/=\0%=\0&=\0|=\0^=\0",
   *fmt_ops="AAA\0AAD\0AAM\0AAS\0ADC\0ADD\0ALIGN\0AND\0ARPL\0BINFILE\0BOUND\0"
"BPT\0BSF\0BSR\0BSWAP\0BT\0BTC\0BTR\0BTS\0CALL\0CBW\0CDQ\0CDQE\0"
"CHPXCHG8B\0CLC\0CLD\0CLFLUSH\0CLI\0CLTS\0CMC\0CMOVA\0CMOVAE\0"
"CMOVB\0CMOVBE\0CMOVC\0CMOVE\0CMOVG\0CMOVGE\0CMOVL\0CMOVLE\0CMOVNA\0"
"CMOVNAE\0CMOVNB\0CMOVNBE\0CMOVNC\0CMOVNE\0CMOVNG\0CMOVNGE\0CMOVNL\0"
"CMOVNLE\0CMOVNO\0CMOVNP\0CMOVNS\0CMOVNZ\0CMOVO\0CMOVP\0CMOVPE\0"
"CMOVPO\0CMOVS\0CMOVZ\0CMP\0CMPSB\0CMPSD\0CMPSQ\0CMPSW\0CMPXCHG\0"
"CPUID\0CQO\0CWD\0CWDE\0DAA\0DAS\0DEC\0DIV\0DU16\0DU32\0DU64\0DU8\0"
"DUP\0ENTER\0F2XM1\0FABS\0FADD\0FADDP\0FCHS\0FCLEX\0FCOMI\0FCOMIP\0"
"FCOS\0FDECSTP\0FDIV\0FDIVP\0FDIVR\0FDIVRP\0FFREE\0FILD\0FIMUL\0"
"FINCSTP\0FINIT\0FLD1\0FLDCW\0FLDL2E\0FLDL2T\0FLDLG2\0FLDLN2\0FLDPI\0"
"FLDZ\0FMUL\0FMULP\0FNCLEX\0FNINIT\0FPATAN\0FPREM\0FPTAN\0FRNDINT\0"
"FRSTOR\0FSAVE\0FSCALE\0FSIN\0FSQRT\0FST\0FSTCW\0FSTP\0FSTSW\0FSUB\0"
"FSUBP\0FSUBR\0FSUBRP\0FTST\0FWAIT\0FXAM\0FXCH\0FXRSTOR\0FXSAVE\0"
"FXTRACT\0FYL2X\0FYL2XP1\0HLT\0IDIV\0IMPORT\0IMUL\0IMUL2\0IN\0INC\0"
"INS\0INSB\0INSD\0INSW\0INT\0INT3\0INTO\0INVD\0INVLPG\0IRET\0JA\0"
"JAE\0JB\0JBE\0JC\0JCXZ\0JE\0JECXZ\0JG\0JGE\0JL\0JLE\0JMP\0JNA\0"
"JNAE\0JNB\0JNBE\0JNC\0JNE\0JNG\0JNGE\0JNL\0JNLE\0JNO\0JNP\0JNS\0"
"JNZ\0JO\0JP\0JPE\0JPO\0JRCXZ\0JS\0JZ\0LAHF\0LAR\0LEA\0LEAVE\0LGDT\0"
"LIDT\0LIST\0LLDT\0LMSW\0LODSB\0LODSD\0LODSQ\0LODSW\0LOOP\0LOOPE\0"
"LOOPNE\0LOOPNZ\0LOOPZ\0LSL\0LTR\0MOV\0MOV_CR0_EAX\0MOV_CR0_RAX\0"
"MOV_CR2_EAX\0MOV_CR2_RAX\0MOV_CR3_EAX\0MOV_CR3_RAX\0MOV_CR4_EAX\0"
"MOV_CR4_RAX\0MOV_EAX_CR0\0MOV_EAX_CR2\0MOV_EAX_CR3\0MOV_EAX_CR4\0"
"MOV_RAX_CR0\0MOV_RAX_CR2\0MOV_RAX_CR3\0MOV_RAX_CR4\0MOVSB\0MOVSD\0"
"MOVSQ\0MOVSW\0MOVSX\0MOVSXD\0MOVZX\0MUL\0NEG\0NOLIST\0NOP\0NOP2\0"
"NOT\0OR\0ORG\0OUT\0OUTSB\0OUTSD\0OUTSW\0PAUSE\0POP\0POPAD\0POPAW\0"
"POPFD\0POPFW\0PUSH\0PUSHAD\0PUSHAW\0PUSHFD\0PUSHFW\0RCL\0RCL1\0RCR\0"
"RCR1\0RDMSR\0RDTSC\0REPE_CMPSB\0REPE_CMPSD\0REPE_CMPSQ\0REPE_CMPSW\0"
"REPE_SCASB\0REPE_SCASD\0REPE_SCASQ\0REPE_SCASW\0REP_INSB\0REP_INSD\0"
"REP_INSW\0REP_LODSB\0REP_LODSD\0REP_LODSQ\0REP_LODSW\0REP_MOVSB\0"
"REP_MOVSD\0REP_MOVSQ\0REP_MOVSW\0REPNE_CMPSB\0REPNE_CMPSD\0"
"REPNE_CMPSQ\0REPNE_CMPSW\0REPNE_SCASB\0REPNE_SCASD\0REPNE_SCASQ\0"
"REPNE_SCASW\0REP_OUTSB\0REP_OUTSD\0REP_OUTSW\0REP_STOSB\0REP_STOSD\0"
"REP_STOSQ\0REP_STOSW\0RET\0RET1\0RETF\0RETF1\0REX\0REX2\0ROL\0ROL1\0"
"ROR\0ROR1\0RSM\0SAHF\0SAL\0SAL1\0SAR\0SAR1\0SBB\0SCASB\0SCASD\0"
"SCASQ\0SCASW\0SEGCS\0SEGDS\0SEGES\0SEGFS\0SEGGS\0SEGSS\0SETA\0"
"SETAE\0SETB\0SETBE\0SETC\0SETE\0SETG\0SETGE\0SETL\0SETLE\0SETNA\0"
"SETNAE\0SETNB\0SETNBE\0SETNC\0SETNE\0SETNG\0SETNGE\0SETNL\0SETNLE\0"
"SETNO\0SETNP\0SETNS\0SETNZ\0SETO\0SETP\0SETPE\0SETPO\0SETS\0SETZ\0"
"SGDT\0SHL\0SHL1\0SHLD\0SHR\0SHR1\0SHRD\0SIDT\0SLDT\0SMSW\0STC\0STD\0"
"STI\0STOSB\0STOSD\0STOSQ\0STOSW\0STR\0SUB\0TEST\0USE16\0USE32\0"
"USE64\0VERR\0VERW\0WAIT\0WBINVD\0WRMSR\0XADD\0XCHG\0XLATB\0XOR\0";

class CFmtTok
{
  I64 type,kw,
	start,end,	//Src bytes.
	y,		//Line it starts on.
	rec_y,		//Line the lexer is on after it.
	sp;		//Spaces to put in front, if its gap is redone.
};

class CFmt
{
  I64 indent;
  Bool tabs;
  U8 *src,
	*cls,		//A byte each, like $LK,"FC_CODE",A="MN:FC_CODE"$.
	*lb,*lp,	//Line buf, and which bytes of it are protected.
	*out;
  U16 *lflags;		//A line each, like $LK,"FLF_TOKS",A="MN:FLF_TOKS"$.
  I64 src_len,line_cnt,tok_cnt,y,ti,run,lb_len,out_len,out_size,
	*line_start,*lvl,*col,
	*ftok;		//First tok on each line.
  CFmtTok *toks;
};

class CFmtRI
{//Like $LK,"CRILex",A="MN:CRILex"$, but on toks.
  CFmt *f;
  I64 p1,p2,	//Like cc1 and cc2. p2 is a tok behind.
	tk1,tk2,kw1,kw2,
	depth,exp_depth,one_shot;
  Bool was_new_line,is_not_cont;
};

I64 FmtLstMatch(U8 *st,I64 len,U8 *lst)
{//Like $LK,"LstMatch",A="MN:LstMatch"$, but st is len chars, not terminated.
  I64 res=0,i;
  while (*lst) {
    i=0;
    while (i<len && lst[i]==st[i])
      i++;
    if (i==len && !lst[i])
      return res;
    while (*lst++);
    res++;
  }
  return -1;
}

Bool FmtIdentCh(I64 ch)
{//Like char_bmp_alpha_numeric, plus the high half.
  return 'A'<=ch<='Z' || 'a'<=ch<='z' || '0'<=ch<='9' || ch=='_' || ch=='@' ||
	ch>=0x80;
}

U0 FmtCls(CFmt *f,I64 i,I64 j,I64 c)
{
  if (j>i)
    MemSet(f->cls+i,c,j-i);
}

U0 FmtTokAdd(CFmt *f,I64 type,I64 kw,I64 start,I64 end,I64 y,I64 rec_y)
{
  CFmtTok *t;
  if (f->toks) {
    t=&f->toks[f->tok_cnt];
    t->type=type;
    t->kw=kw;
    t->start=start;
    t->end=end;
    t->y=y;
    t->rec_y=rec_y;
    if (type!='\n' && !(f->lflags[y]&FLF_TOKS)) {
      f->lflags[y]|=FLF_TOKS;
      f->ftok[y]=f->tok_cnt;
    }
  }
  f->tok_cnt++;
}

U0 FmtDolMark(CFmt *f,I64 i,I64 e)
{//Mark the DolDoc cmds in a comment. $$$$ is a $$, not a cmd.
  U8 *src=f->src;
  I64 j;
  while (i<e) {
    if (src[i]=='$$') {
      if (src[i+1]=='$$')
	i+=2;
      else {
	j=i+1;
	while (j<e && src[j]!='$$')
	  j++;
	if (j<e) {
	  FmtCls(f,i,j+1,FC_DOL);
	  f->lflags[f->y]|=FLF_DOL;
	  i=j+1;
	} else
	  i=e;
      }
    } else
      i++;
  }
}

I64 FmtCmt(CFmt *f,I64 i)
{
  U8 *src=f->src;
  I64 j=i;
  while (src[j] && src[j]!='\n')
    j++;
  FmtCls(f,i,j,FC_CMT);
  f->lflags[f->y]|=FLF_CMT;
  FmtDolMark(f,i,j);
  return j;
}

I64 FmtBlkCmt(CFmt *f,I64 i)
{//Block comments nest, like the compiler's.
  U8 *src=f->src;
  I64 j=i+2,depth=1;
  f->lflags[f->y]|=FLF_CMT;
  while (src[j] && depth) {
    if (src[j]=='*' && src[j+1]=='/') {
      depth--;
      j+=2;
    } else if (src[j]=='/' && src[j+1]=='*') {
      depth++;
      j+=2;
    } else {
      if (src[j]=='\n') {
	f->y++;
	f->lflags[f->y]|=FLF_IN_CMT;
      }
      j++;
    }
  }
  FmtCls(f,i,j,FC_CMT);
  return j;
}

I64 FmtStrEnd(CFmt *f,I64 i)
{//Mark the str or char const at i. A DolDoc cmd in a str can hold quotes.
  U8 *src=f->src;
  I64 q=src[i],j=i+1,k;
  while (src[j] && src[j]!=q) {
    if (src[j]=='\\' && src[j+1])
      j++;
    else if (src[j]=='$$' && q=='"') {
      if (src[j+1]=='$$')
	j++;
      else {
	k=j+1;
	while (src[k] && src[k]!='$$' && src[k]!='\n')
	  k++;
	if (src[k]=='$$')
	  j=k;
      }
    }
    if (src[j]=='\n') {
      f->y++;
      f->lflags[f->y]|=FLF_IN_STR;
    }
    j++;
  }
  if (src[j])
    j++;
  FmtCls(f,i,j,FC_STR);
  return j;
}

I64 FmtDol(CFmt *f,I64 i)
{//A DolDoc cmd in code, or a $$$$ for a $$.
  U8 *src=f->src;
  I64 j=i+1,y=f->y;
  if (src[j]=='$$') {
    FmtTokAdd(f,'$$',-1,i,i+2,y,y);
    return i+2;
  }
  while (src[j] && src[j]!='$$') {
    if (src[j]=='\n') {
      f->y++;
      f->lflags[f->y]|=FLF_IN_STR;
    }
    j++;
  }
  if (src[j])
    j++;
  FmtCls(f,i,j,FC_DOL);
  f->lflags[y]|=FLF_DOL|FLF_DOL_CODE;
  if (src[i+1]=='I' && (src[i+2]=='B' || src[i+2]=='S'))
    FmtTokAdd(f,FT_VAL,-1,i,j,y,f->y);
  return j;
}

I64 FmtDir(CFmt *f,I64 i)
{//Preprocessor lines have no toks, but #exe is lexed like a union. A '\\'
//at the end runs it on to the next line, which keeps its spaces.
  U8 *src=f->src;
  I64 j=i+1,k;
  while ('a'<=src[j]<='z')
    j++;
  if (j-i==4 && !FmtLstMatch(src+i+1,3,"exe\0")) {
    FmtTokAdd(f,FT_IDENT,FKW_EXE,i,j,f->y,f->y);
    FmtTokAdd(f,FT_IDENT,-1,j,j,f->y,f->y);
    return j;
  }
  FmtCls(f,i,j,FC_DIR);
  f->lflags[f->y]|=FLF_DIR;
  while (src[j] && src[j]!='\n') {
    if (src[j]=='"' || src[j]=='\'')
      j=FmtStrEnd(f,j);
    else if (src[j]=='/' && src[j+1]=='/')
      j=FmtCmt(f,j);
    else if (src[j]=='/' && src[j+1]=='*')
      j=FmtBlkCmt(f,j);
    else if (src[j]=='\\') {
      f->cls[j++]=FC_DIR;
      k=j;
      while (src[k]==CH_SPACE || src[k]=='\t')
	k++;
      if (k==j && (src[k]=='\n' || src[k]=='\r' && src[k+1]=='\n')) {
	while (src[j]!='\n')
	  f->cls[j++]=FC_DIR;
	FmtTokAdd(f,'\n',-1,j,j+1,f->y,f->y+1);
	f->y++;
	f->lflags[f->y]|=FLF_DIR|FLF_KEEP;
	j++;
      } else if (src[k]=='\n' || src[k]=='\r' && src[k+1]=='\n') {
	FmtCls(f,j,k,FC_STR);	//Trimming it would run the line on.
	j=k;
      }
    } else
      f->cls[j++]=FC_DIR;
  }
  return j;
}

I64 FmtIdent(CFmt *f,I64 i)
{
  U8 *src=f->src;
  I64 j=i+1,kw=-1;
  while (FmtIdentCh(src[j]))
    j++;
  if (f->toks) {
    if ('a'<=src[i]<='z')
      kw=FmtLstMatch(src+i,j-i,fmt_kws);
    else if ('A'<=src[i]<='Z' && FmtLstMatch(src+i,j-i,fmt_ops)>=0)
      kw=FKW_OPCODE;
  }
  FmtTokAdd(f,FT_IDENT,kw,i,j,f->y,f->y);
  return j;
}

I64 FmtNum(CFmt *f,I64 i)
{
  U8 *src=f->src;
  I64 j=i+1;
  while (FmtIdentCh(src[j]))
    j++;
  if (src[j]=='.' && '0'<=src[j+1]<='9') {
    j++;
    while (FmtIdentCh(src[j]))
      j++;
  }
  FmtTokAdd(f,FT_VAL,-1,i,j,f->y,f->y);
  return j;
}

I64 FmtOp(CFmt *f,I64 i)
{
  U8 *src=f->src;
  I64 k;
  if (FmtLstMatch(src+i,3,fmt_ops3)>=0) {
    FmtTokAdd(f,FT_OP,-1,i,i+3,f->y,f->y);
    return i+3;
  }
  if ((k=FmtLstMatch(src+i,2,fmt_ops2))>=0) {
    if (k)
      FmtTokAdd(f,FT_OP,-1,i,i+2,f->y,f->y);
    else
      FmtTokAdd(f,FT_DBL_COLON,-1,i,i+2,f->y,f->y);
    return i+2;
  }
  FmtTokAdd(f,src[i],-1,i,i+1,f->y,f->y);
  return i+1;
}

U0 FmtLex(CFmt *f)
{
  U8 *src=f->src;
  I64 i=0,j,y,ch;
  f->tok_cnt=0;
  f->y=0;
  while (ch=src[i]) {
    switch (ch) {
      case '\n':
	FmtTokAdd(f,'\n',-1,i,i+1,f->y,f->y+1);
	f->y++;
	i++;
	break;
      case CH_SPACE:
      case '\t':
      case '\r':
      case CH_CURSOR:
      case CH_SHIFT_SPACE:
	i++;
	break;
      case '"':
      case '\'':
	y=f->y;
	j=FmtStrEnd(f,i);
	FmtTokAdd(f,FT_VAL,-1,i,j,y,f->y);
	i=j;
	break;
      case '$$':
	i=FmtDol(f,i);
	break;
      case '#':
	i=FmtDir(f,i);
	break;
      case '/':
	if (src[i+1]=='/')
	  i=FmtCmt(f,i);
	else if (src[i+1]=='*')
	  i=FmtBlkCmt(f,i);
	else
	  i=FmtOp(f,i);
	break;
      case '0'...'9':
	i=FmtNum(f,i);
	break;
      default:
	if (FmtIdentCh(ch))
	  i=FmtIdent(f,i);
	else
	  i=FmtOp(f,i);
    }
  }
  FmtTokAdd(f,FT_EOF,-1,i,i,f->y,f->y);
}

U0 FmtRISet(CFmtRI *rx)
{
  CFmtTok *t=&rx->f->toks[rx->p1];
  rx->tk1=t->type;
  rx->kw1=t->kw;
  t=&rx->f->toks[rx->p2];
  rx->tk2=t->type;
  rx->kw2=t->kw;
}

I64 FmtRILex(CFmtRI *rx)
{//Port of $LK,"EdRILex",A="MN:EdRILex"$.
  CFmt *f=rx->f;
  rx->is_not_cont=FALSE;
  do {
    if (rx->p1<f->tok_cnt-1) rx->p1++;
    if (rx->p2<f->tok_cnt-1) rx->p2++;
    FmtRISet(rx);
    if (rx->tk1=='\n' && rx->tk2==';' || rx->tk2=='{' || rx->tk2=='}' ||
	  rx->tk2==':' || rx->tk2==')' && !rx->exp_depth ||
	  rx->kw2==FKW_ELSE || rx->kw2==FKW_CATCH || rx->kw2==FKW_DO)
      rx->is_not_cont=TRUE;
    if (rx->was_new_line && (rx->tk1!=':' || rx->kw2==FKW_CASE ||
	  rx->kw2==FKW_DFT || rx->kw2==FKW_START || rx->kw2==FKW_END)) {
      f->lvl[f->toks[rx->p2].rec_y]=f->run<<8|
	    ClampI64(rx->depth+rx->one_shot,0,255);
      rx->one_shot=0;
    }
    if (rx->tk2=='\n')
      rx->was_new_line=TRUE;
    else
      rx->was_new_line=FALSE;
  } while (rx->tk1=='\n');
  return rx->tk1;
}

U0 FmtRIExp(CFmtRI *rx)
{//Port of $LK,"EdRIExp",A="MN:EdRIExp"$.
  I64 close;
  if (rx->tk1=='(' || rx->tk1=='[') {
    if (rx->tk1=='(')
      close=')';
    else
      close=']';
    if (!rx->exp_depth++)
      rx->depth+=3;
    FmtRILex(rx);
    while (rx->tk1 && rx->tk1!=close)
      FmtRIExp(rx);
    if (!--rx->exp_depth) {
      rx->depth-=3;
      if (rx->depth<0) rx->depth=0;
    }
  }
  FmtRILex(rx);
}

U0 FmtRIStmt(CFmtRI *rx,Bool indent)
{//Port of $LK,"EdRIStmt",A="MN:EdRIStmt"$.
  I64 i;
  Bool cont;
  if (rx->tk1=='{') {
    rx->depth++;
    FmtRILex(rx);
    while (rx->tk1 && rx->tk1!='}')
      FmtRIStmt(rx,FALSE);
    if (--rx->depth<0) rx->depth=0;
    FmtRILex(rx);
  } else {
    if (indent) rx->depth++;
    do {
      cont=FALSE;
      switch (rx->kw1) {
	case FKW_IF:
	  FmtRILex(rx);
	  FmtRIExp(rx);
	  FmtRIStmt(rx,TRUE);
	  if (rx->kw1==FKW_ELSE) {
	    FmtRILex(rx);
	    if (rx->kw1==FKW_IF && rx->tk2!='\n')
	      FmtRIStmt(rx,FALSE);
	    else
	      FmtRIStmt(rx,TRUE);
	  }
	  break;
	case FKW_TRY:
	  FmtRILex(rx);
	  FmtRIStmt(rx,TRUE);
	  if (rx->kw1==FKW_CATCH) {
	    FmtRILex(rx);
	    FmtRIStmt(rx,TRUE);
	  }
	  break;
	case FKW_LOCK:
	  FmtRILex(rx);
	  FmtRIStmt(rx,TRUE);
	  break;
	case FKW_FOR:
	case FKW_WHILE:
	  FmtRILex(rx);
	  FmtRIExp(rx);
	  FmtRIStmt(rx,TRUE);
	  break;
	case FKW_ASM:
	case FKW_CLASS:
	case FKW_UNION:
	case FKW_EXE:
	  if (FmtRILex(rx)==FT_IDENT)
	    FmtRILex(rx);
	  FmtRIStmt(rx,TRUE);
	  break;
	case FKW_DO:
	  FmtRILex(rx);
	  FmtRIStmt(rx,TRUE);
	  if (rx->kw1==FKW_WHILE) {
	    FmtRILex(rx);
	    FmtRIExp(rx);
	  }
	  if (rx->tk1==';')
	    FmtRILex(rx);
	  break;
	case FKW_SWITCH:
	  FmtRILex(rx);
	  FmtRIExp(rx);
	  if (rx->tk1=='{') {
	    rx->depth++;
	    FmtRILex(rx);
	    i=0;
	    while (rx->tk1 && rx->tk1!='}') {
	      switch (rx->kw1) {
		case FKW_START:
		  rx->depth+=i; i=0;
		  while (FmtRILex(rx) && rx->tk1!=':');
		  FmtRILex(rx);
		  i++;
		  break;
		case FKW_END:
		  rx->depth+=i; i=0;
		  if (--rx->depth<0) rx->depth=0;
		  while (FmtRILex(rx) && rx->tk1!=':');
		  FmtRILex(rx);
		  break;
		case FKW_CASE:
		case FKW_DFT:
		  rx->depth+=i; i=0;
		  while (FmtRILex(rx) && rx->tk1!=':');
		  FmtRILex(rx);
		  break;
		default:
		  if (rx->tk1)
		    FmtRIStmt(rx,TRUE);
	      }
	    }
	    if (--rx->depth<0) rx->depth=0;
	    FmtRILex(rx);
	  }
	  break;
	case FKW_OPCODE:
	  do FmtRILex(rx);
	  while (rx->tk2 && rx->tk2!='\n');
	  rx->is_not_cont=TRUE;
	  break;
	default:
	  while (rx->tk1 && rx->tk1!=';' && rx->tk1!=':') {
	    if (rx->tk2=='\n' && !rx->is_not_cont)
	      rx->one_shot=3;
	    FmtRILex(rx);
	  }
	  if (rx->tk1==':')
	    cont=TRUE;
	  FmtRILex(rx);
      }
    } while (cont && rx->tk1!='}');
    if (indent && --rx->depth<0)
      rx->depth=0;
  }
}

I64 FmtRICode(CFmt *f,I64 p)
{//Port of $LK,"EdRICode",A="MN:EdRICode"$, from tok p. Returns where it stopped.
  CFmtRI *rx=CAlloc(sizeof(CFmtRI));
  rx->f=f;
  f->run++;
  rx->p1=p;
  rx->p2=p-1;
  rx->tk1=f->toks[p].type;
  rx->kw1=f->toks[p].kw;
  FmtRIStmt(rx,FALSE);
  p=rx->p1;
  Free(rx);
  return p;
}

I64 FmtLastY(CFmt *f,I64 p)
{//Line the last tok before p ends on.
  while (p>0 && f->toks[p-1].type=='\n')
    p--;
  if (p>0)
    return f->toks[p-1].rec_y;
  return 0;
}

U0 FmtRIApply(CFmt *f,I64 y1,I64 y2)
{//Like the insert loop of EF_REINDENT. Lines it never recorded go to 0.
  I64 y;
  for (y=y1;y<=y2;y++)
    if (f->lvl[y]>>8==f->run)
      f->col[y]=(f->lvl[y]&255)*f->indent;
    else
      f->col[y]=0;
}

I64 FmtRIBlk(CFmt *f,I64 p)
{//Reindent the blk at the '{' tok p, the way Terry's tool did a fun.
  I64 q=FmtRICode(f,p);
  FmtRIApply(f,f->toks[p].y+1,FmtLastY(f,q));
  return q;
}

I64 FmtStarCol(CFmt *f,I64 p)
{//Col of the '*' in "U8 *a,", from the item's first tok p, or -1.
  I64 i,col=0,y=f->toks[p].y,q=p;
  while (f->toks[q].type==FT_IDENT && f->toks[q].y==y)
    q++;
  if (q==p || f->toks[q].type!='*' || f->toks[q].y!=y)
    return -1;
  for (i=f->toks[p].start;i<f->toks[q].start;i++)
    if (f->src[i]=='\t')
      col=(col+8)&~7;
    else
      col++;
  return col;
}

U0 FmtContLines(CFmt *f,I64 p,I64 y1,I64 y2)
{//Later lines of the top-level item at tok p go a tab in. A line that
//starts with a str goes to 0, and one that starts with a '*' goes under
//the first line's.
  I64 y,sc=FmtStarCol(f,p);
  CFmtTok *t;
  for (y=y1;y<=y2;y++)
    if (f->lflags[y]&FLF_TOKS) {
      t=&f->toks[f->ftok[y]];
      if (t->type==FT_VAL && f->src[t->start]=='"')
	f->col[y]=0;
      else if (t->type=='*' && sc>=0)
	f->col[y]=sc;
      else
	f->col[y]=8;
    } else
      f->col[y]=0;
}

Bool FmtFirstOnLine(CFmt *f,I64 p)
{
  return !p || f->toks[p-1].type=='\n' || f->toks[p-1].rec_y<f->toks[p].y;
}

I64 FmtBlkKind(CFmt *f,I64 p0,I64 p)
{//What sort of top-level blk the '{' at p opens. The item starts at p0.
  I64 q=p-1;
  while (q>=p0 && f->toks[q].type=='\n')
    q--;
  if (q>=p0) {
    if (f->toks[q].type==')')
      return FBK_FUN;
    if (f->toks[q].type=='=')
      return FBK_INIT;
  }
  if (f->toks[p0].kw==FKW_ASM)
    return FBK_ASM;
  for (q=p0;q<p;q++)
    if (f->toks[q].kw==FKW_EXE)
      return FBK_EXE;
  for (q=p0;q<p;q++)
    if (f->toks[q].kw==FKW_CLASS || f->toks[q].kw==FKW_UNION)
      return FBK_CLASS;
  return FBK_OTHER;
}

I64 FmtInitBlk(CFmt *f,I64 p)
{//Initializer lists keep their own layout. Returns the '}' tok.
  I64 y,y1=f->toks[p].y,depth=0;
  while (f->toks[p].type) {
    if (f->toks[p].type=='{')
      depth++;
    else if (f->toks[p].type=='}' && !--depth)
      break;
    p++;
  }
  for (y=y1+1;y<=f->toks[p].rec_y;y++)
    f->col[y]=-1;
  return p;
}

I64 FmtAsmCol(CFmt *f,I64 p,I64 depth)
{//Labels go at 0 and the rest a tab in. Data lists after a comma keep theirs.
  CFmtTok *t=&f->toks[p],*u=&f->toks[p+1];
  I64 q=p-1;
  if (depth>1)
    return -1;
  if (t->type=='}' || t->kw==FKW_EXE)
    return 0;
  while (q>0 && f->toks[q].type=='\n')
    q--;
  switch (f->toks[q].type) {
    case FT_IDENT:
    case FT_VAL:
    case FT_DBL_COLON:
    case ':':
    case ';':
    case ')':
    case ']':
    case '{':
    case '}':
      break;
    default:		//A ',' or an op runs the line on.
      return -1;
  }
  if (t->type==FT_IDENT) {
    if (u->type==':' || u->type==FT_DBL_COLON)
      return 0;
    if (FmtLstMatch(f->src+t->start,t->end-t->start,
	  "USE16\0USE32\0USE64\0")>=0)
      return 0;
  }
  return 8;
}

I64 FmtAsmBlk(CFmt *f,I64 p)
{//Top-level asm blk at the '{' tok p. Returns the tok after its '}'.
  I64 depth=1;
  CFmtTok *t;
  p++;
  while (depth>0) {
    t=&f->toks[p];
    if (!t->type)
      return p;
    if (t->type!='\n') {
      if (FmtFirstOnLine(f,p))
	f->col[t->y]=FmtAsmCol(f,p,depth);
      f->lflags[t->y]|=FLF_ASM;
      if (t->type=='{')
	depth++;
      else if (t->type=='}')
	depth--;
    }
    p++;
  }
  return p;
}

I64 FmtTopStmt(CFmt *f,I64 p)
{//A top-level decl, stmt or blk. Returns the tok after it.
  I64 p0=p,y=f->toks[p].y,depth=0,k;
  Bool ext=FALSE,args=FALSE;
  CFmtTok *t;
  while (TRUE) {
    t=&f->toks[p];
    switch (t->type) {
      case FT_EOF:
	FmtContLines(f,p0,y+1,FmtLastY(f,p));
	return p;
      case FT_IDENT:
	if (!depth && FmtLstMatch(f->src+t->start,t->end-t->start,
	      "extern\0_extern\0import\0_import\0_intern\0")>=0)
	  ext=TRUE;
	break;
      case '(':
	if (!depth && ext)
	  args=TRUE;
      case '[':
	depth++;
	break;
      case ')':
      case ']':
	if (depth>0 && !--depth && args) {
//An extern proto ends at its ')'. See $LK,"PrsGlblVarLst",A="MN:PrsGlblVarLst"$.
	  FmtContLines(f,p0,y+1,t->rec_y);
	  return p+1;
	}
	break;
      case ';':
      case '}':
	if (!depth) {
	  FmtContLines(f,p0,y+1,t->rec_y);
	  return p+1;
	}
	break;
      case '{':
	if (!depth) {
	  FmtContLines(f,p0,y+1,t->y);
	  k=FmtBlkKind(f,p0,p);
	  if (FmtFirstOnLine(f,p)) {
	    if (k==FBK_INIT)
	      f->col[t->y]=-1;
	    else
	      f->col[t->y]=0;
	  }
	  switch (k) {
	    case FBK_ASM:
	      return FmtAsmBlk(f,p);
	    case FBK_CLASS:
	      p=FmtRIBlk(f,p)-1;
	      y=FmtLastY(f,p+1);
	      break;
	    case FBK_INIT:
	      p=FmtInitBlk(f,p);
	      y=f->toks[p].rec_y;
	      break;
	    default:
	      return FmtRIBlk(f,p);
	  }
	}
	break;
    }
    if (f->toks[p].type)
      p++;
  }
}

U0 FmtTop(CFmt *f)
{//Top-level items. An if or a for out here gets the reindenter too.
  I64 p=0,q;
  CFmtTok *t;
  while (TRUE) {
    while (f->toks[p].type=='\n')
      p++;
    t=&f->toks[p];
    if (!t->type)
      break;
    switch (t->kw) {
      case FKW_IF:
      case FKW_FOR:
      case FKW_WHILE:
      case FKW_DO:
      case FKW_SWITCH:
      case FKW_TRY:
      case FKW_LOCK:
	q=FmtRICode(f,p);
	FmtRIApply(f,t->y+1,FmtLastY(f,q));
	break;
      default:
	q=FmtTopStmt(f,p);
    }
    if (q<=p)
      q=p+1;
    p=q;
  }
}

U0 FmtKeep(CFmt *f)
{//Lines that start in a str or a comment, or hold DolDoc and no code, keep
//their leading space.
  I64 y,fl;
  for (y=0;y<f->line_cnt;y++) {
    fl=f->lflags[y];
    if (fl&(FLF_IN_STR|FLF_IN_CMT|FLF_KEEP) ||
	  fl&FLF_DOL_CODE && !(fl&(FLF_TOKS|FLF_DIR)))
      f->col[y]=-1;
  }
}

I64 FmtGap(CFmt *f,CFmtTok *t,CFmtTok *u)
{//Spaces wanted between t and u, or -1 to leave the gap alone.
  if (t->type==FT_IDENT) {
    if ((t->kw==FKW_IF || t->kw==FKW_FOR || t->kw==FKW_WHILE ||
	  t->kw==FKW_SWITCH) && (u->type=='(' || u->type=='['))
      return 1;
    if (u->type=='{')
      return 1;
  }
  if ((t->type==')' || t->type==']') && u->type=='{')
    return 1;
  if (t->type=='}' &&
	(u->kw==FKW_ELSE || u->kw==FKW_CATCH || u->kw==FKW_WHILE))
    return 1;
  if (t->type==',' && u->start-t->end==1 && f->src[t->end]==CH_SPACE)
    return 0;
  return -1;
}

U0 FmtGaps(CFmt *f)
{//Redo the gaps $LK,"FmtGap",A="MN:FmtGap"$ has rules for.
  I64 p,i,g;
  CFmtTok *t,*u;
  for (p=0;p<f->tok_cnt-1;p++) {
    t=&f->toks[p];
    u=&f->toks[p+1];
    if (t->type!='\n' && u->type!='\n' && u->type && t->rec_y==u->y &&
	  !(f->lflags[u->y]&FLF_ASM)) {
      for (i=t->end;i<u->start;i++)
	if (f->cls[i]!=FC_CODE || f->src[i]!=CH_SPACE && f->src[i]!='\t')
	  break;
      if (i==u->start && (g=FmtGap(f,t,u))>=0) {
	FmtCls(f,t->end,u->start,FC_GAP);
	u->sp=g;
      }
    }
  }
}

U0 FmtPutC(CFmt *f,I64 ch)
{
  U8 *b;
  if (f->out_len+1>=f->out_size) {
    f->out_size<<=1;
    b=MAlloc(f->out_size);
    MemCpy(b,f->out,f->out_len);
    Free(f->out);
    f->out=b;
  }
  f->out[f->out_len++]=ch;
}

U0 FmtLBPut(CFmt *f,I64 ch,Bool protect)
{
  f->lb[f->lb_len]=ch;
  f->lp[f->lb_len++]=protect;
}

U0 FmtS2T(CFmt *f)
{//Port of $LK,"Spaces2Tabs",A="MN:Spaces2Tabs"$, on the line buf. Protected
//spaces are left alone.
  U8 *lb=f->lb,*lp=f->lp;
  I64 i=0,j,n=f->lb_len,space_cnt,space_cnt2,col=0;
  while (TRUE) {
    j=i;
    while (j<n && lb[j]==CH_SPACE && !lp[j])
      j++;
    space_cnt=j-i;
    while (col+space_cnt>=8) {
      space_cnt2=8-col;
      if (space_cnt2==1)
	FmtPutC(f,CH_SPACE);
      else
	FmtPutC(f,'\t');
      space_cnt-=space_cnt2;
      col=0;
    }
    if (j<n && lb[j]=='\t') {
      if (space_cnt==1 && col==7)
	FmtPutC(f,CH_SPACE);
      FmtPutC(f,'\t');
      col=0;
    } else {
      while (space_cnt--) {
	FmtPutC(f,CH_SPACE);
	if (++col==8)
	  col=0;
      }
      if (j<n) {
	FmtPutC(f,lb[j]);
	if (++col==8)
	  col=0;
      } else
	break;
    }
    i=j+1;
  }
}

U0 FmtT2S(CFmt *f)
{//Tabs to spaces, but not in strs or DolDoc cmds.
  I64 i,ch,col=0;
  for (i=0;i<f->lb_len;i++) {
    ch=f->lb[i];
    if (ch=='\t' && !f->lp[i]) {
      do FmtPutC(f,CH_SPACE);
      while (++col&7);
    } else {
      FmtPutC(f,ch);
      if (ch=='\t')
	col=(col+8)&~7;
      else
	col++;
    }
  }
}

U0 FmtLinePut(CFmt *f,I64 y)
{
  U8 *src=f->src;
  I64 i=f->line_start[y],e=f->line_start[y+1]-1,g;
  Bool cr=FALSE;
  f->lb_len=0;
  if (e>i && src[e-1]=='\r') {
    e--;
    cr=TRUE;
  }
  if (f->col[y]>=0) {
    while (i<e && (src[i]==CH_SPACE || src[i]=='\t'))
      i++;
    for (g=0;g<f->col[y];g++)
      FmtLBPut(f,CH_SPACE,FALSE);
  }
  while (i<e) {
    while (f->toks[f->ti].type && f->toks[f->ti].start<i)
      f->ti++;
    while (f->toks[f->ti].type && f->toks[f->ti].start==i) {
      for (g=0;g<f->toks[f->ti].sp;g++)
	FmtLBPut(f,CH_SPACE,FALSE);
      f->ti++;
    }
    if (f->cls[i]!=FC_GAP)
      FmtLBPut(f,src[i],f->cls[i]==FC_STR || f->cls[i]==FC_DOL);
    i++;
  }
  while (f->lb_len>0 && !f->lp[f->lb_len-1] &&
	(f->lb[f->lb_len-1]==CH_SPACE || f->lb[f->lb_len-1]=='\t'))
    f->lb_len--;
  if (f->tabs)
    FmtS2T(f);
  else
    FmtT2S(f);
  if (cr)
    FmtPutC(f,'\r');
  FmtPutC(f,'\n');
}

Bool FmtIsBlank(CFmt *f,I64 y)
{
  I64 i=f->line_start[y],e=f->line_start[y+1]-1;
  if (f->lflags[y]&(FLF_IN_STR|FLF_IN_CMT))
    return FALSE;
  while (i<e) {
    if (f->src[i]!=CH_SPACE && f->src[i]!='\t' && f->src[i]!='\r')
      return FALSE;
    i++;
  }
  return TRUE;
}

U0 FmtOut(CFmt *f)
{//One blank line between things and none at the ends, but blank lines next
//to DolDoc stay. They are often the room for a sprite.
  I64 y=0,y2,n;
  while (y<f->line_cnt) {
    if (FmtIsBlank(f,y)) {
      y2=y;
      while (y2<f->line_cnt && FmtIsBlank(f,y2))
	y2++;
      if (y>0 && f->lflags[y-1]&FLF_DOL ||
	    y2<f->line_cnt && f->lflags[y2]&FLF_DOL)
	n=y2-y;
      else if (!y || y2==f->line_cnt)
	n=0;
      else
	n=1;
      while (n--)
	FmtLinePut(f,y++);
      y=y2;
    } else
      FmtLinePut(f,y++);
  }
  f->out[f->out_len]=0;
}

U0 FmtInit(CFmt *f,U8 *src)
{
  I64 i,y=0,len,max_len=0;
  f->src=src;
  f->src_len=StrLen(src);
  for (i=0;i<f->src_len;i++)
    if (src[i]=='\n')
      f->line_cnt++;
  if (f->src_len && src[f->src_len-1]!='\n')
    f->line_cnt++;
  f->line_start=MAlloc((f->line_cnt+2)*sizeof(I64));
  f->lvl=CAlloc((f->line_cnt+2)*sizeof(I64));
  f->col=CAlloc((f->line_cnt+2)*sizeof(I64));
  f->ftok=CAlloc((f->line_cnt+2)*sizeof(I64));
  f->lflags=CAlloc((f->line_cnt+2)*sizeof(U16));
  f->cls=CAlloc(f->src_len+1);
  f->line_start[0]=0;
  for (i=0;i<f->src_len;i++)
    if (src[i]=='\n') {
      len=i-f->line_start[y];
      if (len>max_len) max_len=len;
      f->line_start[++y]=i+1;
    }
  if (y<f->line_cnt) {
    len=f->src_len-f->line_start[y];
    if (len>max_len) max_len=len;
    f->line_start[++y]=f->src_len+1;
  }
  f->lb=MAlloc(2*max_len+2100);
  f->lp=MAlloc(2*max_len+2100);
  f->out_size=2*f->src_len+256;
  f->out=MAlloc(f->out_size);
  FmtLex(f);
  f->toks=CAlloc(f->tok_cnt*sizeof(CFmtTok));
  FmtLex(f);
}

U0 FmtDel(CFmt *f)
{
  Free(f->line_start);
  Free(f->lvl);
  Free(f->col);
  Free(f->ftok);
  Free(f->lflags);
  Free(f->cls);
  Free(f->lb);
  Free(f->lp);
  Free(f->out);
  Free(f->toks);
  Free(f);
}

public U8 *HolyCFmtBuf(U8 *src,I64 indent=2,Bool tabs=TRUE)
{//Returns src laid out like Terry's tree, in a new buf. Free it.
  CFmt *f=CAlloc(sizeof(CFmt));
  U8 *res;
  f->indent=indent;
  f->tabs=tabs;
  try {
    FmtInit(f,src);
    FmtTop(f);
    FmtKeep(f);
    FmtGaps(f);
    FmtOut(f);
    res=f->out;
    f->out=NULL;
  } catch
    FmtDel(f);
  FmtDel(f);
  return res;
}
