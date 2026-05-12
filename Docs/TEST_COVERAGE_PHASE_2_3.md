# Phase 2 and Phase 3 Test Coverage

## Purpose

This document tracks the automated coverage added around RankX Phase 2 and the early Phase 3 work. It answers two practical questions:

1. What is already covered by automated tests?
2. What still needs manual acceptance verification in a running environment?

## Backend automated coverage

### `Backend/user-service`

Covered areas:
- onboarding preference create, update, and empty-state lookup
- dashboard summary branching for:
  - incomplete onboarding
  - coding-first users
  - both-track college or exam users
  - unexpected track fallback
- study plan listing, detail, enrollment, duplicate enrollment, user study plans, and progress summary
- seeded study plan compatibility:
  - canonical `problem-{id}` references
  - canonical `quiz-{id}` references
  - legacy `referenceKey`-only compatibility
- real progress sync:
  - accepted coding submission updates progress
  - failed coding submission does not update progress
  - completed quiz result updates progress
  - duplicate completion remains idempotent
- admin study plan CRUD rules:
  - create
  - update
  - deactivate
  - invalid problem and quiz references rejected
- analytics:
  - coding and quiz performance calculations
  - latest coding activity
  - latest quiz activity
  - latest overall activity
  - total completed plan items
  - no-activity new user behavior
  - recommendation v2 branching
- product event ingestion and KPI aggregation
- controller validation for:
  - invalid preferences payload
  - invalid event payload
  - invalid internal progress payload
  - invalid admin study plan payload

Main test files:
- `Backend/user-service/src/test/java/com/application/userservice/service/UserPreferenceServiceTest.java`
- `Backend/user-service/src/test/java/com/application/userservice/service/StudyPlanServiceTest.java`
- `Backend/user-service/src/test/java/com/application/userservice/service/UserAnalyticsServiceTest.java`
- `Backend/user-service/src/test/java/com/application/userservice/service/ProductEventServiceTest.java`
- `Backend/user-service/src/test/java/com/application/userservice/controller/UserControllerTest.java`
- `Backend/user-service/src/test/java/com/application/userservice/controller/StudyPlanControllerTest.java`
- `Backend/user-service/src/test/java/com/application/userservice/controller/InternalProgressControllerTest.java`

### `Backend/submissionservice`

Covered areas:
- accepted coding submission produces progress update callback
- failed coding submission does not trigger progress update
- submission history filtering
- problem-level attempt summary aggregation

Main test file:
- `Backend/submissionservice/src/test/java/com/application/submissionservice/service/SubmissionServiceTest.java`

### `Backend/result-service`

Covered areas:
- completed quiz evaluation produces progress update callback
- duplicate evaluation is blocked and idempotent from the progress perspective
- result filtering by quiz and minimum percentage
- review comparison uses the latest previous attempt, not arbitrary history order

Main test file:
- `Backend/result-service/src/test/java/com/application/resultservice/service/ResultServiceImplTest.java`

## Frontend automated coverage

### `Frontend/Rankx`

Test stack added:
- Vitest
- React Testing Library
- `jsdom`

Covered screens and utilities:
- onboarding redirect and submit flow
- dashboard render and recommendation CTA behavior
- study plan detail render and enroll flow
- progress page render
- analytics page render and empty-state behavior
- submission detail render
- quiz review render
- event tracker:
  - no-token safe failure
  - once-per-session dedupe

Main test files:
- `Frontend/Rankx/src/pages/Home.test.jsx`
- `Frontend/Rankx/src/pages/Onboarding.test.jsx`
- `Frontend/Rankx/src/pages/StudyPlanDetail.test.jsx`
- `Frontend/Rankx/src/pages/MyProgress.test.jsx`
- `Frontend/Rankx/src/pages/Analytics.test.jsx`
- `Frontend/Rankx/src/pages/SubmissionDetail.test.jsx`
- `Frontend/Rankx/src/pages/quiz/QuizReview.test.jsx`
- `Frontend/Rankx/src/utils/eventTracker.test.js`

### `Frontend/Rankx-admin`

Test stack added:
- Vitest
- React Testing Library
- `jsdom`

Covered screens:
- study plan list states
- study plan create flow
- study plan item editor add and save flow
- KPI dashboard render states

Main test files:
- `Frontend/Rankx-admin/src/pages/StudyPlanList.test.jsx`
- `Frontend/Rankx-admin/src/pages/StudyPlanEditor.test.jsx`
- `Frontend/Rankx-admin/src/pages/StudyPlanItemsEditor.test.jsx`
- `Frontend/Rankx-admin/src/pages/AdminKpiDashboard.test.jsx`

## Manual acceptance scenarios still required

Even with strong automated coverage, these should still be run in a live environment before calling the product fully release-ready:

### User journeys
- register or login -> onboarding -> dashboard redirect
- dashboard recommendation -> navigation to target page
- study plan enrollment -> coding submission accepted -> progress page refresh
- study plan enrollment -> quiz attempt submitted -> result review -> progress update
- analytics page with real history data
- submission history -> submission detail
- quiz history -> quiz review

### Admin journeys
- admin study plan create -> item editing -> save -> visible in list
- admin deactivate study plan -> verify user app no longer offers it as active
- admin KPI dashboard with real tracked event data
- problem, quiz, and question analytics pages with mixed-content datasets

### Cross-service checks
- `user-service` startup when `problem-service` or `quiz-service` is unavailable
- progress sync behavior when downstream progress callback is unavailable
- event ingestion remaining non-blocking during frontend flows

## Recommended verification commands

Backend:
- `mvn test` in `Backend/user-service`
- `mvn test` in `Backend/submissionservice`
- `mvn test` in `Backend/result-service`

Frontend:
- `npm test` in `Frontend/Rankx`
- `npm test` in `Frontend/Rankx-admin`
- `npm run build` in `Frontend/Rankx`
- `npm run build` in `Frontend/Rankx-admin`

Optional quality checks:
- `npm run lint` in `Frontend/Rankx`
- `npm run lint` in `Frontend/Rankx-admin`

## Current reality

The suite is much stronger than earlier Phase 2 and Phase 3 checkpoints, but “every scenario” should be interpreted as:
- comprehensive automated coverage for critical and high-risk branches
- explicit manual acceptance coverage for integrated user journeys

That is the practical production standard for this codebase.
