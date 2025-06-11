// src/index.ts
export {
  bibtex,
  bibtexLanguage,
  bibtexBracketMatching
} from './bib-parser';

// Import and re-export from completion
export { bibtexCompletionSource, snippets, entryTypes, fieldNames } from './completion';

// Export the linter
export { bibtexLinter } from './linter';

// Export the tooltips
export { bibtexHoverTooltip } from './tooltips';

// Export parser types and utilities
export {
  parser,
  isEntryType,
  getFieldType,
  RootNode,
  TextNode,
  BlockNode,
  CommentNode,
  PreambleNode,
  StringNode,
  EntryNode,
  FieldNode,
  ConcatNode,
  LiteralNode,
  BracedNode,
  QuotedNode,
  Node
} from './bibtex-parser';

// Export autocompletion components
export { autocompletion, completionKeymap } from '@codemirror/autocomplete';