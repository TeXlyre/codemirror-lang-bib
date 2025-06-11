# Contributing to CodeMirror 6 BibTeX Language Support

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/texlyre/codemirror-lang-bib.git
   cd codemirror-lang-bib
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the project:
   ```
   npm run build
   ```

4. Run the webpack example:
   ```
   npm run build:example
   npm run example
   ```

5. Run the GitHub Pages example:
   ```
   npm run build:pages-example
   npm run pages-example
   ```

## Project Structure

- `src/` - Source code for the CodeMirror extension
  - `bib-parser.ts` - Main language definition and parser integration
  - `bibtex-parser.ts` - BibTeX parser integration
  - `completion.ts` - Autocompletion logic for entry types and fields
  - `linter.ts` - BibTeX-specific linting rules
  - `tooltips.ts` - Hover tooltip functionality
  - `bib.css` - Syntax highlighting styles
  - `index.ts` - Main export file
- `example/` - Contains example applications showing the extension in use
- `scripts/` - Utility scripts for building and setup
- `dist/` - Build output (generated)

## Making Changes

1. Create a new branch for your changes:
   ```
   git checkout -b feature/your-feature-name
   ```

2. Make your changes to the codebase.

3. Build the project to ensure your changes compile:
   ```
   npm run build
   ```

4. Test your changes using the example applications:
   ```
   npm run example
   ```

5. Commit your changes with a clear and descriptive commit message.

6. Push your branch to your fork:
   ```
   git push origin feature/your-feature-name
   ```

7. Create a pull request to the main repository.

## Coding Guidelines

- Follow the existing code style in the project
- Write clear, documented code
- Add comments for complex functionality
- Update documentation when necessary
- Use TypeScript for type safety

## BibTeX Support Guidelines

When adding new features to the BibTeX support:

- **Entry Types**: Follow standard BibTeX specifications
- **Field Names**: Support both required and optional fields per entry type
- **Validation**: Ensure linting rules are helpful but not overly strict
- **Autocompletion**: Provide context-aware suggestions
- **Tooltips**: Include helpful descriptions and examples

## Testing

Test your changes with various BibTeX documents:

- Standard academic entries (@article, @book, @inproceedings)
- Special entries (@string, @preamble, @comment)
- Edge cases (missing fields, malformed entries)
- Different field value formats (quoted strings, braced values, numbers)

## Pull Request Process

1. Ensure your code builds without errors
2. Update the README.md with details of changes if appropriate
3. Test with both example applications
4. Your pull request will be reviewed by the maintainers
5. Address any requested changes

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).