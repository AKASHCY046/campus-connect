# Campus Connect — Backend

Spring Boot 3.3 modular monolith (Java 21) backing the Campus Connect frontend.

- **DB:** MySQL 8, schema owned by Flyway (`src/main/resources/db/migration`)
- **Auth:** two modes, selected by `AUTH_MODE`
  - `dev` (default) — `Authorization: Bearer <profileId>` is resolved directly
    against the `profiles` table. No external identity provider needed.
  - `clerk` — validates Clerk-issued JWTs (`CLERK_ISSUER_URL`, `CLERK_JWKS_URL`).
- **API:** every route is under `/api/v1`, responses use the
  `{ success, message, data }` envelope. OpenAPI UI at `/swagger-ui.html`.

## Modules

| Package | Endpoints |
|---|---|
| `users` | `/profiles/me`, `/admin/users/**`, `/webhooks/clerk` |
| `library` | `/books/**`, `/issued-books/**`, `/fines/**` |
| `canteen` | `/menu/**`, `/orders/**` |
| `academic` | `/materials/**`, `/assignments/**`, `/groups/**`, `/forums/**` |
| `campus` | `/facilities/**`, `/facilities/bookings/**`, `/events/**` |
| `notifications` | `/notifications/**` |

## Running locally

Prerequisites: a running MySQL 8 on `localhost:3306`. A JDK 21 and Maven 3.9
are bundled under `tools/` if you don't have your own.

```bash
export JAVA_HOME="$PWD/tools/jdk-21.0.2"          # or your own JDK 21
export DB_PASSWORD=<your mysql root password>      # defaults to "2407"

./tools/apache-maven-3.9.6/bin/mvn spring-boot:run
# → http://localhost:8080/api/v1/health
```

The database `campus_connect` is created automatically and Flyway seeds demo
data (5 accounts, books, menu, facilities, events, …) matching the frontend's
`u_admin` / `u_student` / … profile ids.

## Configuration

All settings have local-friendly defaults (see `application.yml`). Override via
environment variables:

| Var | Default | Purpose |
|---|---|---|
| `APP_PORT` | `8080` | HTTP port |
| `DB_HOST` / `DB_PORT` / `DB_NAME` | `localhost` / `3306` / `campus_connect` | MySQL |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / `2407` | MySQL credentials |
| `AUTH_MODE` | `dev` | `dev` or `clerk` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:8080` | comma-separated |
| `CLERK_ISSUER_URL` / `CLERK_JWKS_URL` | — | required only when `AUTH_MODE=clerk` |

## Tests

```bash
./tools/apache-maven-3.9.6/bin/mvn test
```

Service-layer unit tests (Mockito, no DB) cover order pricing, the library loan
cycle and overdue-fine calculation.
