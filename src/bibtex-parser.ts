// src/bibtex-parser.ts
import { parser as bibtexParser } from './bibtex.mjs';
import {
  LRLanguage, indentNodeProp, foldNodeProp, foldInside
} from '@codemirror/language';
import { styleTags, tags as t } from '@lezer/highlight';

export interface BibtexParseState {
  inEntry: boolean;
  entryType: string;
  braceDepth: number;
  inField: boolean;
  inValue: boolean;
  valueType: 'quoted' | 'braced' | 'literal' | null;
  inMath: boolean;
  mathDelimiter: '$$' | '$' | null;
}

export const parser = LRLanguage.define({
  parser: bibtexParser.configure({
    props: [
      indentNodeProp.add({
        Entry: ctx => ctx.baseIndent + ctx.unit,
        StringEntry: ctx => ctx.baseIndent + ctx.unit,
        BracedValue: ctx => ctx.baseIndent + ctx.unit
      }),
      foldNodeProp.add({
        Entry: foldInside,
        StringEntry: foldInside,
        PreambleEntry: foldInside,
        CommentEntry: foldInside,
        BracedValue: foldInside
      }),
      styleTags({
        EntryType: t.definitionKeyword,
        EntryKey: t.atom,
        FieldName: t.propertyName,
        StringName: t.propertyName,
        StringRef: t.variableName,
        Number: t.number,
        Concat: t.operator,
        BracedValue: t.string,
        QuotedValue: t.string,
        Escape: t.escape,
        Comment: t.lineComment,
        CommentBody: t.lineComment
      })
    ]
  }),
  languageData: {
    commentTokens: { line: '%' },
    closeBrackets: { brackets: ['{', '"'] }
  }
});

export function isEntryType(type: string): boolean {
  const entryTypes = [
    'article', 'book', 'incollection', 'inproceedings', 'conference',
    'misc', 'manual', 'mastersthesis', 'phdthesis', 'techreport',
    'unpublished', 'online', 'webpage', 'booklet', 'proceedings'
  ];
  return entryTypes.includes(type.toLowerCase());
}

export function getFieldType(fieldName: string): 'required' | 'optional' | 'unknown' {
  const commonRequired = ['author', 'title', 'year'];
  const commonOptional = ['pages', 'volume', 'number', 'month', 'note', 'doi', 'url', 'isbn'];

  if (commonRequired.includes(fieldName.toLowerCase())) return 'required';
  if (commonOptional.includes(fieldName.toLowerCase())) return 'optional';
  return 'unknown';
}

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
