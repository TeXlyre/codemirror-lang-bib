// src/document-values.ts
import { EditorState } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import { SyntaxNode } from '@lezer/common';

export interface DocumentValues {
    authors: Set<string>;
    editors: Set<string>;
    journals: Set<string>;
    publishers: Set<string>;
    schools: Set<string>;
    institutions: Set<string>;
    organizations: Set<string>;
    addresses: Set<string>;
    years: Set<string>;
    keys: Set<string>;
    byField: Map<string, Set<string>>;
}

const FIELD_BUCKETS: Record<string, keyof Omit<DocumentValues, 'byField'>> = {
    author: 'authors',
    editor: 'editors',
    journal: 'journals',
    journaltitle: 'journals',
    shortjournal: 'journals',
    publisher: 'publishers',
    origpublisher: 'publishers',
    school: 'schools',
    institution: 'institutions',
    organization: 'organizations',
    address: 'addresses',
    location: 'addresses',
    origlocation: 'addresses',
    year: 'years',
    origyear: 'years'
};

export function splitAuthors(raw: string): string[] {
    return raw
        .split(/\s+and\s+/i)
        .map(name => name.trim())
        .filter(Boolean);
}

function unwrap(text: string): string {
    let s = text.trim();
    while ((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('"') && s.endsWith('"'))) {
        s = s.slice(1, -1).trim();
    }
    return s;
}

export function collectDocumentValues(state: EditorState): DocumentValues {
    const result: DocumentValues = {
        authors: new Set(), editors: new Set(), journals: new Set(),
        publishers: new Set(), schools: new Set(), institutions: new Set(),
        organizations: new Set(), addresses: new Set(), years: new Set(),
        keys: new Set(), byField: new Map()
    };

    const tree = syntaxTree(state);
    const doc = state.doc;

    tree.cursor().iterate((node: { name: string; node: SyntaxNode }) => {
        if (node.name !== 'Entry') return;
        const entry = node.node;

        const keyNode = entry.getChild('EntryKey');
        if (keyNode) result.keys.add(doc.sliceString(keyNode.from, keyNode.to));

        for (const field of entry.getChildren('Field')) {
            const nameNode = field.getChild('FieldName');
            const valueNode = field.getChild('Value');
            if (!nameNode || !valueNode) continue;

            const name = doc.sliceString(nameNode.from, nameNode.to).toLowerCase();
            const value = unwrap(doc.sliceString(valueNode.from, valueNode.to));
            if (!value) continue;

            if (!result.byField.has(name)) result.byField.set(name, new Set());
            result.byField.get(name)!.add(value);

            const bucket = FIELD_BUCKETS[name];
            if (bucket === 'authors' || bucket === 'editors') {
                for (const person of splitAuthors(value)) result[bucket].add(person);
            } else if (bucket) {
                result[bucket].add(value);
            }
        }
        return false;
    });

    return result;
}