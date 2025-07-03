# 🎉 Contributing Guide

Thank you for your interest in contributing to this project! We welcome all kinds of contributions — bug fixes, features, documentation improvements, and more.

## 🧑‍💻 How to Contribute

1. **Fork** the repository.
2. **Clone** your fork:

   ```bash
   git clone https://github.com/agoenks29D/exzly.git
   ```

3. **Create a new branch** from `main` (or `develop`, if available):

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes** and **commit** using the required semantic commit format.
5. **Push** to your fork and submit a **Pull Request (PR)**.

## 🧪 Adding Features or Fixing Bugs

When working on a new feature or bug fix:

- Create a branch with prefix:
  - feature/your-feature-name
  - fix/your-bug-name
  - chore/some-task
- Organize your code modularly based on the existing project structure.
- Write or update unit tests if needed.
- Update documentation when adding public APIs, services, or notable logic.
- Ensure all changes are clear and justifiable.

## ✅ Commit Message Convention: Semantic Commits

We **require** all commit messages to follow the [Semantic Commit Message](https://www.conventionalcommits.org/) format.

### Format

```
<type>[optional scope]: <description>
```

### Examples

- `feat(auth): add Google login support`
- `fix(api): fix token refresh bug`
- `docs(readme): update installation instructions`

### Common Commit Types

| Type       | Description                                 |
| ---------- | ------------------------------------------- |
| `feat`     | Add a new feature                           |
| `fix`      | Fix a bug                                   |
| `docs`     | Documentation changes                       |
| `style`    | Code style changes (formatting, whitespace) |
| `refactor` | Refactoring code without behavior change    |
| `test`     | Adding or updating tests                    |
| `chore`    | Build process or auxiliary tool changes     |
| `perf`     | Performance improvements                    |
| `ci`       | CI/CD configuration changes                 |
| `revert`   | Revert a previous commit                    |

> **Please avoid vague commit messages like `update`, `fix bug`, or `wip`.**

## 📏 Code Style and Standards

This project uses:

- ESLint for linting
- Prettier for consistent formatting
- Husky and lint-staged to enforce formatting and linting before every commit

### What happens when you commit

- prettier will auto-format changed .js, .ts, and .json files.
- eslint will run and fix issues.
- If any check fails, the commit is blocked until fixed.

### Manual Commands

```bash
npm run lint     # Run ESLint
npm run format   # Format code using Prettier
```

### Initial Setup

```bash
npm install
npx husky install
```

## 🔀 Pull Request Guide

Before submitting a PR, please ensure:

- [ ] Code is properly formatted and linted
- [ ] Semantic commit format is followed
- [ ] All relevant tests pass (npm test)
- [ ] Related docs are updated (if applicable)
- [ ] Descriptive title and summary are included in the PR
- [ ] Use Draft PRs if you want early feedback 👀

## 💬 Issues and Discussions

- Open a new **Issue** for feature requests, bugs, or questions.
- Use **Draft PRs** if you're seeking early feedback.

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

## 🙌 Thank You

Your contribution helps make Exzly better for everyone 🙌
Whether it’s code, documentation, feedback, or testing — we truly appreciate your support!

> Happy coding, and welcome to the Exzly community! 🚀
