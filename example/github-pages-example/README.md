# GitHub Pages Demo for CodeMirror BibTeX Extension

This directory contains a demo of the CodeMirror BibTeX extension that is configured to work with GitHub Pages. It serves as the main website for the project at https://texlyre.github.io/codemirror-lang-bib/.

## Development

To run this demo locally:

```bash
# From the project root
npm run build:pages-example
npm run pages-example
```

Or from this directory:

```bash
npm install
npm start
```

## Build

To build the static site:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the main branch through the GitHub Actions workflow defined in `.github/workflows/deploy.yml`.