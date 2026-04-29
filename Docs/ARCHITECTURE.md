# Architecture

## Topology

RankX uses a gateway-first microservice architecture.

### Public edge
- `api-gateway`

### Core platform
- `auth-service`
- `user-service`
- `config-server`
- `discovery-server`

### Coding domain
- `problemservice`
- canonical service name: `problem-service`
- `submissionservice`
- canonical service name: `submission-service`

### Quiz domain
- `quiz-service`
- `question-service`
- `attempt-service`
- `result-service`

### Frontend applications
- `frontend/Rankx`
- `frontend/Rankx-admin`

## Request Flow

1. the client authenticates through `auth-service`
2. the client sends product traffic to `api-gateway`
3. the gateway validates JWTs
4. the gateway forwards trusted identity headers to downstream services
5. downstream services rebuild request identity from trusted headers
6. internal service endpoints support service-to-service workflows only

## Service Responsibilities

### `api-gateway`
- public ingress
- JWT validation
- trusted identity forwarding
- domain route dispatch

### `auth-service`
- registration
- OTP verification
- login
- JWT issuance

### `user-service`
- authenticated profile baseline
- future user history, preferences, and analytics seed

### `problem-service`
- problem metadata
- testcase ownership
- templates and languages
- admin and public problem APIs

### `submission-service`
- code run flow
- code submit flow
- judge integration
- submission persistence

### `quiz-service`
- quiz metadata
- quiz status transitions
- quiz admin and public discovery flows

### `question-service`
- quiz question storage
- admin question management
- correct answer retrieval for evaluation flows

### `attempt-service`
- attempt creation
- answer persistence
- attempt submission

### `result-service`
- attempt evaluation
- result persistence
- user-scoped result retrieval
