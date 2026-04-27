#!/usr/bin/env node

const { buildParserFile } = require('@lezer/generator');
const fs = require('fs');
const path = require('path');

const GRAMMAR_FILE = path.join(__dirname, '../grammar/bibtex.grammar');
const OUTPUT_DIR = path.join(__dirname, '../src');

function generateParser() {
    if (!fs.existsSync(GRAMMAR_FILE)) {
        console.error(`Grammar file not found: ${GRAMMAR_FILE}`);
        process.exit(1);
    }
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const grammarContent = fs.readFileSync(GRAMMAR_FILE, 'utf8');
    const result = buildParserFile(grammarContent, {
        moduleStyle: 'es',
        exportName: 'parser',
        warn: warning => console.warn(warning)
    });

    fs.writeFileSync(path.join(OUTPUT_DIR, 'bibtex.mjs'), result.parser);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'bibtex.terms.mjs'), result.terms);
    console.log('BibTeX parser generated.');
}

generateParser();