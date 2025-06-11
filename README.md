# CodeMirror 6 BibTeX Language Support

This package provides BibTeX language support for the [CodeMirror 6](https://codemirror.net/6/) code editor, designed to work seamlessly with academic writing workflows and bibliography management.

## Features

- BibTeX syntax highlighting with distinct colors for entry types, field names, and values
- Auto-indentation for entries and field values
- Code folding for entries and nested structures  
- Bracket matching for braces and quotes
- Autocompletion for:
  - Entry types (@article, @book, @inproceedings, etc.)
  - Field names (author, title, journal, etc.)
  - Common values (month abbreviations, journal names)
- Snippets for common BibTeX entry structures
- Hover tooltips with:
  - Entry type descriptions and requirements
  - Field descriptions and examples
  - Required vs. optional field information
- BibTeX-specific linting:
  - Missing required fields
  - Unknown field names
  - Duplicate citation keys
  - Syntax validation
  - Unmatched braces

## Installation

```bash
npm install codemirror-lang-bib
```

## Usage

```javascript
import { EditorState, EditorView } from '@codemirror/basic-setup';
import { bibtex } from 'codemirror-lang-bib';

let editor = new EditorView({
  state: EditorState.create({
    doc: `@article{sample2023,
  author = {John Doe and Jane Smith},
  title = {A Sample Article},
  journal = {Journal of Examples},
  year = {2023},
  volume = {42},
  pages = {123--145}
}`,
    extensions: [
      // ... other extensions
      bibtex()
    ]
  }),
  parent: document.querySelector('#editor')
});
```

### Configuration Options

You can configure the BibTeX language support by passing options:

```javascript
import { bibtex } from 'codemirror-lang-bib';

// With all options explicitly set (these are the defaults)
const extensions = [
  // ... other extensions
  bibtex({
    enableLinting: true,      // Enable linting
    enableTooltips: true,     // Enable hover tooltips
    enableAutocomplete: true, // Enable autocompletion
    autoCloseBrackets: true   // Enable auto-close brackets
  })
];
```

## API

### bibtex()

The main function that creates a `LanguageSupport` instance for BibTeX.

```javascript
import { bibtex } from 'codemirror-lang-bib';

// Include BibTeX support in your editor with default options
const extensions = [
  // ... other extensions
  bibtex()
];

// Or with specific options
const extensions = [
  // ... other extensions
  bibtex({
    enableLinting: true,      // Enable linting
    enableTooltips: true,     // Enable tooltips on hover
    enableAutocomplete: true, // Enable autocompletion
    autoCloseBrackets: true   // Enable auto-close brackets
  })
];
```

### bibtexLanguage

The BibTeX language definition. Usually you'll want to use the `bibtex()` function instead, but you can access this directly if needed.

```javascript
import { bibtexLanguage } from 'codemirror-lang-bib';
```

### bibtexHoverTooltip

An extension that shows helpful tooltips when hovering over BibTeX entry types and field names.

```javascript
import { bibtexHoverTooltip } from 'codemirror-lang-bib';

const extensions = [
  // ... other extensions
  bibtexHoverTooltip
];
```

### bibtexLinter

A linter function that checks for common BibTeX errors and issues.

```javascript
import { bibtexLinter } from 'codemirror-lang-bib';
import { linter } from '@codemirror/lint';

const extensions = [
  // ... other extensions
  linter(bibtexLinter({
    checkRequiredFields: true,  // Check for missing required fields
    checkUnknownFields: true,   // Check for unknown field names
    checkDuplicateKeys: true,   // Check for duplicate citation keys
    checkFieldSyntax: true,     // Check field value syntax
    checkEntryTypes: true       // Check for valid entry types
  }))
];
```

### snippets

A collection of BibTeX-related snippets for common entry structures.

```javascript
import { snippets } from 'codemirror-lang-bib';
```

### Styling

The package includes CSS styles for syntax highlighting in `dist/bib.css`. Import these styles to get the default BibTeX syntax highlighting:

```javascript
import 'codemirror-lang-bib/dist/bib.css';
```

You can also customize styles in your own CSS by targeting the specific syntax highlight classes.

## Advanced Usage

### Custom Extensions

You can compose your own editor with exactly the BibTeX features you need:

```javascript
import { EditorState, EditorView } from '@codemirror/basic-setup';
import { keymap } from '@codemirror/view';
import { linter } from '@codemirror/lint';
import { 
  bibtexLanguage, 
  bibtexCompletionSource, 
  bibtexBracketMatching, 
  bibtexLinter,
  bibtexHoverTooltip
} from 'codemirror-lang-bib';

// Create an editor with only specific BibTeX features
const editor = new EditorView({
  state: EditorState.create({
    doc: "@article{key,\n  author = {Author},\n  title = {Title}\n}",
    extensions: [
      // Basic CodeMirror setup
      basicSetup,
      
      // Add just the BibTeX language with completion
      new LanguageSupport(bibtexLanguage, [
        bibtexLanguage.data.of({
          autocomplete: bibtexCompletionSource
        })
      ]),
      
      // Add only the extensions you want
      bibtexBracketMatching,
      linter(bibtexLinter()),
      bibtexHoverTooltip,
      
      // Line wrapping is useful for BibTeX editing
      EditorView.lineWrapping
    ]
  }),
  parent: document.querySelector('#editor')
});
```

## Supported Entry Types

The package supports all standard BibTeX entry types:

- `@article` - Journal articles
- `@book` - Books
- `@inproceedings` - Conference papers
- `@incollection` - Book chapters
- `@phdthesis` - PhD dissertations
- `@mastersthesis` - Master's theses
- `@techreport` - Technical reports
- `@manual` - Manuals and documentation
- `@misc` - Miscellaneous entries
- `@online` - Online resources
- `@unpublished` - Unpublished works
- `@booklet` - Booklets
- `@proceedings` - Conference proceedings

## Field Validation

The linter validates field requirements based on entry type:

### Required Fields by Entry Type

- **@article**: author, title, journal, year
- **@book**: author, title, publisher, year
- **@inproceedings**: author, title, booktitle, year
- **@phdthesis**: author, title, school, year
- **@misc**: title

### Common Optional Fields

author, editor, pages, volume, number, series, edition, month, note, address, doi, url, isbn, etc.

## Building from Source

```bash
git clone https://github.com/texlyre/codemirror-lang-bib.git
cd codemirror-lang-bib
npm install
npm run build
```

## License

MIT License. See [LICENSE](LICENSE) file for details.
