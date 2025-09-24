# Contributing to presentMD

Thank you for your interest in contributing to presentMD — small contributions make a big difference.

This document explains the preferred workflow, code style, and how to run the project locally.

## How to contribute

1. Fork the repository and create a feature branch.
2. Make small, focused changes with descriptive commit messages.
3. Run the app and tests locally; ensure linters pass.
4. Open a Pull Request against `main` with a clear description of the change.

## Code style

- TypeScript + React is used throughout the codebase.
- Keep files and components small and focused.
- Use Tailwind utility classes for styling; reuse existing design tokens and classes when possible.
- Run `npm run lint` before committing.

## Running the project locally

```bash
git clone https://github.com/presentMD/presentmd-app
cd presentmd-app
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Testing

There are no automated tests yet — contributions that add unit or integration tests are welcome.

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

---

Thanks again — looking forward to your PRs!