// src/linter.ts
import { Diagnostic } from '@codemirror/lint';
import { EditorView } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { SyntaxNode } from '@lezer/common';

interface FieldRequirement {
  required: string[];
  optional: string[];
}

// Field requirements by entry type
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

// Valid entry types
const validEntryTypes = new Set([
  'article', 'book', 'booklet', 'conference', 'inbook', 'incollection',
  'inproceedings', 'manual', 'mastersthesis', 'misc', 'online', 'phdthesis',
  'proceedings', 'techreport', 'unpublished', 'webpage'
]);

// Common field names that should be recognized
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
    const entryKeys = new Map<string, number>(); // key -> first occurrence position

    // Parse BibTeX entries using a simple regex approach
    // In a full implementation, you'd use the actual parser
    const entries = parseBibtexEntries(doc.toString());

    entries.forEach(entry => {
      const entryStart = entry.start;
      const entryEnd = entry.end;

      // Check entry type validity
      if (opts.checkEntryTypes && !validEntryTypes.has(entry.type.toLowerCase())) {
        diagnostics.push({
          from: entryStart,
          to: entryStart + entry.type.length + 1, // +1 for @
          severity: 'warning',
          message: `Unknown entry type: @${entry.type}`,
          source: 'BibTeX'
        });
      }

      // Check for duplicate keys
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

      // Check required and unknown fields
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

      // Check field syntax
      if (opts.checkFieldSyntax) {
        entry.fields.forEach(field => {
          // Check for unmatched braces in field values
          if (field.value) {
            const braceCount = (field.value.match(/\{/g) || []).length -
                              (field.value.match(/\}/g) || []).length;
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

          // Check for empty field values
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

// Simple BibTeX parser for linting purposes
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

    // Find the end of this entry by matching braces
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

    // Parse fields within this entry
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
  const fieldRegex = /([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([^,}]+)/g;
  let match;

  while ((match = fieldRegex.exec(content)) !== null) {
    const fieldName = match[1];
    const fieldValue = match[2].trim();

    // Remove quotes or braces from value for content checking
    let cleanValue = fieldValue;
    if ((cleanValue.startsWith('"') && cleanValue.endsWith('"')) ||
        (cleanValue.startsWith('{') && cleanValue.endsWith('}'))) {
      cleanValue = cleanValue.slice(1, -1);
    }

    fields.push({
      name: fieldName,
      value: cleanValue,
      nameStart: baseOffset + match.index,
      nameEnd: baseOffset + match.index + fieldName.length,
      valueStart: baseOffset + match.index + match[0].indexOf(fieldValue),
      valueEnd: baseOffset + match.index + match[0].indexOf(fieldValue) + fieldValue.length
    });
  }

  return fields;
}