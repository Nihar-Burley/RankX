# Repository Structure

## Current Working Layout

- root-level backend service folders
  - one folder per backend service
- `frontend/`
  - user and admin frontend applications
- `Docs/`
  - product and engineering documentation

## Important Note

The canonical application source now lives in root-level service folders plus `frontend/` and `Docs/`. Repository naming still includes legacy folders such as `problemservice` and `submissionservice`.

## Canonical Structure Direction

Recommended long-term structure:

- root service folders or a single explicit `backend/` migration
  - one folder per backend service
- `frontend/`
  - `Rankx`
  - `Rankx-admin`
- `Docs/`
  - architecture, phases, roadmap, security
- `infra/`
  - deployment and environment assets

## Naming Direction

Canonical service names should follow kebab-case:

- `problem-service`
- `submission-service`
- `quiz-service`
- `question-service`
- `attempt-service`
- `result-service`

Current legacy names still present:

- `problemservice`
- `submissionservice`

These should be normalized only through an explicit repository migration.
