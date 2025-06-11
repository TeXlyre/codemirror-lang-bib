// src/bibtex-parser.ts
import { StreamLanguage } from '@codemirror/language';

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

const bibtexLanguage = {
  startState(): BibtexParseState {
    return {
      inEntry: false,
      entryType: '',
      braceDepth: 0,
      inField: false,
      inValue: false,
      valueType: null,
      inMath: false,
      mathDelimiter: null
    };
  },

  token(stream: any, state: BibtexParseState) {
    if (stream.eatSpace()) return null;

    // Comments
    if (stream.match(/^%.*$/)) {
      return 'comment';
    }

    // Math mode handling (only inside field values)
    if (state.inValue) {
      // Check for math delimiters
      if (stream.match(/^\$\$/)) {
        if (state.inMath && state.mathDelimiter === '$$') {
          state.inMath = false;
          state.mathDelimiter = null;
        } else if (!state.inMath) {
          state.inMath = true;
          state.mathDelimiter = '$$';
        }
        return 'meta';
      }

      if (stream.match(/^\$/)) {
        if (state.inMath && state.mathDelimiter === '$') {
          state.inMath = false;
          state.mathDelimiter = null;
        } else if (!state.inMath) {
          state.inMath = true;
          state.mathDelimiter = '$';
        }
        return 'meta';
      }

      // Inside math mode
      if (state.inMath) {
        // LaTeX commands
        if (stream.match(/^\\[a-zA-Z]+/)) {
          return 'keyword';
        }

        // LaTeX symbols
        if (stream.match(/^\\[^a-zA-Z\s]/)) {
          return 'keyword';
        }

        // Math content
        if (stream.match(/^[^$\\]+/)) {
          return 'string';
        }

        // If we hit something we don't recognize in math mode, consume one character
        if (!stream.eol()) {
          stream.next();
          return 'string';
        }
      }

      // URLs and DOIs (only when not in math mode)
      if (!state.inMath) {
        if (stream.match(/^https?:\/\/[^\s,}]+/)) {
          return 'link';
        }

        if (stream.match(/^doi:\s*[^\s,}]+/i)) {
          return 'link';
        }

        if (stream.match(/^10\.\d+\/[^\s,}]+/)) {
          return 'link';
        }

        // LaTeX commands outside math mode
        if (stream.match(/^\\[a-zA-Z]+\*?/)) {
          return 'keyword';
        }

        // LaTeX symbols and escapes
        if (stream.match(/^\\[^a-zA-Z\s]/)) {
          return 'keyword';
        }
      }
    }

    // Entry start
    if (stream.match(/^@([a-zA-Z]+)/)) {
      state.inEntry = true;
      state.entryType = stream.current().substring(1).toLowerCase();
      return 'keyword';
    }

    // Entry key
    if (state.inEntry && !state.inField && stream.match(/^[a-zA-Z0-9_:.-]+/)) {
      return 'atom';
    }

    // Field names
    if (state.inEntry && stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)) {
      state.inField = true;
      return 'property';
    }

    // Operators
    if (stream.eat('=')) {
      state.inValue = true;
      return 'operator';
    }

    if (stream.eat(',')) {
      state.inField = false;
      state.inValue = false;
      state.valueType = null;
      state.inMath = false;
      state.mathDelimiter = null;
      return 'punctuation';
    }

    if (stream.eat('#')) {
      return 'operator';
    }

    // Braces
    if (stream.eat('{')) {
      state.braceDepth++;
      if (state.inValue && !state.valueType) {
        state.valueType = 'braced';
      }
      return 'brace';
    }

    if (stream.eat('}')) {
      state.braceDepth--;
      if (state.braceDepth === 0) {
        state.inEntry = false;
        state.inField = false;
        state.inValue = false;
        state.valueType = null;
        state.inMath = false;
        state.mathDelimiter = null;
      }
      return 'brace';
    }

    // Quotes
    if (stream.eat('"')) {
      if (state.inValue) {
        if (state.valueType === 'quoted') {
          state.valueType = null;
          state.inValue = false;
          state.inMath = false;
          state.mathDelimiter = null;
        } else {
          state.valueType = 'quoted';
        }
      }
      return 'string';
    }

    // String values
    if (state.inValue && state.valueType === 'quoted') {
      if (stream.match(/^[^"\\$]+/)) {
        return 'string';
      }
      if (stream.eat('\\')) {
        stream.next();
        return 'string';
      }
    }

    // Braced values
    if (state.inValue && state.valueType === 'braced') {
      if (stream.match(/^[^{}\\$]+/)) {
        return 'string';
      }
      if (stream.eat('\\')) {
        stream.next();
        return 'string';
      }
    }

    // Numbers
    if (state.inValue && stream.match(/^\d+/)) {
      return 'number';
    }

    // Variable references
    if (state.inValue && stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)) {
      return 'variableName';
    }

    stream.next();
    return null;
  }
};

export const parser = StreamLanguage.define(bibtexLanguage);

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