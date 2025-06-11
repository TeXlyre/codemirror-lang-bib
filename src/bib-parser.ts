// src/bib-parser.ts
import { parser } from './bibtex-parser';
import { LanguageSupport, indentOnInput, bracketMatching } from '@codemirror/language';
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

export const bibtexLanguage = parser;

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

  const extensions: Extension[] = [
    indentOnInput(),
    bibtexBracketMatching
  ];

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