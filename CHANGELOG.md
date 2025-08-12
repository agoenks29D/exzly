# Changelog

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
