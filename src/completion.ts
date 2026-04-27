// src/completion.ts
import { Completion, CompletionContext, CompletionResult, snippetCompletion } from '@codemirror/autocomplete';
import { fieldRequirements, validFieldNames } from './fields';

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
export const fieldNames: readonly string[] = Array.from(validFieldNames);

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
  snippetCompletion(
    '@article{#{key},\n\tauthor = {#{author}},\n\ttitle = {#{title}},\n\tjournaltitle = {#{journal}},\n\tdate = {#{year}},\n\tvolume = {#{volume}},\n\tnumber = {#{number}},\n\tpages = {#{pages}}\n}',
    { label: '@article', type: 'keyword', detail: 'Journal article' }
  ),
  snippetCompletion(
    '@book{#{key},\n\tauthor = {#{author}},\n\ttitle = {#{title}},\n\tpublisher = {#{publisher}},\n\tdate = {#{year}},\n\tlocation = {#{location}}\n}',
    { label: '@book', type: 'keyword', detail: 'Book' }
  ),
  snippetCompletion(
    '@inproceedings{#{key},\n\tauthor = {#{author}},\n\ttitle = {#{title}},\n\tbooktitle = {#{booktitle}},\n\tdate = {#{year}},\n\tpages = {#{pages}}\n}',
    { label: '@inproceedings', type: 'keyword', detail: 'Conference paper' }
  ),
  snippetCompletion(
    '@incollection{#{key},\n\tauthor = {#{author}},\n\ttitle = {#{title}},\n\tbooktitle = {#{booktitle}},\n\teditor = {#{editor}},\n\tpublisher = {#{publisher}},\n\tdate = {#{year}},\n\tpages = {#{pages}}\n}',
    { label: '@incollection', type: 'keyword', detail: 'Book chapter' }
  ),
  snippetCompletion(
    '@thesis{#{key},\n\tauthor = {#{author}},\n\ttitle = {#{title}},\n\ttype = {#{phdthesis}},\n\tinstitution = {#{institution}},\n\tdate = {#{year}}\n}',
    { label: '@thesis', type: 'keyword', detail: 'Thesis (biblatex)' }
  ),
  snippetCompletion(
    '@online{#{key},\n\tauthor = {#{author}},\n\ttitle = {#{title}},\n\turl = {#{url}},\n\turldate = {#{urldate}},\n\tdate = {#{year}}\n}',
    { label: '@online', type: 'keyword', detail: 'Online resource' }
  ),
  snippetCompletion(
    '@misc{#{key},\n\ttitle = {#{title}},\n\tauthor = {#{author}},\n\tdate = {#{year}},\n\tnote = {#{note}}\n}',
    { label: '@misc', type: 'keyword', detail: 'Miscellaneous' }
  ),
  snippetCompletion(
    '@manual{#{key},\n\ttitle = {#{title}},\n\tauthor = {#{author}},\n\torganization = {#{organization}},\n\tdate = {#{year}}\n}',
    { label: '@manual', type: 'keyword', detail: 'Manual' }
  ),
  snippetCompletion(
    '@techreport{#{key},\n\tauthor = {#{author}},\n\ttitle = {#{title}},\n\tinstitution = {#{institution}},\n\tdate = {#{year}},\n\tnumber = {#{number}}\n}',
    { label: '@techreport', type: 'keyword', detail: 'Technical report' }
  )
];

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