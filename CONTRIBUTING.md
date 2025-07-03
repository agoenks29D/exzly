# 🎉 Contributing Guide

Thank you for your interest in contributing to this project! We welcome all kinds of contributions — bug fixes, features, documentation improvements, and more.

- [🎉 Contributing Guide](#-contributing-guide)
  - [📜 Code of Conduct](#-code-of-conduct)
  - [🤝 How to Contribute](#-how-to-contribute)
  - [🌿 Branch Naming](#-branch-naming)
  - [📝 Commit Message Convention](#-commit-message-convention)
  - [✅ Pull Request Guideline](#-pull-request-guideline)
  - [🎯 Coding Style Guide](#-coding-style-guide)
    - [💡 Coding Practices](#-coding-practices)
    - [🧪 Example Validator](#-example-validator)
  - [💬 Issues and Discussions](#-issues-and-discussions)
  - [📄 License](#-license)
  - [🙌 Thank You](#-thank-you)

## 📜 Code of Conduct

Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) before contributing.

## 🤝 How to Contribute

- Fork the repo
- Create a new branch from main
- Work on your feature or bugfix
- Write tests if necessary
- Submit a Pull Request

## 🌿 Branch Naming

```text
feature/<feature-name>
bugfix/<issue-name>
hotfix/<issue-name>
docs/<update-docs>
```

Example:

- `feature/auth-service`
- `bugfix/login-session`
- `docs/update-readme`

## 📝 Commit Message Convention

We **require** all commit messages to follow the [Semantic Commit Message](https://www.conventionalcommits.org/) format.

Example : `<type>(scope): description`

| Type       | Description                                 |
| ---------- | ------------------------------------------- |
| `feat`     | Add new feature                             |
| `fix`      | Fix a bug                                   |
| `docs`     | Documentation only changes                  |
| `style`    | Code style changes (formatting, whitespace) |
| `refactor` | Refactoring code without behavior change    |
| `test`     | Adding/adjusting tests                      |
| `chore`    | Build process or auxiliary tool changes     |
| `perf`     | Performance improvements                    |
| `ci`       | CI/CD configuration changes                 |
| `revert`   | Revert a previous commit                    |

Example : `feat(auth): implement refresh token`

## ✅ Pull Request Guideline

- PR should be atomic (1 feature/fix per PR)
- Clearly describe what you did
- Link to related issues if any
- Ensure tests pass (if tests are required)

## 🎯 Coding Style Guide

Please follow these standards across the codebase:

| Element     | Style         | Example                 |
| ----------- | ------------- | ----------------------- |
| Variable    | `camelCase`   | `userData`, `resetCode` |
| Function    | `camelCase`   | `sendEmail`, `getToken` |
| Class       | `PascalCase`  | `UserModel`             |
| Constants   | `UPPER_SNAKE` | `JWT_SECRET`, `MAX_TRY` |
| File/Folder | `kebab-case`  | `reset-password.js`     |

### 💡 Coding Practices

- Use `async/await` (no `.then()` chains)
- Use `try/catch` or global error handler middleware
- Use `express-validator` with `matchedData()`
- Extract logic to helpers or services
- Avoid hardcoded strings — use configs/constants
- Rate limit sensitive endpoints (auth, forgot-password, etc)
- Use `http-errors` for consistent error responses

### 🧪 Example Validator

```js
const { body } = require('express-validator');

module.exports = [body('email').isEmail().withMessage('Invalid email')];
```

```js
const express = require('express');
const app = express.Router();

app.post(
  '/sign-in',
  [validator],
  asyncRoute(async (req, res) => {
    // your logic
  }),
);

module.exports = app;
```

## 💬 Issues and Discussions

- Open a new **Issue** for feature requests, bugs, or questions.
- Use **Draft PRs** if you're seeking early feedback.

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

## 🙌 Thank You

Your contribution helps make Exzly better for everyone 🙌
Whether it’s code, documentation, feedback, or testing — we truly appreciate your support!

> Happy coding, and welcome to the Exzly community! 🚀
