import { EditorState } from '@codemirror/state';
import { EditorView, lineNumbers, highlightActiveLine, keymap } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { completionKeymap } from '@codemirror/autocomplete';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';

// Import the BibTeX extension from a relative path to access the built package
import { bibtex } from '../../..';
import '../../../dist/bib.css';
import './styles.css';

// Example BibTeX document
const initialDoc = `@article{einstein1905,
  author = {Albert Einstein},
  title = {Zur Elektrodynamik bewegter K{\\"o}rper},
  journal = {Annalen der Physik},
  year = 1905,
  volume = {17},
  number = {10},
  pages = {891--921},
  doi = {10.1002/andp.19053221004}
}

@book{knuth1984,
  author = {Donald E. Knuth},
  title = {The {\\TeX}book},
  publisher = {Addison-Wesley},
  year = 1984,
  series = {Computers and Typesetting},
  volume = {A},
  address = {Reading, Massachusetts},
  isbn = {0-201-13447-0}
}

@inproceedings{lamport1994,
  author = {Leslie Lamport},
  title = {\\LaTeX: A Document Preparation System},
  booktitle = {Proceedings of the International Conference on Document Processing},
  year = 1994,
  pages = {123--130},
  organization = {ACM},
  address = {New York, NY},
  note = {Second edition}
}

@online{codemirror2023,
  author = {Marijn Haverbeke},
  title = {CodeMirror 6: Next Generation Code Editor},
  url = {https://codemirror.net/6/},
  urldate = {2023-12-01},
  year = 2023,
  note = {Accessed December 1, 2023}
}

@phdthesis{smith2022,
  author = {Jane Smith},
  title = {Advanced Bibliography Management in Digital Academic Writing},
  school = {University of Technology},
  year = {2022},
  address = {Boston, MA},
  month = {may},
  note = {Available at university library}
}

@misc{github2023,
  author = {GitHub Inc.},
  title = {GitHub: Where the world builds software},
  howpublished = {\\url{https://github.com}},
  year = 2023,
  note = {Online platform for version control and collaboration}
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