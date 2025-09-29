# Champ Select

Champ Select is a React + TypeScript application that powers a shareable champion showcase, an authenticated admin workspace, and utilities for stream overlays. The UI follows an Atomic Design component library, persists lightweight state with `localStorage`, and ships with robust Vitest coverage.

## Highlights

- **Public Champ Select page** – Displays a curated champion list with avatars, names, and a donation CTA that can preload Streamlabs amounts.
- **Admin dashboard** – Authenticated users can reorder champions via drag-and-drop, remove entries, and adjust donation defaults.
- **Settings page** – Stores Streamlabs URL and token directly in the app so admins can manage tip configuration without leaving the UI.
- **Authentication flows** – Shared layouts, form validation, and an auth-aware popover menu for login, signup, settings, and logout.
- **Overlay view** – Lightweight page intended for on-stream overlays.
- **Atomic Design system** – Atoms -> Molecules -> Organisms -> Templates -> Pages, all colocated under `client/src/components/` for consistent reuse.
- **Comprehensive tests** – Vitest + Testing Library suites cover every layer of the component hierarchy.

## Repository Layout

```
champ-select/
|-- api/                        # Placeholder API service (documentation pending)
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |   |-- atoms/          # Button, Card, Avatar, IconButton, etc.
|   |   |   |-- molecules/      # DonationControls, ChampionRow, Popover, ...
|   |   |   |-- organisms/      # AuthMenu, ChampionList, authentication forms, ...
|   |   |   |-- templates/      # AdminLayout, AuthLayout, ...
|   |   |   `-- pages/          # ChampSelect, ChampSelectAdmin, Settings, Overlay, Login, Signup
|   |   |-- context/            # AuthContext (login, signup, logout, bootstrap)
|   |   |-- lib/                # Shared utilities (e.g., API helpers)
|   |   `-- types/              # Shared TypeScript types
|   `-- package.json            # Frontend scripts and dependencies
|-- package.json                # Root scripts (runs API and client concurrently)
`-- package-lock.json
```

## Prerequisites

- Node.js >= 18
- npm >= 9

Install dependencies from the repository root so both the API and client workspaces share the same `node_modules/`.

## Installation

```bash
npm install
```

> The command above installs dependencies for the root project and both workspaces. If you ever work exclusively inside `client/`, you can run `npm install` from that directory as well, but it is typically unnecessary after the root install.

## Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Runs API and client using `concurrently` (default workflow). |
| `npm run dev --prefix client` | Launches the Vite dev server (defaults to http://localhost:5173). |
| `npm run lint --prefix client` | Executes ESLint across the frontend. |
| `npm run test --prefix client` | Starts Vitest in watch mode. |
| `npm run test:run --prefix client` | Runs the Vitest suite once. |
| `npm run build --prefix client` | Type-checks and builds the client bundle with Vite. |

## Local Storage Contract

The application relies on a handful of consistent keys. Tests mock the same keys to guarantee behavioral parity.

| Key | Consumers | Purpose |
|-----|-----------|---------|
| `champ-select-admin:champions` | Admin & public Champ Select pages | JSON array of champion objects. Falls back to an internal seed list when missing or invalid. |
| `champ-select-admin:donationAmount` | Admin & public Champ Select pages | Donation amount (string). Valid, non-negative numbers prefill the Streamlabs donation link. |
| `champ-select-admin:streamlabsUrl` | Settings page | Base Streamlabs tip URL saved by admins. |
| `champ-select-admin:streamlabsToken` | Settings page | Streamlabs API token/secret saved by admins. |

## Core Flows

### Public Champ Select
- Renders a vertical champion list with avatars, names, and IDs inside a shared `Card`.
- Donation button links to `https://streamlabs.com/<your-channel>/tip`. When a valid amount is present in localStorage, the link appends `?amount=<value>` and the button label becomes `Donate $xx.xx`.

### Champ Select Admin (Protected)
- Drag-and-drop powered by `@hello-pangea/dnd` for reordering.
- Remove champions inline; updates persist to `localStorage`.
- Donation controls validate numeric input before saving.

### Settings (Protected)
- Stores Streamlabs URL and token with inline validation (HTTP(S) URL, non-empty token).
- Shows a success status after persistence.
- Hydrates form inputs from stored values on mount.

### Authentication & Navigation
- `AuthContext` handles login/signup/logout via `/auth/*` endpoints (implemented in `client/src/lib/api.ts`).
- `AuthMenu` toggles between login/signup (guests) and settings/logout (authenticated). The Settings link routes to `/settings`, wrapped by `ProtectedRoute` to ensure only logged-in users gain access.

## Testing

Vitest with Testing Library is configured in the client workspace.

```bash
npm run test:run --prefix client  # One-off run
npm run test --prefix client      # Watch mode
```

Guidelines:
- Keep tests colocated with their components.
- Import CSS modules within tests when you need class names (see `UserBadge.test.tsx`).
- Mock browser APIs when necessary (`localStorage`, `window.open`, navigation, etc.).

## Coding Standards & Conventions

- **TypeScript-first** – Avoid `any`. All hooks and utilities should be strongly typed.
- **Atomic design hierarchy** – Prefer reusing atoms inside molecules/organisms before creating new primitives.
- **CSS Modules** – Style encapsulation via `.module.css` files. Reference class names through the imported `styles` object.
- **Accessibility** – Maintain semantic roles, aria-labels, focus outlines, and keyboard navigation (e.g., Popover, AuthMenu, donation actions).

## Build & Deploy

- `npm run build --prefix client` produces a Vite bundle in `client/dist/`.
- Serve the build output from a CDN or alongside the API.
- Ensure runtime configuration (e.g., API base URLs, Streamlabs integration) is exposed via environment variables or a hydration script prior to deployment.

## Future Enhancements

- Integrate the stored Streamlabs URL/token with authenticated API calls to auto-populate donation widgets.
- Persist champion states server-side for multi-admin environments.
- Expand the overlay page with live timers, bans, and pick status.
- Add theme support (light/dark) to match different stream branding palettes.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| CSS selectors missing in tests | Import the related CSS module in your test so hashed class names resolve (see `UserBadge.test.tsx`). |
| Donation button ignores amount | Ensure `champ-select-admin:donationAmount` contains a parseable non-negative number; invalid strings are gracefully ignored. |
| `window.open` or `localStorage` errors during tests | Mock the APIs (Vitest examples in `ChampSelect.test.tsx` and `Settings.test.tsx`). |

## License

No license has been specified. Add one before distributing builds or accepting outside contributions.

---
Happy streaming! Update this README whenever you extend the project (new components, API endpoints, deployment steps, etc.).
