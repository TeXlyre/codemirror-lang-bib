// src/bib-parser.ts
import { parser } from './bibtex-parser';
import { LRLanguage, LanguageSupport, indentNodeProp, foldNodeProp,
         foldInside, bracketMatching } from '@codemirror/language';
import { styleTags, tags as t } from '@lezer/highlight';
import { Extension } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { linter } from '@codemirror/lint';
import { autocompletion, completionKeymap, closeBrackets } from '@codemirror/autocomplete';

import { bibtexCompletionSource } from './completion';
import { bibtexLinter } from './linter';
import { bibtexHoverTooltip } from './tooltips';

export const bibtexBracketMatching = bracketMatching({
  brackets: "()[]{}"
});

export const bibtexLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Entry: context => context.baseIndent + context.unit,
        Field: context => context.baseIndent + context.unit,
        ConcatNode: context => context.baseIndent + context.unit,
        BracedNode: context => context.baseIndent + context.unit,
        QuotedNode: context => context.baseIndent + context.unit
      }),
      foldNodeProp.add({
        Entry: foldInside,
        BracedNode: foldInside,
        QuotedNode: foldInside
      }),
      styleTags({
        // Entry types
        '@article': t.definitionKeyword,
        '@book': t.definitionKeyword,
        '@incollection': t.definitionKeyword,
        '@inproceedings': t.definitionKeyword,
        '@conference': t.definitionKeyword,
        '@misc': t.definitionKeyword,
        '@manual': t.definitionKeyword,
        '@mastersthesis': t.definitionKeyword,
        '@phdthesis': t.definitionKeyword,
        '@techreport': t.definitionKeyword,
        '@unpublished': t.definitionKeyword,
        '@online': t.definitionKeyword,
        '@webpage': t.definitionKeyword,
        '@booklet': t.definitionKeyword,
        '@proceedings': t.definitionKeyword,

        // Special entries
        '@string': t.keyword,
        '@preamble': t.keyword,
        '@comment': t.comment,

        // Entry key (citation key)
        'EntryKey': t.atom,

        // Field names
        'FieldName': t.propertyName,

        // Field values
        'StringValue': t.string,
        'NumberValue': t.number,
        'BracedValue': t.string,
        'QuotedValue': t.string,

        // Delimiters
        '{': t.brace,
        '}': t.brace,
        '"': t.quote,
        '=': t.operator,
        ',': t.separator,
        '#': t.operator,

        // Comments
        Comment: t.comment,

        // Variable references
        'VariableRef': t.variableName,

        // Special characters
        'Whitespace': t.content,
        'Normal': t.content
      })
    ]
  }),
  languageData: {
    commentTokens: { line: "%" },
    closeBrackets: { brackets: ["(", "[", "{", "'", '"'] },
    wordChars: "-_"
  }
});

export function bibtex(config: {
  enableLinting?: boolean,
  enableTooltips?: boolean,
  enableAutocomplete?: boolean,
  autoCloseBrackets?: boolean
} = {}): LanguageSupport {
  const options = {
    enableLinting: true,
    enableTooltips: true,
    enableAutocomplete: true,
    autoCloseBrackets: true,
    ...config
  };

  const extensions: Extension[] = [];

  // Add autocomplete extension
  if (options.enableAutocomplete) {
    extensions.push(
      bibtexLanguage.data.of({
        autocomplete: bibtexCompletionSource
      }),
      autocompletion({
        override: [bibtexCompletionSource],
        defaultKeymap: true,
        activateOnTyping: true,
        icons: true
      }),
      keymap.of(completionKeymap)
    );
  }

  extensions.push(bibtexBracketMatching);

  if (options.autoCloseBrackets) {
    extensions.push(closeBrackets());
  }

  if (options.enableLinting) {
    extensions.push(linter(bibtexLinter()));
  }

  if (options.enableTooltips) {
    extensions.push(bibtexHoverTooltip);
  }

  return new LanguageSupport(bibtexLanguage, extensions);
}