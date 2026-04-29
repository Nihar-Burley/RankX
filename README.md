# RankX

RankX is a dual-track learning platform built around two product experiences:

- Coding practice and evaluation
- Quiz authoring, attempts, and results

This repository is being brought to a production-grade Phase 1 baseline with a gateway-first architecture, role-aware user and admin flows, safer service boundaries, and structured platform documentation.

## Product Tracks

### Coding platform
- browse problems
- run code
- submit code
- manage problems, languages, templates, and testcases

### Quiz platform
- browse quizzes
- attempt quizzes
- submit answers and view results
- manage quizzes and questions

## Service Map

### Backend services
- `api-gateway`
- `auth-service`
- `user-service`
- `config-server`
- `discovery-server`
- `problemservice`
- `submissionservice`
- `quiz-service`
- `question-service`
- `attempt-service`
- `result-service`

### Frontend applications
- `frontend/Rankx`
- `frontend/Rankx-admin`

## Current Phase Status

- Phase 1: completed
- Coding platform: Phase 1 complete
- Quiz platform: Phase 1 complete
- Platform security baseline: Phase 1 complete
- Documentation baseline: complete

## Phase 1 Goals

- secure gateway-to-service identity flow
- correct ownership enforcement
- stable coding and quiz user flows
- stable admin content management flows
- structured logging and exception handling direction
- clean system documentation

## Documentation Map

- [Docs/ARCHITECTURE.md](E:/Workspace/RankX/Docs/ARCHITECTURE.md)
- [Docs/SECURITY.md](E:/Workspace/RankX/Docs/SECURITY.md)
- [Docs/CODING_PLATFORM.md](E:/Workspace/RankX/Docs/CODING_PLATFORM.md)
- [Docs/QUIZ_PLATFORM.md](E:/Workspace/RankX/Docs/QUIZ_PLATFORM.md)
- [Docs/PHASES.md](E:/Workspace/RankX/Docs/PHASES.md)
- [Docs/ROADMAP.md](E:/Workspace/RankX/Docs/ROADMAP.md)
- [Docs/REPOSITORY_STRUCTURE.md](E:/Workspace/RankX/Docs/REPOSITORY_STRUCTURE.md)

## Current Repository Note

The canonical backend service source now lives at the repository root, one folder per service. Legacy naming still exists for `problemservice` and `submissionservice`; those names should be normalized only through a separate explicit repository migration.

## Verification Baseline

Phase 1 verification completed with:

- `mvn test` for `api-gateway`
- `mvn test` for `auth-service`
- `mvn test` for `user-service`
- `mvn test` for `attempt-service`
- `mvn test` for `result-service`
- `mvn test` for `problemservice`
- `mvn test` for `submissionservice`
- `mvn test` for `quiz-service`
- `mvn test` for `question-service`
- `mvn test` for `config-server`
- `mvn test` for `discovery-server`
- `npm run build` for `Frontend/Rankx`
- `npm run build` for `Frontend/Rankx-admin`
