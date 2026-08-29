# Campus Connect

A campus management platform with role-based portals for students, faculty,
librarians, canteen staff and administrators.

```
campus-connect/
├── frontend/   React 18 + TypeScript + Vite, shadcn/ui + Tailwind, TanStack Query
└── backend/    Spring Boot 3 + MySQL 8  (optional — see backend/README.md)
```

The frontend runs on its own with no backend and no configuration: every service
tries the API first and falls back to seeded `localStorage` data. When the
backend is running the app uses it automatically.

## Modules

| Module | Student | Staff |
|---|---|---|
| **Library** | Browse the catalogue, reserve books, track loans and fines | Approve requests, manage inventory, record returns, clear fines |
| **Canteen** | Pre-order from the menu, pay from a wallet, track order status | Manage the menu, run the pre-order queue, view sales analytics |
| **Academic** | Study materials, assignments, study groups and forums (join by code) | Publish materials, set assignments, manage groups and forums |
| **Campus** | Register for events, book facilities, read announcements | — |
| **Admin** | — | Manage users and roles, issue staff invitation codes |
| **Assistant** | Floating AI helper for every module (mock responses, or OpenAI with a key) | |

## Run the frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

## Run the full stack

Needs MySQL 8 on `localhost:3306` (defaults to user `root`, password `2407` —
set `DB_PASSWORD` otherwise). A JDK 21 and Maven 3.9 are bundled under
`backend/tools/`.

```bash
# Terminal 1 — backend
cd backend
export JAVA_HOME="$PWD/tools/jdk-21.0.2"
./tools/apache-maven-3.9.6/bin/mvn spring-boot:run     # http://localhost:8080

# Terminal 2 — frontend
cd frontend
npm run dev
```

Flyway creates and seeds the `campus_connect` database on first boot. Visit
**/verify** (Workspaces → System Health) to confirm the frontend sees the API.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Student | `student@campus.edu` | `student123` |
| Professor | `faculty@campus.edu` | `faculty123` |
| Librarian | `librarian@campus.edu` | `librarian123` |
| Canteen staff | `canteen@campus.edu` | `canteen123` |
| Admin | `admin@campus.edu` | `admin123` |

The sign-in screen has one-click buttons for each. Staff sign-up needs an
invitation code, which an admin generates from the Admin console.

## Scripts (run inside `frontend/`)

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest suite (41 tests) |
| `npm run test:watch` / `test:coverage` | watch mode / coverage report |

## Frontend structure

```
frontend/src/
├── components/    shared components + shadcn/ui primitives + feature dialogs
├── contexts/      Auth, Theme, Chatbot providers
├── hooks/         useUserProfile, useRealtimeSync, …
├── lib/
│   ├── apiClient.ts   backend client (timeout + circuit breaker)
│   ├── services/      per-module data layer (API → localStorage fallback)
│   └── sample-data.ts first-run demo content
├── pages/         one component per route
└── test/          Vitest setup + render helpers
```

## License

MIT
