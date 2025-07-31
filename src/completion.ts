// src/completion.ts
import { Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';

// BibTeX entry types for autocompletion
export const entryTypes: readonly string[] = [
  'article',
  'book',
  'booklet',
  'conference',
  'inbook',
  'incollection',
  'inproceedings',
  'manual',
  'mastersthesis',
  'misc',
  'online',
  'phdthesis',
  'proceedings',
  'techreport',
  'unpublished',
  'webpage'
];

// Common BibTeX field names for autocompletion
export const fieldNames: readonly string[] = [
  // Required/common fields
  'author',
  'title',
  'journal',
  'year',
  'publisher',
  'booktitle',
  'editor',
  'pages',
  'volume',
  'number',
  'series',
  'edition',
  'month',
  'note',
  'key',

  // Optional fields
  'address',
  'annote',
  'chapter',
  'crossref',
  'doi',
  'eprint',
  'howpublished',
  'institution',
  'isbn',
  'issn',
  'keywords',
  'language',
  'organization',
  'school',
  'type',
  'url',
  'urldate',
  'abstract',

  // Modern fields
  'archiveprefix',
  'primaryclass',
  'eid',
  'numpages'
];

// Month abbreviations commonly used in BibTeX
export const monthAbbreviations: readonly string[] = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
];

// Common journal abbreviations
export const journalAbbreviations: readonly string[] = [
  'Nature',
  'Science',
  'Cell',
  'PNAS',
  'J. Am. Chem. Soc.',
  'Phys. Rev. Lett.',
  'IEEE Trans.',
  'ACM Trans.',
  'Commun. ACM'
];

// Define and export snippets for BibTeX
export const snippets: readonly Completion[] = [
  {
    label: "@article",
    type: "keyword",
    detail: "Journal article",
    info: "Create a journal article entry",
    apply: "@article{${0:key},\n\tauthor = {${1:author}},\n\ttitle = {${2:title}},\n\tjournal = {${3:journal}},\n\tyear = {${4:year}},\n\tvolume = {${5:volume}},\n\tnumber = {${6:number}},\n\tpages = {${7:pages}}\n}",
  },
  {
    label: "@book",
    type: "keyword",
    detail: "Book",
    info: "Create a book entry",
    apply: "@book{${0:key},\n\tauthor = {${1:author}},\n\ttitle = {${2:title}},\n\tpublisher = {${3:publisher}},\n\tyear = {${4:year}},\n\taddress = {${5:address}}\n}",
  },
  {
    label: "@booklet",
    type: "keyword",
    detail: "Printed work without publisher",
    info: "Create a booklet entry",
    apply: "@booklet{${0:key},\n\ttitle = {${1:title}},\n\tauthor = {${2:author}},\n\thowpublished = {${3:howpublished}},\n\tyear = {${4:year}}\n}",
  },
  {
    label: "@conference",
    type: "keyword",
    detail: "Conference paper (alias for inproceedings)",
    info: "Create a conference paper entry",
    apply: "@conference{${0:key},\n\tauthor = {${1:author}},\n\ttitle = {${2:title}},\n\tbooktitle = {${3:booktitle}},\n\tyear = {${4:year}},\n\tpages = {${5:pages}},\n\torganization = {${6:organization}}\n}",
  },
  {
    label: "@inbook",
    type: "keyword",
    detail: "Part of a book with its own title",
    info: "Create an inbook entry",
    apply: "@inbook{${0:key},\n\tauthor = {${1:author}},\n\ttitle = {${2:title}},\n\tbooktitle = {${3:booktitle}},\n\tpublisher = {${4:publisher}},\n\tyear = {${5:year}},\n\tpages = {${6:pages}}\n}",
  },
  {
    label: "@incollection",
    type: "keyword",
    detail: "Part of a book having its own title",
    info: "Create an incollection entry",
    apply: "@incollection{${0:key},\n\tauthor = {${1:author}},\n\ttitle = {${2:title}},\n\tbooktitle = {${3:booktitle}},\n\tpublisher = {${4:publisher}},\n\tyear = {${5:year}},\n\tpages = {${6:pages}}\n}",
  },
  {
    label: "@inproceedings",
    type: "keyword",
    detail: "Conference paper",
    info: "Create a conference proceedings entry",
    apply: "@inproceedings{${0:key},\n\tauthor = {${1:author}},\n\ttitle = {${2:title}},\n\tbooktitle = {${3:booktitle}},\n\tyear = {${4:year}},\n\tpages = {${5:pages}},\n\torganization = {${6:organization}}\n}",
  },
  {
    label: "@manual",
    type: "keyword",
    detail: "Technical documentation",
    info: "Create a manual entry",
    apply: "@manual{${0:key},\n\ttitle = {${1:title}},\n\tauthor = {${2:author}},\n\torganization = {${3:organization}},\n\tyear = {${4:year}}\n}",
  },
  {
    label: "@mastersthesis",
    type: "keyword",
    detail: "Master's thesis",
    info: "Create a master's thesis entry",
    apply: "@mastersthesis{${0:key},\n\tauthor = {${1:author}},\n\ttitle = {${2:title}},\n\tschool = {${3:school}},\n\tyear = {${4:year}}\n}",
  },
  {
    label: "@misc",
    type: "keyword",
    detail: "Miscellaneous",
    info: "Create a miscellaneous entry",
    apply: "@misc{${0:key},\n\ttitle = {${1:title}},\n\tauthor = {${2:author}},\n\tyear = {${3:year}},\n\tnote = {${4:note}}\n}",
  },
  {
    label: "@online",
    type: "keyword",
    detail: "Online resource",
    info: "Create an online resource entry",
    apply: "@online{${0:key},\n\tauthor = {${1:author}},\n\ttitle = {${2:title}},\n\turl = {${3:url}},\n\turldate = {${4:urldate}},\n\tyear = {${5:year}}\n}",
  },
  {
    label: "@phdthesis",
    type: "keyword",
    detail: "PhD dissertation",
    info: "Create a PhD thesis entry",
    apply: "@phdthesis{${0:key},\n\tauthor = {${1:author}},\n\ttitle = {${2:title}},\n\tschool = {${3:school}},\n\tyear = {${4:year}}\n}",
  },
  {
    label: "@proceedings",
    type: "keyword",
    detail: "Conference proceedings",
    info: "Create a proceedings entry",
    apply: "@proceedings{${0:key},\n\ttitle = {${1:title}},\n\tyear = {${2:year}},\n\teditor = {${3:editor}},\n\torganization = {${4:organization}}\n}",
  },
  {
    label: "@techreport",
    type: "keyword",
    detail: "Technical report",
    info: "Create a technical report entry",
    apply: "@techreport{${0:key},\n\tauthor = {${1:author}},\n\ttitle = {${2:title}},\n\tinstitution = {${3:institution}},\n\tyear = {${4:year}},\n\tnumber = {${5:number}}\n}",
  },
  {
    label: "@unpublished",
    type: "keyword",
    detail: "Unpublished work",
    info: "Create an unpublished entry",
    apply: "@unpublished{${0:key},\n\tauthor = {${1:author}},\n\ttitle = {${2:title}},\n\tnote = {${3:note}},\n\tyear = {${4:year}}\n}",
  },
  {
    label: "@webpage",
    type: "keyword",
    detail: "Web page (alias for online)",
    info: "Create a webpage entry",
    apply: "@webpage{${0:key},\n\tauthor = {${1:author}},\n\ttitle = {${2:title}},\n\turl = {${3:url}},\n\turldate = {${4:urldate}},\n\tyear = {${5:year}}\n}",
  }
];

// Field requirements by entry type
const fieldRequirements: Record<string, { required: string[], optional: string[] }> = {
  'article': {
    required: ['author', 'title', 'journal', 'year'],
    optional: ['volume', 'number', 'pages', 'month', 'note', 'doi', 'url']
  },
  'book': {
    required: ['author', 'title', 'publisher', 'year'],
    optional: ['volume', 'series', 'address', 'edition', 'month', 'note', 'isbn']
  },
  'inproceedings': {
    required: ['author', 'title', 'booktitle', 'year'],
    optional: ['editor', 'pages', 'organization', 'publisher', 'address', 'month', 'note']
  },
  'incollection': {
    required: ['author', 'title', 'booktitle', 'publisher', 'year'],
    optional: ['editor', 'pages', 'chapter', 'address', 'month', 'note']
  },
  'phdthesis': {
    required: ['author', 'title', 'school', 'year'],
    optional: ['address', 'month', 'note']
  },
  'mastersthesis': {
    required: ['author', 'title', 'school', 'year'],
    optional: ['address', 'month', 'note']
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
  }
};

// Checks if we're inside an entry definition
function isInEntry(context: CompletionContext): boolean {
  const textBefore = context.state.sliceDoc(
    Math.max(0, context.pos - 200),
    context.pos
  );

  const lastAt = textBefore.lastIndexOf('@');
  const lastBrace = textBefore.lastIndexOf('{');
  const lastCloseBrace = textBefore.lastIndexOf('}');

  return lastAt !== -1 && lastBrace > lastAt && lastCloseBrace < lastBrace;
}

// Checks if we're typing an entry type after @
function isTypingEntryType(context: CompletionContext): boolean {
  const textBefore = context.state.sliceDoc(
    Math.max(0, context.pos - 20),
    context.pos
  );
  return /@[a-zA-Z]*$/.test(textBefore);
}

// Checks if completion is at the start of a line for new entry creation
function isNewEntryContext(context: CompletionContext): boolean {
  const textBefore = context.state.sliceDoc(
    Math.max(0, context.pos - 50),
    context.pos
  );
  return /(?:^|\n)\s*@[a-zA-Z]*$/.test(textBefore);
}

// Checks if we're typing a field name
function isTypingFieldName(context: CompletionContext): boolean {
  const textBefore = context.state.sliceDoc(
    Math.max(0, context.pos - 50),
    context.pos
  );

  // Look for comma or opening brace followed by optional whitespace and identifier
  return /[,{]\s*[a-zA-Z]*$/.test(textBefore) && isInEntry(context);
}

// Checks if we're typing a field value
function isTypingFieldValue(context: CompletionContext): boolean {
  const textBefore = context.state.sliceDoc(
    Math.max(0, context.pos - 30),
    context.pos
  );

  return /[a-zA-Z_]+\s*=\s*["{]?[^"}]*$/.test(textBefore) && isInEntry(context);
}

// Gets the current entry type for context-aware field suggestions
function getCurrentEntryType(context: CompletionContext): string | null {
  const textBefore = context.state.sliceDoc(0, context.pos);
  const match = textBefore.match(/@([a-zA-Z]+)\s*{[^}]*$/);
  return match ? match[1].toLowerCase() : null;
}

// Main completion function
export function bibtexCompletionSource(context: CompletionContext): CompletionResult | null {
  // Check for explicit completion request
  if (!context.explicit) {
    const before = context.matchBefore(/@[a-zA-Z]*$|[a-zA-Z_]*$|[a-zA-Z_]+\s*=\s*["{]?[^"}]*$/);
    if (!before || before.from === before.to) {
      return null;
    }
  }

  // Entry type completion
  if (isTypingEntryType(context)) {
    const entryMatch = context.matchBefore(/@([a-zA-Z]*)$/);
    if (entryMatch) {
      const isNewEntry = isNewEntryContext(context);

      let options: Completion[];

      if (isNewEntry) {
        // For new entries, provide both simple completions and full snippets
        const simpleOptions = entryTypes.map(type => ({
          label: '@' + type,
          type: "keyword",
          apply: `@${type}`,
          boost: 1
        }));

        // Combine simple completions with snippets (snippets get lower boost)
        options = [...simpleOptions, ...snippets.map(snippet => ({ ...snippet, boost: 1 }))];
      } else {
        // For partial completion, only provide simple type completion
        options = entryTypes.map(type => ({
          label: '@' + type,
          type: "keyword",
          apply: `@${type}`,
          boost: 0.5
        }));
      }

      return {
        from: entryMatch.from,
        options,
        validFor: /^@?[a-zA-Z]*$/
      };
    }
  }

  // Field name completion
  if (isTypingFieldName(context)) {
    const fieldMatch = context.matchBefore(/[,{]\s*([a-zA-Z_]*)$/);
    if (fieldMatch) {
      const entryType = getCurrentEntryType(context);
      let availableFields = [...fieldNames];

      // Extract the field name being typed from the full match
      const fullMatchResult = fieldMatch.text.match(/[,{]\s*([a-zA-Z_]*)$/);
      const fieldNamePart = fullMatchResult ? fullMatchResult[1] : '';

      // Add context-aware suggestions based on entry type
      if (entryType && fieldRequirements[entryType]) {
        const { required, optional } = fieldRequirements[entryType];
        // Boost required fields for this entry type
        const options = availableFields.map(field => ({
          label: field,
          type: "property",
          apply: `${field} = {$\{0:value}}`,
          boost: required.includes(field) ? 2 : (optional.includes(field) ? 1 : 0.5)
        }));

        return {
          from: fieldMatch.from + fieldMatch.text.lastIndexOf(fieldNamePart),
          options,
          validFor: /^[a-zA-Z_]*$/
        };
      }

      const options = availableFields.map(field => ({
        label: field,
        type: "property",
        apply: `${field} = {$\{0:value}}`,
        boost: 1
      }));

      return {
        from: fieldMatch.from + fieldMatch.text.lastIndexOf(fieldNamePart),
        options,
        validFor: /^[a-zA-Z_]*$/
      };
    }
  }

  // Field value completion (for specific fields)
  if (isTypingFieldValue(context)) {
    const valueMatch = context.matchBefore(/([a-zA-Z_]+)\s*=\s*["{]?([^"}]*)$/);
    if (valueMatch) {
      // Extract field name and value from the full match
      const fullMatchResult = valueMatch.text.match(/([a-zA-Z_]+)\s*=\s*["{]?([^"}]*)$/);
      if (!fullMatchResult) return null;

      const fieldName = fullMatchResult[1].toLowerCase();
      const valuePart = fullMatchResult[2];

      // Month field completion
      if (fieldName === 'month') {
        const options = monthAbbreviations.map(month => ({
          label: month,
          type: "constant",
          apply: month,
          boost: 1
        }));

        return {
          from: valueMatch.from + valueMatch.text.lastIndexOf(valuePart),
          options,
          validFor: /^[a-zA-Z]*$/
        };
      }

      // Journal field completion
      if (fieldName === 'journal') {
        const options = journalAbbreviations.map(journal => ({
          label: journal,
          type: "constant",
          apply: journal,
          boost: 1
        }));

        return {
          from: valueMatch.from + valueMatch.text.lastIndexOf(valuePart),
          options,
          validFor: /^[^"}]*$/
        };
      }
    }
  }

  return null;
}