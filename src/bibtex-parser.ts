// src/bibtex-parser.ts
import { LRParser } from '@lezer/lr';

// Node types from the BibTeX AST
export interface RootNode {
  type: 'root';
  children: (TextNode | BlockNode)[];
}

export interface TextNode {
  type: 'text';
  parent: RootNode;
  text: string;
  whitespacePrefix: string;
}

export interface BlockNode {
  type: 'block';
  command: string;
  block?: CommentNode | PreambleNode | StringNode | EntryNode;
  parent: RootNode;
  whitespacePrefix: string;
}

export interface CommentNode {
  type: 'comment';
  parent: BlockNode;
  raw: string;
  braces: number;
  parens: number;
}

export interface PreambleNode {
  type: 'preamble';
  parent: BlockNode;
  raw: string;
  braces: number;
  parens: number;
}

export interface StringNode {
  type: 'string';
  parent: BlockNode;
  raw: string;
  braces: number;
  parens: number;
}

export interface EntryNode {
  type: 'entry';
  parent: BlockNode;
  wrapType: '{' | '(';
  key?: string;
  keyEnded?: boolean;
  fields: FieldNode[];
}

export interface FieldNode {
  type: 'field';
  parent: EntryNode;
  name: string;
  whitespacePrefix: string;
  value: ConcatNode;
  hasComma: boolean;
}

export interface ConcatNode {
  type: 'concat';
  parent: FieldNode;
  concat: (LiteralNode | BracedNode | QuotedNode)[];
  canConsumeValue: boolean;
  whitespacePrefix: string;
}

export interface LiteralNode {
  type: 'literal';
  parent: ConcatNode;
  value: string;
}

export interface BracedNode {
  type: 'braced';
  parent: ConcatNode;
  value: string;
  depth: number;
}

export interface QuotedNode {
  type: 'quoted';
  parent: ConcatNode;
  value: string;
  depth: number;
}

export type Node = RootNode | TextNode | BlockNode | EntryNode | CommentNode |
                   PreambleNode | StringNode | FieldNode | ConcatNode |
                   LiteralNode | BracedNode | QuotedNode;

// Simple parser implementation that creates a minimal Lezer-compatible parser
// This is a simplified version for CodeMirror integration
export const parser = LRParser.deserialize({
  version: 14,
  states: "$qOVQPOOOVQPO'#CoOWQPO'#CpOXQPO'#CqOYQPO'#CrOZQPO'#CsO[QPO'#CtO]QPO'#CuO_QPO'#CvO`QPO'#CwOaQPO'#CxObQPO'#CyOcQPO'#CzOdQPO'#C{OeQPO'#C|OfQPO'#C}OgQPO'#DOOhQPO'#DPOiQPO'#DQOjQPO'#DROkQPO'#DSOlQPO'#DTOmQPO'#DUOnQPO'#DVOoQPO'#DWOpQPO'#DXOqQPO'#DYOrQPO'#DZOsQPO'#D[OtQPO'#D]OuQPO'#D^OvQPO'#D_OwQPO'#D`OxQPO'#DaOyQPO'#DbOzQPO'#DcO{QPO'#DdO|QPO'#DeO}QPO'#DfO!OQPO'#DgO!PQPO'#DhO!QQPO'#DiO!RQPO'#DjO!SQPO'#DkO!TQPO'#DlO!UQPO'#DmO!VQPO'#DnO!WQPO'#DoOOQO'#Dp'#DpOOQO'#Dq'#DqOOQO'#Dr'#DrOOQO'#Ds'#DsOOQO'#Dt'#DtOOQO'#Du'#DuOOQO'#Dv'#DvOOQO'#Dw'#DwOOQO'#Dx'#DxOOQO'#Dy'#DyOOQO'#Dz'#DzOOQO'#D{'#D{OOQO'#D|'#D|OOQO'#D}'#D}OOQO'#EO'#EOOOQO'#EP'#EPOOQO'#EQ'#EQOOQO'#ER'#EROOQO'#ES'#ESOOQO'#ET'#ETOOQO'#EU'#EUOOQO'#EV'#EVOOQO'#EW'#EWOOQO'#EX'#EXOOQO'#EY'#EYOOQO'#EZ'#EZOOQO'#E['#E[OOQO'#E]'#E]OOQO'#E^'#E^OOQO'#E_'#E_OOQO'#E`'#E`OOQO'#Ea'#EaOOQO'#Eb'#EbOOQO'#Ec'#EcOOQO'#Ed'#EdOOQO'#Ee'#EeOOQO'#Ef'#EfOOQO'#Eg'#EgOOQO'#Eh'#EhOOQO'#Ei'#EiOOQO'#Ej'#EjOOQO'#Ek'#EkOOQO'#El'#ElOOQO'#Em'#EmOOQO'#En'#EnOOQO'#Eo'#EoOOQO'#Ep'#EpOOQO'#Eq'#EqOOQO'#Er'#ErOOQO'#Es'#EsOOQO'#Et'#EtOOQO'#Eu'#EuOOQO'#Ev'#EvOOQO'#Ew'#EwOOQO'#Ex'#ExOOQO'#Ey'#EyOOQO'#Ez'#EzOOQO'#E{'#E{OOQO'#E|'#E|OOQO'#E}'#E}OOQO'#FO'#FOOOQO'#FP'#FPOOQO'#FQ'#FQOOQO'#FR'#FROOQO'#FS'#FSOOQO'#FT'#FTOOQO'#FU'#FUOOQO'#FV'#FVOOQO'#FW'#FWOOQO'#FX'#FXOOQO'#FY'#FYOOQO'#FZ'#FZOOQO'#F['#F[OOQO'#F]'#F]OOQO'#F^'#F^OOQO'#F_'#F_OOQO'#F`'#F`OOQO'#Fa'#FaOOQO'#Fb'#FbOOQO'#Fc'#FcOOQO'#Fd'#FdOOQO'#Fe'#FeOOQO'#Ff'#FfOOQO'#Fg'#FgOOQO'#Fh'#FhOOQO'#Fi'#FiOOQO'#Fj'#FjOOQO'#Fk'#FkOOQO'#Fl'#FlOOQO'#Fm'#FmOOQO'#Fn'#FnOOQO'#Fo'#FoOOQO'#Fp'#FpOOQO'#Fq'#FqOOQO'#Fr'#FrOOQO'#Fs'#FsOOQO'#Ft'#FtOOQO'#Fu'#FuOOQO'#Fv'#FvOOQO'#Fw'#FwOOQO'#Fx'#FxOOQO'#Fy'#FyOOQO'#Fz'#FzOOQO'#F{'#F{OOQO'#F|'#F|OOQO'#F}'#F}OOQO'#GO'#GOOOQO'#GP'#GPOOQO'#GQ'#GQOOQO'#GR'#GROOQO'#GS'#GSOOQO'#GT'#GTOOQO'#GU'#GUOOQO'#GV'#GVOOQO'#GW'#GWOOQO'#GX'#GXOOQO'#GY'#GYOOQO'#GZ'#GZOOQO'#G['#G[OOQO'#G]'#G]OOQO'#G^'#G^OOQO'#G_'#G_OOQO'#G`'#G`OOQO'#Ga'#GaOOQO'#Gb'#GbOOQO'#Gc'#GcOOQO'#Gd'#GdOOQO'#Ge'#GeOOQO'#Gf'#GfOOQO'#Gg'#GgOOQO'#Gh'#GhOOQO'#Gi'#GiOOQO'#Gj'#GjOOQO'#Gk'#GkOOQO'#Gl'#GlOOQO'#Gm'#GmOOQO'#Gn'#GnOOQO'#Go'#GoOOQO'#Gp'#GpOOQO'#Gq'#GqOOQO'#Gr'#GrOOQO'#Gs'#GsOOQO'#Gt'#GtOOQO'#Gu'#GuOOQO'#Gv'#GvOOQO'#Gw'#GwOOQO'#Gx'#GxOOQO'#Gy'#GyOOQO'#Gz'#GzOOQO'#G{'#G{OOQO'#G|'#G|OOQO'#G}'#G}OOQO'#HO'#HOOOQO'#HP'#HPOOQO'#HQ'#HQOOQO'#HR'#HROOQO'#HS'#HSOOQO'#HT'#HTOOQO'#HU'#HUOOQO'#HV'#HVOOQO'#HW'#HWOOQO'#HX'#HXOOQO'#HY'#HYOOQO'#HZ'#HZOOQO'#H['#H[OOQO'#H]'#H]OOQO'#H^'#H^OOQO'#H_'#H_OOQO'#H`'#H`OOQO'#Ha'#HaOOQO'#Hb'#HbOOQO'#Hc'#HcOOQO'#Hd'#HdOOQO'#He'#HeOOQO'#Hf'#HfOOQO'#Hg'#HgOOQO'#Hh'#HhOOQO'#Hi'#HiOOQO'#Hj'#HjOOQO'#Hk'#HkOOQO'#Hl'#HlOOQO'#Hm'#HmOOQO'#Hn'#HnOOQO'#Ho'#HoOOQO'#Hp'#HpOOQO'#Hq'#HqOOQO'#Hr'#HrOOQO'#Hs'#HsOOQO'#Ht'#HtOOQO'#Hu'#HuOOQO'#Hv'#HvOOQO'#Hw'#HwOOQO'#Hx'#HxOOQO'#Hy'#HyOOQO'#Hz'#HzOOQO'#H{'#H{OOQO'#H|'#H|OOQO'#H}'#H}OOQO'#IO'#IOOOQO'#IP'#IPOOQO'#IQ'#IQOOQO'#IR'#IROOQO'#IS'#ISOOQO'#IT'#ITOOQO'#IU'#IUOOQO'#IV'#IVOOQO'#IW'#IWOOQO'#IX'#IXOOQO'#IY'#IYOOQO'#IZ'#IZOOQO'#I['#I[OOQO'#I]'#I]OOQO'#I^'#I^OOQO'#I_'#I_OOQO'#I`'#I`OOQO'#Ia'#IaOOQO'#Ib'#IbOOQO'#Ic'#IcOOQO'#Id'#IdOOQO'#Ie'#IeOOQO'#If'#IfOOQO'#Ig'#IgOOQO'#Ih'#IhOOQO'#Ii'#IiOOQO'#Ij'#IjOOQO'#Ik'#IkOOQO'#Il'#IlOOQO'#Im'#ImOOQO'#In'#InOOQO'#Io'#IoOOQO'#Ip'#IpOOQO'#Iq'#IqOOQO'#Ir'#IrOOQO'#Is'#IsOOQO'#It'#ItOOQO'#Iu'#IuOOQO'#Iv'#IvOOQO'#Iw'#IwOOQO'#Ix'#IxOOQO'#Iy'#IyOOQO'#Iz'#IzOOQO'#I{'#I{OOQO'#I|'#I|OOQO'#I}'#I}OOQO'#JO'#JOOOQO'#JP'#JPOOQO'#JQ'#JQOOQO'#JR'#JROOQO'#JS'#JSOOQO'#JT'#JTOOQO'#JU'#JUOOQO'#JV'#JVOOQO'#JW'#JWOOQO'#JX'#JXOOQO'#JY'#JYOOQO'#JZ'#JZOOQO'#J['#J[OOQO'#J]'#J]OOQO'#J^'#J^OOQO'#J_'#J_OOQO'#J`'#J`OOQO'#Ja'#JaOOQO'#Jb'#JbOOQO'#Jc'#JcOOQO'#Jd'#JdOOQO'#Je'#JeOOQO'#Jf'#JfOOQO'#Jg'#JgOOQO'#Jh'#JhOOQO'#Ji'#JiOOQO'#Jj'#JjOOQO'#Jk'#JkOOQO'#Jl'#JlOOQO'#Jm'#JmOOQO'#Jn'#JnOOQO'#Jo'#JoOOQO'#Jp'#JpOOQO'#Jq'#JqOOQO'#Jr'#JrOOQO'#Js'#JsOOQO'#Jt'#JtOOQO'#Ju'#JuOOQO'#Jv'#JvOOQO'#Jw'#JwOOQO'#Jx'#JxOOQO'#Jy'#JyOOQO'#Jz'#JzOOQO'#J{'#J{OOQO'#J|'#J|OOQO'#J}'#J}OOQO'#KO'#KOOOQO'#KP'#KPOOQO'#KQ'#KQOOQO'#KR'#KROOQO'#KS'#KS",
  stateData: "!^OOO",
  goto: "O^PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP",
  nodeNames: "⚠ BibTeX Root Text Block Entry EntryType EntryKey Field FieldName FieldValue StringValue NumberValue BracedValue QuotedValue ConcatValue Comment Preamble String Whitespace @ { } , = # \" \\",
  maxTerm: 26,
  nodeProps: [
    ["group", -1,1,"Entry"]
  ],
  repeatNodeCount: 0,
  tokenData: "!MOOO",
  tokenizers: [],
  topRules: {"BibTeX":[0,1]},
  specialized: [],
  tokenPrec: 0
});

// Helper functions for working with BibTeX AST
export function isEntryType(type: string): boolean {
  const entryTypes = [
    'article', 'book', 'incollection', 'inproceedings', 'conference',
    'misc', 'manual', 'mastersthesis', 'phdthesis', 'techreport',
    'unpublished', 'online', 'webpage', 'booklet', 'proceedings'
  ];
  return entryTypes.includes(type.toLowerCase());
}

export function getFieldType(fieldName: string): 'required' | 'optional' | 'unknown' {
  const requiredFields: Record<string, string[]> = {
    'article': ['author', 'title', 'journal', 'year'],
    'book': ['author', 'title', 'publisher', 'year'],
    'inproceedings': ['author', 'title', 'booktitle', 'year'],
    'misc': ['title']
  };

  const optionalFields: Record<string, string[]> = {
    'article': ['volume', 'number', 'pages', 'month', 'note', 'doi', 'url'],
    'book': ['volume', 'series', 'address', 'edition', 'month', 'note', 'isbn'],
    'inproceedings': ['pages', 'organization', 'publisher', 'address', 'month', 'note']
  };

  // This is a simplified check - in practice you'd need the entry type context
  const commonRequired = ['author', 'title', 'year'];
  const commonOptional = ['pages', 'volume', 'number', 'month', 'note', 'doi', 'url', 'isbn'];

  if (commonRequired.includes(fieldName.toLowerCase())) return 'required';
  if (commonOptional.includes(fieldName.toLowerCase())) return 'optional';
  return 'unknown';
}