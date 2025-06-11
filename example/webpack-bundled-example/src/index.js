import { EditorState } from '@codemirror/state';
import { EditorView, lineNumbers, highlightActiveLine, keymap } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import {completionKeymap} from '@codemirror/autocomplete';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';

// Import the BibTeX extension - webpack will resolve this from the parent directory
import { bibtex } from '../../../dist';
import '../../../dist/bib.css';
import './styles.css';

// Example BibTeX document
const initialDoc = `@article{sample2023,
  author = {John Doe and Jane Smith},
  title = {A Comprehensive Study of Bibliography Management},
  journal = {Journal of Academic Writing},
  year = {2023},
  volume = {15},
  number = {3},
  pages = {42--58},
  doi = {10.1234/jaw.2023.15.3.42},
  url = {https://example.com/article},
  note = {Open access article}
}

@book{bibliography2022,
  author = {Alice Johnson},
  title = {Modern Bibliography and Citation Management},
  publisher = {Academic Press},
  year = {2022},
  edition = {3rd},
  address = {New York, NY},
  isbn = {978-1-234567-89-0},
  series = {Digital Humanities Series},
  volume = {7}
}

@inproceedings{conference2023,
  author = {Bob Wilson and Carol Davis},
  title = {Automated Bibliography Generation in Academic Writing},
  booktitle = {Proceedings of the International Conference on Digital Libraries},
  year = {2023},
  pages = {123--130},
  organization = {ACM},
  address = {San Francisco, CA},
  month = {jul},
  publisher = {ACM Press}
}

@online{website2023,
  author = {Tech Company},
  title = {Documentation for Bibliography Tools},
  url = {https://docs.example.com/bibliography},
  urldate = {2023-12-01},
  year = {2023},
  note = {Comprehensive guide to bibliography management}
}

@phdthesis{thesis2022,
  author = {David Brown},
  title = {Advances in Digital Bibliography Systems},
  school = {University of Technology},
  year = {2022},
  address = {Boston, MA},
  month = {sep},
  type = {PhD dissertation}
}`;

// Initialize the editor
let currentOptions = {
  enableLinting: true,
  enableTooltips: true,
  enableAutocomplete: true,
  autoCloseBrackets: true
};

function createEditor() {
  const extensions = [
    lineNumbers(),
    highlightActiveLine(),
    history(),
    highlightSelectionMatches(),
    syntaxHighlighting(defaultHighlightStyle),
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      ...searchKeymap,
      ...completionKeymap
    ]),

    // Line wrapping is helpful for BibTeX
    EditorView.lineWrapping
  ];

  // Add the BibTeX language support with current options
  try {
    const bibtexExtension = bibtex(currentOptions);
    extensions.push(bibtexExtension);
  } catch (error) {
    console.error("Failed to load BibTeX extension:", error);
    // Continue with basic editor if BibTeX extension fails
  }

  const state = EditorState.create({
    doc: initialDoc,
    extensions,
  });

  return new EditorView({
    state,
    parent: document.getElementById('editor')
  });
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Create the initial editor
  let editorView = createEditor();

  // Handle option changes
  document.getElementById('enableLinting').addEventListener('change', e => {
    currentOptions.enableLinting = e.target.checked;
    recreateEditor();
  });

  document.getElementById('enableTooltips').addEventListener('change', e => {
    currentOptions.enableTooltips = e.target.checked;
    recreateEditor();
  });

  document.getElementById('enableAutocomplete').addEventListener('change', e => {
    currentOptions.enableAutocomplete = e.target.checked;
    recreateEditor();
  });

  document.getElementById('autoCloseBrackets').addEventListener('change', e => {
    currentOptions.autoCloseBrackets = e.target.checked;
    recreateEditor();
  });

  function recreateEditor() {
    // Save current content
    const content = editorView.state.doc.toString();

    // Dispose the old editor
    editorView.destroy();

    // Create a new editor with the updated options
    editorView = createEditor();

    // Set the content back
    editorView.dispatch({
      changes: { from: 0, to: editorView.state.doc.length, insert: content }
    });
  }

  // Toolbar button actions
  document.getElementById('insertArticle').addEventListener('click', () => {
    insertSnippet('@article{key,\n  author = {Author Name},\n  title = {Article Title},\n  journal = {Journal Name},\n  year = {2023},\n  volume = {1},\n  pages = {1--10}\n}\n\n');
  });

  document.getElementById('insertBook').addEventListener('click', () => {
    insertSnippet('@book{key,\n  author = {Author Name},\n  title = {Book Title},\n  publisher = {Publisher},\n  year = {2023},\n  address = {City}\n}\n\n');
  });

  document.getElementById('insertInproceedings').addEventListener('click', () => {
    insertSnippet('@inproceedings{key,\n  author = {Author Name},\n  title = {Paper Title},\n  booktitle = {Conference Proceedings},\n  year = {2023},\n  pages = {1--8},\n  organization = {Organization}\n}\n\n');
  });

  document.getElementById('insertOnline').addEventListener('click', () => {
    insertSnippet('@online{key,\n  author = {Author Name},\n  title = {Web Page Title},\n  url = {https://example.com},\n  urldate = {2023-12-01},\n  year = {2023}\n}\n\n');
  });

  function insertSnippet(text) {
    const cursor = editorView.state.selection.main.head;
    editorView.dispatch({
      changes: { from: cursor, insert: text },
      selection: { anchor: cursor + text.length }
    });
    editorView.focus();
  }
});