# Repository Guidelines

## Project Structure & Module Organization

- `backend/` — Express + TypeScript API. Key paths: `src/core`, `src/infrastructure`, `src/modules` (e.g., `auth`), `src/shared`, `prisma/` (migrations, seed), entry `src/server.ts`, env `backend/.env`.
- `frontend/` — React + Vite + TypeScript. Key paths: `src/components`, `src/pages`, `src/services`, `src/store`.
- `shared/` — Reusable `types/` and `utils/` consumed by both apps.

## Build, Test, and Development Commands

Backend (from `backend/`):

```bash
npm run dev          # Start API with hot reload (tsx)
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled server
npm test             # Jest test suite
npm run test:coverage# Jest with coverage
npm run lint:fix     # ESLint + Prettier autofix
npm run seed         # Seed database (Prisma)
```

Frontend (from `frontend/`):

```bash
npm run dev          # Start Vite dev server
npm run build        # Type-check + Vite build
npm run preview      # Preview production build
npm test             # Vitest
npm run lint:fix     # ESLint + Prettier autofix
```

Docker (from repo root): `docker-compose up` to run Postgres, Redis, backend, and frontend.

## Coding Style & Naming Conventions

- TypeScript strict mode; Node 18+.
- Prettier: 2 spaces, single quotes, semicolons, width 100.
- ESLint: TypeScript + React rules; run `npm run lint:fix` before commits.
- Naming: `camelCase` variables/functions, `PascalCase` classes/types/components, `UPPER_SNAKE_CASE` constants.
- Backend path aliases: `@core/*`, `@modules/*`, `@shared/*`, `@infrastructure/*`, `@/*`.

## Testing Guidelines

- Backend: Jest (`ts-jest`), tests in `src/**/__tests__` or `*.test.ts`; coverage thresholds 80% (see `jest.config.js`).
- Frontend: Vitest + Testing Library; name tests `*.test.tsx` near code.
- Run unit tests locally and ensure coverage does not regress: `npm run test:coverage` in each package.

## Commit & Pull Request Guidelines

- Use Conventional Commits: `feat|fix|chore|docs|test|refactor(scope): message`. Example: `feat(auth): add refresh token endpoint` or `fix(frontend): debounce login submit`.
- Scope by package when relevant: `backend`, `frontend`, `shared`.
- PRs must include: clear description, linked issues, test plan/steps, screenshots for UI changes, and pass lint/tests.

## Security & Configuration

- Copy envs: `cp backend/.env.example backend/.env`. Do not commit secrets.
- Local DB (docker-compose): `postgresql://myapp:myapp123@localhost:5432/myapp`.
- Frontend API URL: `VITE_API_URL` (defaults to `http://localhost:5000/api/v1`).

## Agent Notes

- Keep edits minimal and scoped to the changed package; respect existing structure and aliases.
- Prefer adding tests near changed code; run lint and tests in the touched package before opening a PR.
