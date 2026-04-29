# Security

## Core Rule

The API gateway is the only intended public entry point.

## Identity Flow

1. `auth-service` issues JWTs
2. `api-gateway` validates JWTs
3. `api-gateway` forwards trusted identity headers
4. downstream services rebuild request identity from trusted headers

Trusted headers:
- `X-User-Id`
- `X-Role`

## Security Expectations

### Do trust
- gateway-injected identity headers
- authenticated principal reconstructed from trusted headers

### Do not trust
- frontend request body `userId`
- frontend-provided role values
- client-side route guards as real authorization

## Phase 1 Security Outcomes

Phase 1 requires:

- JWT validation at gateway
- no hardcoded public identity shortcuts
- ownership checks for user-scoped data
- role checks for admin routes
- structured unauthorized responses

## Product-Specific Rules

### Coding platform
- submissions must belong to the authenticated user
- admin problem routes must require admin role
- judge/testcase flows must not trust client identity

### Quiz platform
- attempts must belong to the authenticated user
- results must be user-scoped
- quiz and question admin routes must require admin role

## Current Structural Note

The canonical backend service source now lives in the root-level service folders. Future service renames such as `problemservice` to `problem-service` should be handled as an explicit repository migration, not mixed into security work.
