// src/linter.ts
import { Diagnostic } from '@codemirror/lint';
import { EditorView } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { SyntaxNode } from '@lezer/common';

interface FieldRequirement {
  required: string[];
  optional: string[];
}

const fieldRequirements: Record<string, FieldRequirement> = {
  'article': {
    required: ['author', 'title', 'journal', 'year'],
    optional: ['volume', 'number', 'pages', 'month', 'note', 'doi', 'url', 'editor']
  },
  'book': {
    required: ['author', 'title', 'publisher', 'year'],
    optional: ['volume', 'series', 'address', 'edition', 'month', 'note', 'isbn', 'editor']
  },
  'inproceedings': {
    required: ['author', 'title', 'booktitle', 'year'],
    optional: ['editor', 'pages', 'organization', 'publisher', 'address', 'month', 'note']
  },
  'incollection': {
    required: ['author', 'title', 'booktitle', 'publisher', 'year'],
    optional: ['editor', 'pages', 'chapter', 'address', 'month', 'note']
  },
  'conference': {
    required: ['author', 'title', 'booktitle', 'year'],
    optional: ['editor', 'pages', 'organization', 'publisher', 'address', 'month', 'note']
  },
  'phdthesis': {
    required: ['author', 'title', 'school', 'year'],
    optional: ['address', 'month', 'note', 'type']
  },
  'mastersthesis': {
    required: ['author', 'title', 'school', 'year'],
    optional: ['address', 'month', 'note', 'type']
  },
  'techreport': {
    required: ['author', 'title', 'institution', 'year'],
    optional: ['type', 'number', 'address', 'month', 'note']
  },
  'manual': {
    required: ['title'],
    optional: ['author', 'organization', 'address', 'edition', 'month', 'year', 'note']
  },
  'misc': {
    required: ['title'],
    optional: ['author', 'howpublished', 'month', 'year', 'note', 'url']
  },
  'online': {
    required: ['title', 'url'],
    optional: ['author', 'year', 'month', 'urldate', 'note']
  },
  'unpublished': {
    required: ['author', 'title', 'note'],
    optional: ['month', 'year']
  },
  'booklet': {
    required: ['title'],
    optional: ['author', 'howpublished', 'address', 'month', 'year', 'note']
  },
  'proceedings': {
    required: ['title', 'year'],
    optional: ['editor', 'publisher', 'organization', 'address', 'month', 'note']
  }
};

const validEntryTypes = new Set([
  'article', 'book', 'booklet', 'conference', 'inbook', 'incollection',
  'inproceedings', 'manual', 'mastersthesis', 'misc', 'online', 'phdthesis',
  'proceedings', 'techreport', 'unpublished', 'webpage'
]);

const validFieldNames = new Set([
  'author', 'title', 'journal', 'year', 'publisher', 'booktitle', 'editor',
  'pages', 'volume', 'number', 'series', 'edition', 'month', 'note', 'key',
  'address', 'annote', 'chapter', 'crossref', 'doi', 'eprint', 'howpublished',
  'institution', 'isbn', 'issn', 'keywords', 'language', 'organization',
  'school', 'type', 'url', 'urldate', 'abstract', 'archiveprefix',
  'primaryclass', 'eid', 'numpages'
]);

export function bibtexLinter(options: {
  checkRequiredFields?: boolean,
  checkUnknownFields?: boolean,
  checkDuplicateKeys?: boolean,
  checkFieldSyntax?: boolean,
  checkEntryTypes?: boolean
} = {}) {
  const defaultOptions = {
    checkRequiredFields: true,
    checkUnknownFields: true,
    checkDuplicateKeys: true,
    checkFieldSyntax: true,
    checkEntryTypes: true
  };

  const opts = { ...defaultOptions, ...options };

  return (view: EditorView): Diagnostic[] => {
    const diagnostics: Diagnostic[] = [];
    const tree = syntaxTree(view.state);
    const doc = view.state.doc;
    const entryKeys = new Map<string, number>();

    const entries = parseBibtexEntries(doc.toString());

    entries.forEach(entry => {
      const entryStart = entry.start;
      const entryEnd = entry.end;

      if (opts.checkEntryTypes && !validEntryTypes.has(entry.type.toLowerCase())) {
        diagnostics.push({
          from: entryStart,
          to: entryStart + entry.type.length + 1,
          severity: 'warning',
          message: `Unknown entry type: @${entry.type}`,
          source: 'BibTeX'
        });
      }

      if (opts.checkDuplicateKeys && entry.key) {
        if (entryKeys.has(entry.key)) {
          diagnostics.push({
            from: entry.keyStart || entryStart,
            to: entry.keyEnd || entryStart + entry.key.length,
            severity: 'error',
            message: `Duplicate entry key: ${entry.key}`,
            source: 'BibTeX'
          });
        } else {
          entryKeys.set(entry.key, entry.keyStart || entryStart);
        }
      }

      if (opts.checkRequiredFields || opts.checkUnknownFields) {
        const requirements = fieldRequirements[entry.type.toLowerCase()];

        if (requirements && opts.checkRequiredFields) {
          const presentFields = new Set(entry.fields.map(f => f.name.toLowerCase()));
          const missingRequired = requirements.required.filter(req => !presentFields.has(req));

          if (missingRequired.length > 0) {
            diagnostics.push({
              from: entryStart,
              to: entryEnd,
              severity: 'error',
              message: `Missing required fields for @${entry.type}: ${missingRequired.join(', ')}`,
              source: 'BibTeX'
            });
          }
        }

        if (opts.checkUnknownFields) {
          entry.fields.forEach(field => {
            if (!validFieldNames.has(field.name.toLowerCase())) {
              diagnostics.push({
                from: field.nameStart,
                to: field.nameEnd,
                severity: 'warning',
                message: `Unknown field: ${field.name}`,
                source: 'BibTeX'
              });
            }
          });
        }
      }

      if (opts.checkFieldSyntax) {
        entry.fields.forEach(field => {
          if (field.value) {
            const braceCount = countUnmatchedBraces(field.value);
            if (braceCount !== 0) {
              diagnostics.push({
                from: field.valueStart,
                to: field.valueEnd,
                severity: 'error',
                message: `Unmatched braces in field value for '${field.name}'`,
                source: 'BibTeX'
              });
            }
          }

          if (!field.value || field.value.trim() === '') {
            diagnostics.push({
              from: field.valueStart,
              to: field.valueEnd,
              severity: 'warning',
              message: `Empty value for field '${field.name}'`,
              source: 'BibTeX'
            });
          }
        });
      }
    });

    return diagnostics;
  };
}

function countUnmatchedBraces(value: string): number {
  let count = 0;
  let inMath = false;
  let mathDelimiter = '';
  let i = 0;

  while (i < value.length) {
    const char = value[i];
    const nextChar = value[i + 1];

    if (!inMath) {
      if (char === '$' && nextChar === '$') {
        inMath = true;
        mathDelimiter = '$$';
        i += 2;
        continue;
      } else if (char === '$') {
        inMath = true;
        mathDelimiter = '$';
        i++;
        continue;
      }
    } else {
      if (mathDelimiter === '$$' && char === '$' && nextChar === '$') {
        inMath = false;
        mathDelimiter = '';
        i += 2;
        continue;
      } else if (mathDelimiter === '$' && char === '$') {
        inMath = false;
        mathDelimiter = '';
        i++;
        continue;
      }
    }

    if (char === '\\') {
      i += 2;
      continue;
    }

    if (!inMath) {
      if (char === '{') count++;
      else if (char === '}') count--;
    }

    i++;
  }

  return count;
}

interface BibtexEntry {
  type: string;
  key: string;
  keyStart: number;
  keyEnd: number;
  start: number;
  end: number;
  fields: BibtexField[];
}

interface BibtexField {
  name: string;
  value: string;
  nameStart: number;
  nameEnd: number;
  valueStart: number;
  valueEnd: number;
}

function parseBibtexEntries(text: string): BibtexEntry[] {
  const entries: BibtexEntry[] = [];
  const entryRegex = /@([a-zA-Z]+)\s*\{\s*([^,\s}]+)?/g;
  let match;

  while ((match = entryRegex.exec(text)) !== null) {
    const entryType = match[1];
    const entryKey = match[2] || '';
    const entryStart = match.index;

    let braceCount = 1;
    let pos = match.index + match[0].length;
    let entryEnd = text.length;

    while (pos < text.length && braceCount > 0) {
      if (text[pos] === '{') braceCount++;
      else if (text[pos] === '}') braceCount--;
      if (braceCount === 0) {
        entryEnd = pos + 1;
        break;
      }
      pos++;
    }

    const entryContent = text.slice(match.index + match[0].length, entryEnd - 1);
    const fields = parseFields(entryContent, match.index + match[0].length);

    entries.push({
      type: entryType,
      key: entryKey,
      keyStart: match.index + match[0].indexOf(entryKey),
      keyEnd: match.index + match[0].indexOf(entryKey) + entryKey.length,
      start: entryStart,
      end: entryEnd,
      fields
    });
  }

  return entries;
}

function parseFields(content: string, baseOffset: number): BibtexField[] {
  const fields: BibtexField[] = [];
  let pos = 0;

  while (pos < content.length) {
    pos = skipWhitespace(content, pos);
    if (pos >= content.length) break;

    if (content[pos] === ',') {
      pos++;
      continue;
    }

    const fieldNameMatch = content.slice(pos).match(/^([a-zA-Z_][a-zA-Z0-9_]*)/);
    if (!fieldNameMatch) {
      pos++;
      continue;
    }

    const fieldName = fieldNameMatch[1];
    const nameStart = baseOffset + pos;
    const nameEnd = nameStart + fieldName.length;
    pos += fieldName.length;

    pos = skipWhitespace(content, pos);
    if (pos >= content.length || content[pos] !== '=') {
      continue;
    }
    pos++; // skip '='

    pos = skipWhitespace(content, pos);
    if (pos >= content.length) break;

    const valueResult = parseFieldValue(content, pos);
    if (valueResult) {
      fields.push({
        name: fieldName,
        value: valueResult.value,
        nameStart,
        nameEnd,
        valueStart: baseOffset + pos,
        valueEnd: baseOffset + valueResult.endPos
      });
      pos = valueResult.endPos;
    } else {
      pos++;
    }
  }

  return fields;
}

function parseFieldValue(content: string, startPos: number): { value: string; endPos: number } | null {
  let pos = startPos;

  if (pos >= content.length) return null;

  const char = content[pos];

  if (char === '{') {
    let braceCount = 1;
    let valueStart = pos + 1;
    pos++;

    while (pos < content.length && braceCount > 0) {
      if (content[pos] === '\\') {
        pos += 2;
        continue;
      }
      if (content[pos] === '{') braceCount++;
      else if (content[pos] === '}') braceCount--;
      pos++;
    }

    if (braceCount === 0) {
      return {
        value: content.slice(valueStart, pos - 1),
        endPos: pos
      };
    }
  } else if (char === '"') {
    let valueStart = pos + 1;
    pos++;

    while (pos < content.length) {
      if (content[pos] === '\\') {
        pos += 2;
        continue;
      }
      if (content[pos] === '"') {
        pos++;
        return {
          value: content.slice(valueStart, pos - 1),
          endPos: pos
        };
      }
      pos++;
    }
  } else {
    const valueMatch = content.slice(pos).match(/^([a-zA-Z_][a-zA-Z0-9_]*|\d+)/);
    if (valueMatch) {
      return {
        value: valueMatch[1],
        endPos: pos + valueMatch[1].length
      };
    }
  }

  return null;
}

function skipWhitespace(content: string, pos: number): number {
  while (pos < content.length && /\s/.test(content[pos])) {
    pos++;
  }
  return pos;
}