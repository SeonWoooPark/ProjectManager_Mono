# Repository Guidelines

## Project Structure & Module Organization
- `backend/` holds the Express + TypeScript API. Key areas: `src/core` for domain logic, `src/modules` for feature groups (e.g., `auth`), `src/infrastructure` for adapters, `src/shared` for utilities, and `prisma/` for migrations and seeds. Entry point: `src/server.ts`.
- `frontend/` is the React + Vite client. Feature code lives in `src/components`, `src/pages`, `src/services`, and `src/store`; colocate tests beside implementation files.
- `shared/` contains reusable `types/` and `utils/` imported by both apps through TypeScript path aliases.

## Build, Test, and Development Commands
- Backend: `npm run dev` (tsx dev server), `npm run build` (compile to `dist/`), `npm start` (run compiled server), `npm test` / `npm run test:coverage` (Jest), `npm run lint:fix` (ESLint + Prettier), `npm run seed` (Prisma seed).
- Frontend: `npm run dev` (Vite dev server), `npm run build` (type-check + production bundle), `npm run preview` (serve built bundle), `npm test` (Vitest), `npm run lint:fix` (lint + format).
- Docker: from the repo root run `docker-compose up` to start Postgres, Redis, backend, and frontend together.

## Coding Style & Naming Conventions
- TypeScript strict mode across packages; target Node 18+.
- Prettier config: 2 spaces, single quotes, semicolons, max width 100. Run `npm run lint:fix` before committing.
- Naming: `camelCase` for variables/functions, `PascalCase` for components/types, `UPPER_SNAKE_CASE` for constants. Respect backend aliases like `@core/*` and frontend module structure.

## Testing Guidelines
- Backend: Jest with `ts-jest`; place tests in `src/**/__tests__` or alongside files as `*.test.ts`. Maintain ≥80% coverage via `npm run test:coverage`.
- Frontend: Vitest + Testing Library; name tests `*.test.tsx` near the component under test.
- Add targeted tests for new logic and rerun the relevant coverage command before submitting.

## Commit & Pull Request Guidelines
- Use Conventional Commits, e.g., `feat(auth): add refresh token endpoint`, scoping by package when applicable (`backend`, `frontend`, `shared`).
- PRs should include a clear summary, linked issues, test evidence (`npm test`, coverage, lint), and UI screenshots for frontend changes.
- Keep changes scoped to affected modules and ensure lint/tests pass locally before requesting review.

## Security & Configuration Tips
- Copy env templates before running services: `cp backend/.env.example backend/.env`.
- Default local DB connection: `postgresql://myapp:myapp123@localhost:5432/myapp`. Frontend expects `VITE_API_URL` (defaults to `http://localhost:5000/api/v1`).
- Never commit secrets; rely on Docker compose for local infrastructure parity.
