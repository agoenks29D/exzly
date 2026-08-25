# Changelog

## [2.0.0] - 2026-08-25

### Breaking Changes

- **REST API**
  - Changed user profile update method from **`PUT` to `PATCH`**:
    - `PUT /api/users/profile` → `PATCH /api/users/profile`
    - `PUT /api/users/profile/:userId` → `PATCH /api/users/profile/:userId`

  - Changed profile photo update/removal method from **`PUT` to `PATCH`**:
    - `PUT /api/users/profile/:userId/photo` → `PATCH /api/users/profile/:userId/photo`

  - Changed user credential update method from **`PUT` to `PATCH`**:
    - `PUT /api/users/credentials/:userId` → `PATCH /api/users/credentials/:userId`

  - Changed the user restore endpoint path to make the restore action explicit:
    - `PATCH /api/users/profile/:userId` → `PATCH /api/users/profile/:userId/restore`

  - Existing API clients using the previous HTTP methods or restore endpoint must be updated to use the new endpoints.

- **Package Manager**
  - Migrated the project from **npm to pnpm**.
  - Removed `package-lock.json` and introduced `pnpm-lock.yaml`.
  - Added `packageManager` metadata for **pnpm 11.18.0**.
  - Developers and CI environments should use pnpm for dependency installation and project scripts.

### Added

- **Service Layer**
  - Introduced a dedicated service layer to centralize business and data-access operations:
    - `BaseService`
    - `UserService`
    - `AuthTokenService`
    - `AuthVerifyService`

  - Added a new `@exzly-services` module alias for accessing application services.
  - Added reusable service methods for user lookup, pagination, profile updates, credential updates, deletion, restoration, authentication token handling, and verification records.

- **CI/CD**
  - Expanded CI test coverage to support **Node.js 22.x and 24.x**.
  - Updated GitHub Actions workflow to use the pnpm setup action and pnpm-based commands.
  - Updated GitHub Actions checkout from v3 to v7.

- **Testing**
  - Improved account recovery tests so they no longer depend on seeded member data.
  - Account recovery tests now create an isolated test user dynamically.
  - Added explicit forwarded IP headers to make rate-limit-sensitive authentication tests independent and reliable.

### Changed

- **REST API Semantics**
  - Updated user modification endpoints to use HTTP `PATCH` for partial resource updates.
  - Updated profile photo upload/removal operations to use `PATCH`.
  - Updated user credential updates to use `PATCH`.
  - Updated restore-user semantics to use the dedicated `/restore` action endpoint.

- **Architecture**
  - Refactored model operations out of routes, middleware, and web handlers into dedicated service classes.
  - Routes no longer directly depend on Sequelize models for user, authentication token, and verification operations.
  - Centralized reusable business and data-access logic to improve consistency and prepare the codebase for future TypeScript migration.

- **Authentication**
  - Updated authentication middleware and account recovery logic to use the new service layer instead of directly accessing authentication and user models.

- **Dependencies**
  - Removed the `crypto-js` dependency and replaced SHA-1 hashing in seeders with Node.js native `crypto`.
  - Removed the unused `@types/sequelize` dependency.
  - Updated ESLint from **9.x to 10.9.0**.
  - Refreshed dependency versions and regenerated the lockfile through pnpm.

- **Developer Tooling**
  - Updated ESLint configuration to use the current flat-config structure and consolidated Node.js/Jest globals.
  - Added the `@exzly-services` path alias to project configuration and Jest module mappings.

### Fixed

- **Account Recovery Testing**
  - Removed reliance on the seeded `member` account in account recovery tests.
  - Improved test isolation and reliability by creating dedicated recovery users for the test suite.

- **REST API Consistency**
  - Corrected restore-user routing so restoration is represented as an explicit REST action instead of overlapping with the profile update endpoint.

### Test

- **Users API**
  - Updated user profile, profile photo, credential, and restore tests to match the new `PATCH` endpoints.
  - Preserved authorization and validation coverage for member and administrator operations.

- **Authentication**
  - Refactored account recovery tests to use the new authentication verification service.
  - Improved test independence from seeded data.

### Chore & CI/CD

- **Package Management**
  - Migrated project dependency management from npm to pnpm.
  - Replaced `package-lock.json` with `pnpm-lock.yaml`.
  - Added `pnpm-workspace.yaml` configuration to allow required native package builds.

- **CI/CD**
  - Migrated remaining CI commands from npm to pnpm.
  - Expanded the Node.js CI matrix to **22.x and 24.x**.
  - Updated GitHub Actions setup and caching strategy.

### Migration Notes

Applications consuming the v1 API should update their clients before upgrading to v2:

```text
PUT   /api/users/profile                 → PATCH /api/users/profile
PUT   /api/users/profile/:userId         → PATCH /api/users/profile/:userId
PUT   /api/users/profile/:userId/photo   → PATCH /api/users/profile/:userId/photo
PUT   /api/users/credentials/:userId     → PATCH /api/users/credentials/:userId
PATCH /api/users/profile/:userId         → PATCH /api/users/profile/:userId/restore
```

For development and CI environments, replace npm-based commands with their pnpm equivalents and install dependencies using the new `pnpm-lock.yaml`.

## [1.9.0] - 2025-11-07

### Added

- **Security**
  - Implemented **Content Security Policy (CSP)** configuration using **Helmet** to strengthen protection against cross-site scripting (XSS) and data injection attacks.

- **Utility**
  - Added new utility function **`isValidDomain`** with comprehensive **unit tests** to validate domain and CDN URLs.

- **Documentation**
  - Expanded the **README** file with:
    - **Git LFS documentation**
    - **RESTful API** section
    - **Postman logo and collection**
    - **Continuous Integration (CI) badge**

### Fixed

- **Authentication**
  - Enhanced **refresh token validation** to prevent reuse of revoked tokens and improve session integrity.

- **Asset Management**
  - Fixed asset URL issues when using **custom domains or CDN paths**.
  - Added domain validation logic to prevent **double slashes** or malformed URLs.

- **User Interface**
  - Fixed alignment and centering issues in **photo preview modals** for admin and user views.

### Changed

- **View Engine**
  - Improved asset handling to support **external CDN** configurations and domain-based URL generation.

- **Codebase**
  - Minor refactorings across UI components and middleware for clarity and maintainability.

- **.gitignore**
  - Extended `.gitignore` to include `.env.*` environment configuration files for better local development isolation.

### Test

- **Utilities**
  - Added **comprehensive test coverage** for `isValidDomain` and numeric validation utilities.
  - Ensured validation helpers meet edge case standards through Jest unit tests.

### Chore & CI/CD

- **Dependency Updates**
  - Upgraded critical dependencies to address security vulnerabilities:
    - `express-validator`
    - `validator`

- **Release Management**
  - Merged all updates from `develop/v1` into `release` for version alignment.

- **Documentation**
  - Updated and formatted README with new project information, badges, API examples, and Git LFS guidance.

## [1.8.0] - 2025-10-17

### Added

- **User Experience (UX)**
  - Implemented a **spinning loading indicator** during profile photo upload and removal in Admin views.
- **API**
  - Added **`serverTime`** to the root API endpoint response.
- **Utility**
  - Added the **`isNumeric`** helper function.

### Fixed

- **Admin/API Logic**
  - Prevented an **administrator from demoting themselves** via the API.
- **User Validation**
  - Added **username length validation** for registration and update.

### Changed

- **Admin User Interface (UI)**
  - **Improved responsiveness** of user detail modals.
  - Ensured modals are **removed from the DOM** after being closed.
- **Admin User Module Logic**
  - Refactored DataTables event handlers to use **row ID** instead of redundant data objects.
  - Improved AJAX result checking and user table redraw logic for consistency.
- **Code Cleanup**
  - Simplified and **renamed debug utility exports**.

### Test

- **Users API**
  - Added **comprehensive unit tests** for admin actions (promote/demote) and critical user validations (`users.spec.js`).
- **Utility**
  - Added **unit tests** for `getFileTypeFromBuffer` and `getFileTypeFromFile` utility functions.

### Chore & CI/CD

- **Dependency Updates**
  - Bumped dependencies: `mysql2`, `sharp`, and `@types/sequelize`.
- **Code Coverage**
  - Updated **Codecov configuration** to set the overall coverage target at **$80\%$**.
  - Enabled Codecov upload for CI on `develop/v1` and `develop/v2` branches.
- **Dependabot**
  - Changed Dependabot's target branch to `develop/v1`.

## [1.7.0] - 2025-10-8

### Added

- **User Session Management**
  - Introduced userSession object for managing client-side session data.
  - Added utility function getUriSegment for route handling.
- User Role Management
  - New API endpoints /promote/:userId and /demote/:userId to promote or demote users as administrators.
- Authentication Enhancements
  - Sign-in response now includes additional fields: gender and photoProfile.

### Changed

- Refactored user management APIs for consistent validation and authorization using req.userId.
- Updated views to use the new userSession and createRoute helper for improved client-side logic.
- Removed deprecated `<center>` tag from user image components.
- Updated dependabot configuration to include uuid and @faker-js/faker.

### Dependency Updates

- Bumped major dependencies:
  - `jest` to` 30.2.0`
  - `express-rate-limit` to `8.1.0`
  - `eslint` to `9.37.0`
  - `nodemailer` and `@types/nodemailer`
  - `dotenv` to `17.2.3`
  - `globals` to `16.4.0`
  - `@eslint/js` to `9.36.0`
  - `prettier` to `3.6.2`

## [1.6.1] - 2025-09-15

### Fixed

- Web
  - Removed the password reset redirection test which was causing issues in the test flow.
  - Fixed the status check in tests to be more accurate and aligned with the desired flow.

- Authentication
  - Restructured the forgot-password tests and integrated them into the account recovery test suite.

### Changed

- Documentation
  - Made minor adjustments to test documentation to reflect the updated test flow.

## [1.6.0] - 2025-08-21

### Added

- **Testing Utilities**
  - Added unit tests for the `byteFormat` function to ensure correct formatting of numeric values with unit suffixes.

### Fixed

- **Admin Panel**
  - Fixed profile photo update functionality so that it now correctly applies only to the currently logged-in user.

### Changed

- **Documentation**
  - Environment configuration details were moved from the project source to the GitHub Wiki for better maintainability and centralized documentation.

## [1.5.0] - 2025-08-12

### Added

- **File Utilities**
  - Added `getFileTypeFromBuffer` and `getFileTypeFromFile` helpers using the `file-type` package to detect file MIME type and extension from buffer or file path.

- **Number Utilities**
  - Added `byteFormat` helper to format numbers into short form with unit suffixes (`K`, `M`, `B`, `T`).

### Changed

- **Web Route Middleware**
  - Simplified auth route redirect logic by removing redundant skiplist regex and directly redirecting authenticated users away from authentication pages.

- **Utils Index**
  - Integrated new `fileUtils` into the main `utils` export.

### Dependency Updates

- `morgan` **1.10.0 → 1.10.1**
- `sharp` **0.34.2 → 0.34.3**
- `@types/lodash` **4.17.17 → 4.17.20**
- `jest` **30.0.4 → 30.0.5**
- `supertest` **7.1.1 → 7.1.4**

## [1.4.0] - 2025-07-15

### Added

- **Auth Pages UX Enhancement**
  Auto-focus is now applied to the first input field on authentication pages to improve usability.

### Fixed

- **Admin Panel**
  Fixed the user overview modal which previously caused display or interaction issues.

- **User Module**
  Fixed the feature to remove user profile photos so it now works as intended when users delete their photo.

### Changed

- No major architecture or business logic changes in this release.

## [1.3.0] - 2025-07-12

### Changed

- **Field Existence Check Optimization**
  Improved field existence logic in `user` model's `order` query by replacing `Object.keys()` with `fieldsName.indexOf()` for better performance and accuracy.

- **User Attribute Lookup Optimization**
  Refactored code in `user.js` to eliminate redundant `getAttributes()` calls, improving execution efficiency.

### Dependency Updates

- Bumped multiple development dependencies to enhance stability and security:
  - `jest` from 30.0.3 to 30.0.4
  - `@types/multer` from 1.4.12 to 2.0.0
  - `eslint` from 9.28.0 to 9.30.1
  - `@types/morgan` from 1.9.9 to 1.9.10
  - `@faker-js/faker` from 9.8.0 to 9.9.0

## [1.2.0] - 2025-07-02

### Changed

- Removed FOSSA badges from README to clean up unused license tracking service.

### Dependency Updates

- Bumped multiple dependencies for security and compatibility improvements:
  - `@eslint/js` → 9.30.1
  - `dotenv` → 17.0.1
  - `globals` → 16.3.0
  - `jest` → 30.0.3
  - `nodemailer` → 7.0.4
  - `brace-expansion` → 1.1.12

## [1.1.0] - 2025-06-14

### Added

- Admin panel sidebar now persists its open/closed state between page reloads and navigation for improved user experience.
- Added links in the README to:
  - The GitHub Wiki for detailed project documentation.
  - The Postman public API collection for easier API exploration and testing.

### Changed

- Updated Codecov badge in README to point to the main branch instead of develop.
- Replaced Codecov badge with token-authenticated version for more reliable coverage reporting.

## [1.0.0] - 2025-06-14

### Added

- Complete Authentication System:
  - User Registration: Allows new users to sign up for an account.
  - User Sign-in: Secure login functionality for existing users.
  - Password Management:
    - Forgot password feature.
    - Secure password reset functionality.
    - Verification code mechanism for password reset and other authentication flows.
  - Administrator Dashboard:
    - User Management: Comprehensive tools for administrators to manage user accounts.
      - Create new user profiles.
      - Update existing user profiles.
      - Preview detailed user profiles.
      - Delete user profiles.
  - Member Dashboard:
    - Profile Management: Enables individual members to update their own profile information.
  - Initial Project Setup:
    - Core codebase for the exzly application.
    - Basic routing and navigation structure.
    - Database schema and migrations to support all implemented features.

### Fixed

- No fixes applied in this initial release.

### Changed

- No changes applied in this initial release.
