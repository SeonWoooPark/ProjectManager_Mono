# React Conversion Output (from V0.dev Next.js App Router code)

This folder contains a React-friendly version of your UI code. Core changes:
- Removed Next.js-specific features (`metadata`, `use client/server`, `next/*` server imports).
- Replaced `next/link` → `react-router-dom` (`<Link href>` → `<Link to>`).
- Replaced `next/image` → local `Img` wrapper (`src/lib/Img.tsx`). Use it like `<Img ... />`.
- Replaced `next/head` → `react-helmet-async` (`<Helmet>`). You need to add a `<HelmetProvider>` at app root.
- Mapped `useRouter()` → `useNavigate()`; `router.push/replace/back` → `navigate(...)` forms.
- Commented out `redirect(...)` and `notFound()` with TODO notes.
- Removed `@vercel/analytics/next` usage.
- Skipped copying Next API routes under `app/**/api`.

## Recommended Setup in your React app (Vite example)
- Install deps: `pnpm add react-router-dom react-helmet-async`
- Add Tailwind if used originally: `pnpm add -D tailwindcss postcss autoprefixer`
- Create alias `@` → `src` in your bundler (Vite `resolve.alias`).

## What to review manually
- Any `notFound()` usage → Replace with `<Navigate to="/404" replace />` in component flow.
- Any `redirect()` usage → Move into `useEffect(() => navigate('/path'), [])` with `const navigate = useNavigate()`.
- Any removed `next/font/*` or font packages like `geist/font/*` → Replace with `@fontsource/*` or CSS equivalents.
- If some files still import Next-only modules, please adjust them or share the file for a focused patch.

All files are mirrored under `src/` to keep relative imports intact. Public assets remain under `public/`.


## Optional: Generated React Router stub
- A file `src/router.generated.tsx` was created from `app/**/page.tsx` files.
- 사용 예시:
```tsx
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router.generated'

export function App() {
  return <RouterProvider router={router} />
}
```
