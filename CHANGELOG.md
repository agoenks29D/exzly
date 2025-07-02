# Changelog

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
