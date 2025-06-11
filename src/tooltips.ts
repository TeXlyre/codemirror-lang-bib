// src/tooltips.ts
import { hoverTooltip, Tooltip } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { SyntaxNode } from '@lezer/common';

interface EntryTypeInfo {
  description: string;
  requiredFields: string[];
  optionalFields: string[];
  example?: string;
}

interface FieldInfo {
  description: string;
  example?: string;
  note?: string;
}

// Dictionary of BibTeX entry type information
const entryTypeInfoMap: Record<string, EntryTypeInfo> = {
  'article': {
    description: 'An article published in a journal or magazine.',
    requiredFields: ['author', 'title', 'journal', 'year'],
    optionalFields: ['volume', 'number', 'pages', 'month', 'note', 'doi', 'url'],
    example: '@article{key,\n  author = {John Doe},\n  title = {Sample Article},\n  journal = {Journal Name},\n  year = {2023}\n}'
  },
  'book': {
    description: 'A complete book published by a publisher.',
    requiredFields: ['author', 'title', 'publisher', 'year'],
    optionalFields: ['volume', 'series', 'address', 'edition', 'month', 'note', 'isbn'],
    example: '@book{key,\n  author = {Jane Smith},\n  title = {Book Title},\n  publisher = {Publisher},\n  year = {2023}\n}'
  },
  'inproceedings': {
    description: 'A paper published in conference proceedings.',
    requiredFields: ['author', 'title', 'booktitle', 'year'],
    optionalFields: ['editor', 'pages', 'organization', 'publisher', 'address', 'month', 'note'],
    example: '@inproceedings{key,\n  author = {Author Name},\n  title = {Paper Title},\n  booktitle = {Conference Proceedings},\n  year = {2023}\n}'
  },
  'incollection': {
    description: 'A part of a book with its own title.',
    requiredFields: ['author', 'title', 'booktitle', 'publisher', 'year'],
    optionalFields: ['editor', 'pages', 'chapter', 'address', 'month', 'note']
  },
  'conference': {
    description: 'Same as inproceedings - a paper in conference proceedings.',
    requiredFields: ['author', 'title', 'booktitle', 'year'],
    optionalFields: ['editor', 'pages', 'organization', 'publisher', 'address', 'month', 'note']
  },
  'phdthesis': {
    description: 'A doctoral dissertation.',
    requiredFields: ['author', 'title', 'school', 'year'],
    optionalFields: ['address', 'month', 'note', 'type']
  },
  'mastersthesis': {
    description: 'A master\'s thesis.',
    requiredFields: ['author', 'title', 'school', 'year'],
    optionalFields: ['address', 'month', 'note', 'type']
  },
  'techreport': {
    description: 'A technical report published by an institution.',
    requiredFields: ['author', 'title', 'institution', 'year'],
    optionalFields: ['type', 'number', 'address', 'month', 'note']
  },
  'manual': {
    description: 'Technical documentation or manual.',
    requiredFields: ['title'],
    optionalFields: ['author', 'organization', 'address', 'edition', 'month', 'year', 'note']
  },
  'misc': {
    description: 'For items that don\'t fit other categories.',
    requiredFields: ['title'],
    optionalFields: ['author', 'howpublished', 'month', 'year', 'note', 'url']
  },
  'online': {
    description: 'An online resource or webpage.',
    requiredFields: ['title', 'url'],
    optionalFields: ['author', 'year', 'month', 'urldate', 'note']
  },
  'unpublished': {
    description: 'A document that has not been published.',
    requiredFields: ['author', 'title', 'note'],
    optionalFields: ['month', 'year']
  },
  'booklet': {
    description: 'A printed work without a named publisher.',
    requiredFields: ['title'],
    optionalFields: ['author', 'howpublished', 'address', 'month', 'year', 'note']
  },
  'proceedings': {
    description: 'The proceedings of a conference.',
    requiredFields: ['title', 'year'],
    optionalFields: ['editor', 'publisher', 'organization', 'address', 'month', 'note']
  }
};

// Dictionary of field information
const fieldInfoMap: Record<string, FieldInfo> = {
  'author': {
    description: 'The name(s) of the author(s).',
    example: 'John Doe and Jane Smith',
    note: 'Use "and" to separate multiple authors'
  },
  'title': {
    description: 'The title of the work.',
    example: 'A Great Discovery in Science'
  },
  'journal': {
    description: 'The name of the journal or magazine.',
    example: 'Nature'
  },
  'year': {
    description: 'The year of publication.',
    example: '2023'
  },
  'publisher': {
    description: 'The name of the publisher.',
    example: 'Academic Press'
  },
  'booktitle': {
    description: 'The title of the book or conference proceedings.',
    example: 'Proceedings of the International Conference'
  },
  'editor': {
    description: 'The name(s) of the editor(s).',
    example: 'John Editor and Jane Editor',
    note: 'Use "and" to separate multiple editors'
  },
  'pages': {
    description: 'The page numbers.',
    example: '123--145',
    note: 'Use double dash (--) for page ranges'
  },
  'volume': {
    description: 'The volume number of a journal or book.',
    example: '42'
  },
  'number': {
    description: 'The issue number of a journal.',
    example: '3'
  },
  'month': {
    description: 'The month of publication.',
    example: 'jan',
    note: 'Use three-letter abbreviations without quotes'
  },
  'note': {
    description: 'Any additional information.',
    example: 'In press'
  },
  'doi': {
    description: 'Digital Object Identifier.',
    example: '10.1000/182'
  },
  'url': {
    description: 'The URL of an online resource.',
    example: 'https://example.com/paper.pdf'
  },
  'urldate': {
    description: 'The date when the URL was last accessed.',
    example: '2023-12-01'
  },
  'address': {
    description: 'The address of the publisher or institution.',
    example: 'New York, NY'
  },
  'edition': {
    description: 'The edition of a book.',
    example: '2nd'
  },
  'series': {
    description: 'The name of a series or set of books.',
    example: 'Lecture Notes in Computer Science'
  },
  'school': {
    description: 'The name of the school where a thesis was written.',
    example: 'MIT'
  },
  'institution': {
    description: 'The institution that published a technical report.',
    example: 'Stanford University'
  },
  'organization': {
    description: 'The organization that sponsored a conference.',
    example: 'IEEE'
  },
  'type': {
    description: 'The type of technical report or thesis.',
    example: 'PhD thesis'
  },
  'howpublished': {
    description: 'How something unusual has been published.',
    example: 'Self-published'
  },
  'chapter': {
    description: 'The chapter number.',
    example: '7'
  },
  'key': {
    description: 'Used for alphabetizing when author is missing.',
    example: 'Anonymous99'
  },
  'crossref': {
    description: 'The key of another entry to inherit fields from.',
    example: 'conf2023'
  },
  'isbn': {
    description: 'International Standard Book Number.',
    example: '978-0-123456-78-9'
  },
  'issn': {
    description: 'International Standard Serial Number.',
    example: '1234-5678'
  },
  'keywords': {
    description: 'Keywords associated with the entry.',
    example: 'machine learning, artificial intelligence'
  },
  'abstract': {
    description: 'Abstract or summary of the work.',
    example: 'This paper presents...'
  }
};

/**
 * Provides hover tooltips for BibTeX entry types and field names
 */
export const bibtexHoverTooltip = hoverTooltip((view, pos, side) => {
  const tree = syntaxTree(view.state);
  const node = tree.resolve(pos);
  const text = view.state.sliceDoc(node.from, node.to);

  // Check for entry types (after @)
  if (node.name === 'EntryType' || isEntryTypeContext(view, pos)) {
    const entryType = extractEntryType(view, pos);
    if (entryType) {
      const info = entryTypeInfoMap[entryType.toLowerCase()];
      if (info) {
        return makeEntryTypeTooltip(info, entryType, node.from, node.to);
      }
    }
  }

  // Check for field names
  if (node.name === 'FieldName' || isFieldNameContext(view, pos)) {
    const fieldName = extractFieldName(view, pos);
    if (fieldName) {
      const info = fieldInfoMap[fieldName.toLowerCase()];
      if (info) {
        return makeFieldTooltip(info, fieldName, node.from, node.to);
      }
    }
  }

  return null;
});

// Helper functions for context detection
function isEntryTypeContext(view: any, pos: number): boolean {
  const textBefore = view.state.sliceDoc(Math.max(0, pos - 20), pos + 20);
  return /@[a-zA-Z]*/.test(textBefore);
}

function isFieldNameContext(view: any, pos: number): boolean {
  const textBefore = view.state.sliceDoc(Math.max(0, pos - 50), pos + 20);
  return /[a-zA-Z_]+\s*=/.test(textBefore);
}

function extractEntryType(view: any, pos: number): string | null {
  const textAround = view.state.sliceDoc(Math.max(0, pos - 20), pos + 20);
  const match = textAround.match(/@([a-zA-Z]+)/);
  return match ? match[1] : null;
}

function extractFieldName(view: any, pos: number): string | null {
  const textAround = view.state.sliceDoc(Math.max(0, pos - 30), pos + 30);
  const match = textAround.match(/([a-zA-Z_]+)\s*=/);
  return match ? match[1] : null;
}

// Create tooltip for entry types
function makeEntryTypeTooltip(info: EntryTypeInfo, entryType: string, from: number, to: number): Tooltip {
  const content = document.createElement('div');
  content.className = 'cm-bibtex-tooltip';

  // Description
  const description = document.createElement('div');
  description.textContent = info.description;
  description.className = 'cm-bibtex-tooltip-description';
  content.appendChild(description);

  // Required fields
  if (info.requiredFields.length > 0) {
    const required = document.createElement('div');
    required.textContent = 'Required: ' + info.requiredFields.join(', ');
    required.className = 'cm-bibtex-tooltip-required';
    content.appendChild(required);
  }

  // Optional fields
  if (info.optionalFields.length > 0) {
    const optional = document.createElement('div');
    optional.textContent = 'Optional: ' + info.optionalFields.join(', ');
    optional.className = 'cm-bibtex-tooltip-optional';
    content.appendChild(optional);
  }

  // Example
  if (info.example) {
    const example = document.createElement('div');
    example.textContent = 'Example:';
    example.className = 'cm-bibtex-tooltip-example-label';
    content.appendChild(example);

    const exampleCode = document.createElement('pre');
    exampleCode.textContent = info.example;
    exampleCode.className = 'cm-bibtex-tooltip-example';
    content.appendChild(exampleCode);
  }

  return {
    pos: from,
    end: to,
    above: true,
    create(view) {
      return { dom: content };
    }
  };
}

// Create tooltip for field names
function makeFieldTooltip(info: FieldInfo, fieldName: string, from: number, to: number): Tooltip {
  const content = document.createElement('div');
  content.className = 'cm-bibtex-tooltip';

  // Field name
  const name = document.createElement('div');
  name.textContent = fieldName;
  name.className = 'cm-bibtex-tooltip-field-name';
  content.appendChild(name);

  // Description
  const description = document.createElement('div');
  description.textContent = info.description;
  description.className = 'cm-bibtex-tooltip-description';
  content.appendChild(description);

  // Example
  if (info.example) {
    const example = document.createElement('div');
    example.textContent = 'Example: ' + info.example;
    example.className = 'cm-bibtex-tooltip-example';
    content.appendChild(example);
  }

  // Note
  if (info.note) {
    const note = document.createElement('div');
    note.textContent = 'Note: ' + info.note;
    note.className = 'cm-bibtex-tooltip-note';
    content.appendChild(note);
  }

  return {
    pos: from,
    end: to,
    above: true,
    create(view) {
      return { dom: content };
    }
  };
}