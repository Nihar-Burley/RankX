# SQL Dumps

This folder is the supported local data import path for RankX.

## Layout

- `local/`
  - tracked, production-like sanitized SQL imports for local development
- `import/`
  - untracked drop zone for future real sanitized dumps from a live environment

## Current local dataset

The tracked local dataset gives you:
- one local admin user
- one local test user
- realistic user preferences, streak, plan progress, quiz attempts, quiz results, code submissions, and product events for the test user
- a richer content catalog with:
  - 12 coding problems
  - 10 published quizzes
  - 40 quiz questions
  - 6 curated study plans with 24 linked plan items

Important:
- auth users are **not** imported from SQL here
- auth users are bootstrapped by `auth-service` on startup so passwords stay valid and configurable

Default local users:
- admin: `rankx_admin` / `RankXAdmin123!`
- test: `rankx_test` / `RankXTest123!`

## Import the tracked local dataset

After the Docker stack is up:

```powershell
.\scripts\import-rankx-sql-dumps.ps1
```

## Import future real sanitized dumps

Put data-only sanitized SQL files into:

- `sql-dumps/import`

Then run:

```powershell
.\scripts\import-rankx-sql-dumps.ps1 -SourceDir .\sql-dumps\import
```

Recommended format for future sanitized imports:
- one `.sql` file per database
- include `USE application_...;`
- data-only, idempotent where possible
- do not include raw production credentials or unsanitized PII
