# Campus Connect

A campus management platform with role-based portals for students, faculty,
librarians, canteen staff and administrators.

- **Frontend:** React 18 + TypeScript + Vite, shadcn/ui + Tailwind, TanStack Query
- **Backend:** Spring Boot 3 + MySQL (see [`backend/`](backend/README.md))
- **Auth (dev):** local credential store with five demo accounts. Clerk is the
  intended production identity provider.

## Modules

| Module | Student | Staff |
|---|---|---|
| **Library** | Browse the catalogue, reserve books, track loans and fines | Approve requests, manage inventory, record returns, clear fines |
| **Canteen** | Pre-order from the menu, pay from a wallet, track order status | Manage the menu, run the pre-order queue, view sales analytics |
| **Academic** | Study materials, assignments, study groups and forums (join by code) | Publish materials, set assignments, manage groups and forums, view engagement |
| **Campus** | Register for events, book facilities, read announcements | — |
| **Admin** | — | Manage users and roles, issue staff invitation codes |
| **Assistant** | Floating AI helper for every module (mock responses, or OpenAI when a key is set) | |

## Local-first data layer

Every feature works with **no backend running**. Each service in
`src/lib/services/` calls the Spring Boot API first and falls back to
`localStorage` (seeded with demo content on first run) when the API is
unavailable. `src/lib/apiClient.ts` adds a short request timeout and a circuit
breaker so the fallback path stays fast.

## Getting started

```bash
npm install
npm run dev            # http://localhost:5173
```

No environment file is required. To point the frontend at a running backend or
enable the real assistant, create `.env`:

```env
VITE_API_BASE_URL="http://localhost:8080/api/v1"
VITE_OPENAI_API_KEY=""      # optional — enables real AI assistant responses
VITE_OPENAI_MODEL="gpt-4o-mini"
```

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Student | `student@campus.edu` | `student123` |
| Professor | `faculty@campus.edu` | `faculty123` |
| Librarian | `librarian@campus.edu` | `librarian123` |
| Canteen staff | `canteen@campus.edu` | `canteen123` |
| Admin | `admin@campus.edu` | `admin123` |

The sign-in screen has one-click buttons for each. Staff sign-up needs an
invitation code, which an admin generates from the Admin console.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
| `npm test` | Run the Vitest suite |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:coverage` | Vitest with a coverage report |

## Project structure

```
src/
├── components/       # shared components + shadcn/ui primitives + feature dialogs
├── contexts/         # Auth, Theme, Chatbot providers
├── hooks/            # useUserProfile, useRealtimeSync, …
├── lib/
│   ├── apiClient.ts  # backend client (timeout + circuit breaker)
│   ├── services/     # per-module data layer (API → localStorage fallback)
│   └── sample-data.ts# first-run demo content
├── pages/            # one component per route
└── test/             # Vitest setup + render helpers
backend/              # Spring Boot API (optional)
```

## Testing

The Vitest suite covers the data-layer services, the auth store, the API client's
circuit breaker, and key component flows (add-book validation, canteen ordering).
Tests run against the localStorage fallback with `fetch` stubbed, so they need no
backend.

## The AI assistant

The floating assistant (bottom-right on every signed-in page) answers questions
about each module. Without `VITE_OPENAI_API_KEY` it uses keyword-matched mock
responses driven by `src/lib/app_guide.json`; with a key it calls OpenAI with the
same guide as context. Implementation: `src/lib/api/` and
`src/components/Chatbot.tsx`.

## License

MIT
