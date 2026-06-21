# RankX Docker Runbook

This stack is the supported one-command local deployment path for RankX.

It now uses:
- one root Compose entrypoint
- one Dockerfile per backend service
- one Dockerfile per frontend app
- internal-only service networking
- a dedicated MySQL application user instead of running the platform on root DB credentials
- fixed local auth bootstrap users for admin and test flows
- reusable SQL-dump import pipeline for production-like local data today and sanitized real dumps later

## What it runs

- MySQL
- Redis
- Config Server
- Discovery Server
- Auth Service
- Problem Service
- Submission Service
- Attempt Service
- Question Service
- Quiz Service
- Result Service
- User Service
- API Gateway
- RankX user web app
- RankX admin app

## Before you start

1. Copy the example environment file:

```powershell
Copy-Item .env.docker.example .env
```

2. Set a real base64-encoded JWT secret in `.env`.

3. If you want to use a different Judge0 endpoint, update `JUDGE0_BASE_URL` in `.env`.

4. Local auth users are enabled by default. The starter credentials are:
   - admin: `rankx_admin` / `RankXAdmin123!`
   - test: `rankx_test` / `RankXTest123!`

## Start everything

```powershell
docker compose up --build
```

The first run takes longer because each Java service and both frontends are built into images.

For a stricter future-production-style run, use the production override:

```powershell
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

## Main URLs

- User app: [http://localhost:3000](http://localhost:3000)
- Admin app: [http://localhost:3001](http://localhost:3001)
- API gateway: [http://localhost:8080](http://localhost:8080)

## Local production-like data

After the stack is up, import the tracked production-like local dataset:

```powershell
.\scripts\import-rankx-sql-dumps.ps1
```

That dataset adds realistic local rows for:
- `application_userdb`
- `application_attempt_db`
- `application_result_db`
- `application_submission_db`

Auth users are not restored from SQL dumps. They are bootstrapped by `auth-service` at startup so the local passwords stay valid.

When you later receive sanitized real dumps, place them in:
- [E:\Workspace\RankX\sql-dumps\import](E:/Workspace/RankX/sql-dumps/import)

Then import them with:

```powershell
.\scripts\import-rankx-sql-dumps.ps1 -SourceDir .\sql-dumps\import
```

## Runtime notes

- Only the gateway and the two frontend apps are exposed on host ports by default.
- Internal services stay on the Compose network and register with Eureka.
- Frontends proxy `/api` requests through the gateway.
- `submission-service` still depends on the external Judge0 endpoint configured by `JUDGE0_BASE_URL`.
- MySQL creates a dedicated application user from `docker/mysql/init/002-create-app-user.sh`.
- Each service owns its own Dockerfile, which makes later CI/CD splitting cleaner.
- The tracked SQL files in `sql-dumps/local` are idempotent and safe to re-run for local refreshes.

## Common commands

Rebuild after code changes:

```powershell
docker compose up --build
```

Run in the background:

```powershell
docker compose up --build -d
```

Stop everything:

```powershell
docker compose down
```

Stop everything and remove the MySQL volume:

```powershell
docker compose down -v
```

Inspect the MySQL container directly:

```powershell
docker compose exec mysql mysql -uroot -p
```

## Health checks

The stack uses service health checks so the gateway and apps wait for the services they depend on.

Useful checks:

- [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)
- [http://localhost:3000/healthz](http://localhost:3000/healthz)
- [http://localhost:3001/healthz](http://localhost:3001/healthz)

Internal-only checks from inside the Docker network:

```powershell
docker compose exec api-gateway curl -fsS http://config-server:8888/actuator/health
docker compose exec api-gateway curl -fsS http://discovery-server:8761/actuator/health
```

## Known limitations

- This is a production-leaning local deployment, not a full multi-node production cluster.
- Judge0 is still external.
- Secrets are environment-file based, not vault-managed.
- Billing and support product flows still need deeper implementation before public production release.
- `docker-compose.prod.yml` is a future-facing override, not a replacement for a full production platform with TLS, ingress, secret management, and managed databases.
