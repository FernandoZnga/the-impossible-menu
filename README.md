# The Impossible Menu

## Showcase branch — no installation or build

**`copilot/showcase` is a standalone showcase branch, not intended to be merged into `main`.** The editable showcase lives in [`showcase/`](showcase/): plain HTML, CSS, and browser JavaScript, with no framework runtime, package installation, build step, backend, or CDN dependency.

### Try it

- Once the repository owner enables and deploys GitHub Pages, visit **https://fernandoznga.github.io/the-impossible-menu/**. Visitors only need a browser.
- For an offline preview, download this branch's ZIP, extract it, and double-click `showcase/index.html`. No local server or Node.js is required. Browser storage availability can differ for local files; the app falls back to in-memory records when storage is unavailable.

### Publish this branch

1. In **Settings → Pages → Build and deployment**, select **GitHub Actions**.
2. If the `github-pages` environment restricts deployments to `main`, allow **`copilot/showcase`** in **Settings → Environments → github-pages → Deployment branches and tags**.
3. In **Actions → Deploy showcase to GitHub Pages**, choose **Run workflow**, selecting **`copilot/showcase`**. Later pushes to this branch redeploy automatically.
4. Open the deployment URL from the `github-pages` environment.

The workflow uploads `showcase/` directly using GitHub's Pages actions. It does **not** run npm, TypeScript, Vite, or a build. All runtime asset paths are relative, so the same files work at the repository subpath, on another static host, or offline. Repository Pages settings are not changed automatically by this code.

**A repository has one Pages site:** deploying this showcase replaces the existing Pages deployment, if any. It does not modify `main`; a later deployment from `main` can replace the site again. This branch's workflow only deploys from `copilot/showcase` (or `showcase` if the owner later renames the branch).

### Showcase versus development

The showcase is a separately maintained, simplified demonstration of the menu experience, not a generated bundle or a promise of exact feature/measurement parity with the React application. It has six simple-mode stages and fifteen impossible-mode stages, all 12 cuisines and 120 mock mains, plus a smaller catalog of four drinks, three desserts, and two sides. Shared calculations preserve ingredient quantity adjustments, portion scaling, and protein replacement; dependency changes have recovery controls. Cooking, heat, and ice are preferences only. There is no upsell engine or persisted reflection-rating questionnaire. Nothing submits a real order or payment.

Showcase records stay on the device and use separate versioned storage from the original application. They are not interchangeable with the React study records. No third-party analytics, accounts, or remote persistence are used. These descriptive measurements are **not validated diagnoses of fatigue or proof of causation**.

The showcase storage key is `impossible-menu-showcase-v1`, with `{version: 1, sessions: [...]}`. Each record contains `id`, `mode`, `status`, `startedAt`, `endedAt`, `actions`, `changes`, `backtracks`, `optionsShown`, `conflicts`, and `activeMs`. Timestamps are ISO strings; active time is milliseconds. Statuses are `running`, `completed`, `abandoned`, and `interrupted`. `actions` and `changes` count selections that change the order; navigation is separate. Options are counted once per actual stage visit/display, including newly revealed controls. Active time excludes hidden/unfocused windows, the dashboard, and dialogs.

The dashboard keeps at most 200 visits, exports local summaries as `impossible-menu-showcase.json` or `.csv`, and clears only showcase data. Order contents and personal information are not persisted. Reloading/closing an active order records interruption; returning from browser history starts at the menu rather than restoring the order. A browser crash that prevents lifecycle events can leave a record marked `running`; it is not evidence of continued activity or a completed order.

To change the showcase, clone **this branch** and edit the files in `showcase/` directly. To develop the full React/TypeScript experiment, clone **`main`** and use its documented npm workflow. The original source, development tooling, and license remain in this branch for reference; they are not required by visitors or used by the showcase deployment.

For maintainers only, **Showcase checks** installs the existing development dependencies and runs lint and standalone browser acceptance tests; it never builds the application. The test fixture uses Python 3's standard-library static server; visitors and offline previews do not need Python. To run those checks yourself:

```sh
npm ci
npm run lint
npx playwright install chromium
npx playwright test --config e2e/showcase/playwright.config.ts
```

These tools are optional for editing/previewing the static files and are unrelated to the no-build Pages publishing workflow.

---

## Original React application — development reference

The sections below describe the original application retained in `src/`, **not the simplified standalone showcase**.

A fictional food-ordering experience that explores **choice overload, decision fatigue, and decision paralysis**. Compare a deliberately streamlined ordering flow with a much more demanding one, then reflect on the experience and inspect the measurements on your own device.

**This is an educational prototype, not a restaurant.** No real orders, payments, accounts, delivery addresses, or external analytics services are involved. Prices and nutrition are illustrative; do not use the catalog for dietary or medical decisions.

## Run locally

Use Node.js 22.12+ and npm (Node 22 LTS is used in CI and Docker).

```sh
npm ci
cp .env.example .env
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`. The `.env` copy is optional for root-path development. All `VITE_*` settings are public, embedded at build time, and must never contain secrets.

```sh
npm run build
npm run preview -- --host 127.0.0.1
```

The production output is static files in `dist/`. There is no backend, database, payment provider, API key, or external service to provision.

## Experience

- **Simple mode:** six guided stages with a small set of choices and useful defaults.
- **Impossible mode:** approximately fifteen stages with denser decisions, modifiers, recommendations, and configuration constraints.
- **Review and mock checkout:** inspect the running price, nutrition, and selected options; configuration errors must be resolved before completion.
- **Debrief:** reflect on the experience with short ratings and compare your own sessions.
- **Local dashboard:** inspect session outcomes, decision counts, active time, revisits, changes, recommendation responses, and conflicts; export records or clear the local data.

The aim is to make the contrast tangible, not to trick users into spending money. You can leave an experiment rather than complete an unwanted order.

The mock catalog covers American, Mexican, Italian, Japanese, Chinese, Korean, Indian, Thai, Mediterranean, Honduran / Central American, French, and Middle Eastern cuisines. Each cuisine has ten dishes; these are illustrative recipes rather than authoritative culinary or allergen guidance.

The running order total includes the main, side, drink, and dessert. Displayed modification deltas compare the customized main ingredients/portion with the regular unmodified main; they do not treat adding a drink or dessert as a main modification. The optional dessert offer discounts only the base dessert price at the selected portion by **10%**; toppings and sauces remain full price.

## Architecture

React and strict TypeScript provide the client UI. Vite 8 builds the application; Tailwind CSS 4 is integrated through `@tailwindcss/vite`. Domain data and pure calculation/rule logic are separate from presentation. The local analytics store manages event recording, persistence, timers, and exports. Dashboard and debrief views consume that store rather than sending data to a server.

| Area | Responsibility |
| --- | --- |
| `src/App.tsx`, `src/App.css`, `src/index.css` | Application flow, responsive presentation, shared visual language |
| `src/data/catalog.ts` | Typed mock cuisines, dishes, modifiers, beverages, and desserts |
| `src/domain/` | Ordering model, calculations, and configuration rules |
| `src/analytics/` | Local session/event records, timing, and exports |
| `src/components/` | Reusable presentation, dashboard, and debrief views |
| `src/test/setup.ts` | React Testing Library cleanup and jest-dom matchers |
| `e2e/` | Playwright browser acceptance tests |
| `vite.config.ts` | React/Tailwind plugins and configurable public base path |
| `vitest.config.ts` | jsdom unit/component tests, isolated from browser tests |
| `playwright.config.ts` | Chromium and the local Vite test server |

Reuse the typed catalog and pure price/nutrition/rule functions in UI and tests; do not duplicate their logic in components.

The domain API exposes `createOrder()` from the catalog, `calculateOrder()` and `beverageOptionDelta()` from `src/domain/calculate.ts`, and `resolveOrder()`, `beverageSuggestion()`, and the declarative `rules` from `src/domain/rules.ts`. Shared order/session-mode types live in `src/domain/model.ts`. `resolveOrder()` returns the resolved order and recoverable conflicts; calculations consume resolved configuration rather than maintaining a separate rule implementation.

## Local measurements and privacy

An anonymous, random participant ID links sessions **only within the same browser origin**. There is no login, fingerprinting, cross-device identity, or network upload. Browser storage is not encrypted and is accessible to people or scripts with access to the same browser origin. Do not enter personal information into experiment data.

Storage uses `impossible-menu.analytics.v1` for versioned session records and `impossible-menu.participant.v1` for the local participant ID. If storage is unavailable, recording falls back to memory and may be lost on reload. The dashboard's clear action removes sessions but retains the participant ID; clearing browser site data removes both. A session interrupted by reload or closing the page is distinguishable from deliberate abandonment.

A back/forward-cache restoration can resume its own live, page-hidden session without counting frozen time. It does not revive completed, manually abandoned, cleared, or superseded runs. Starting a new run interrupts an existing in-progress run rather than recording a false manual abandonment.

### Session schema

Each session records:

- `id`, `participantId`, `mode`, `status`, `startedAt`, `endedAt`, and current `step`;
- `totalMs`, `activeMs`, and `activeByStep`;
- `decisionsPresented`, `decisionsMade`, `optionChanges`, and `revisits`;
- `recommendationsShown`, `recommendationsAccepted`, `recommendationsRejected`, and `conflicts`;
- the ordered `events` list and debrief `ratings`.

Statuses distinguish `in_progress`, `completed`, `abandoned`, and `interrupted`. Time values are milliseconds; event and start/end timestamps are Unix milliseconds. Active time counts only while the page is visible and focused. It is an approximation of engagement, not a measurement of attention.

`decisionsPresented` is an **options-presented proxy**: the UI counts available alternatives for each first-seen stage/configuration, including newly revealed conditional controls. The store's `present()` method adds options on every call; callers invoke it once per actual display occurrence, and the UI uses a `Set` to deduplicate rerenders. It is not a claim about the number of psychological decisions made. `decisionsMade` counts actual selection actions; navigation does not count as a decision. Interpret these measures in context rather than as validated cognitive-load scores.

Each event has `id`, `sessionId`, `type`, `step`, `timestamp`, and optional structured `detail`. Event types are:

```text
experiment_started        mode_selected
cuisine_selected          dish_selected
ingredient_modified       suggestion_accepted
suggestion_rejected       configuration_conflict
previous_step_revisited    decision_reversed
validation_error          checkout_started
order_completed           experiment_abandoned
decision_made             recommendation_shown
visibility_changed        focus_changed
session_interrupted
```

Debrief ratings use the IDs `difficulty`, `mentalEffort`, `frustration`, `satisfaction`, and `reuseLikelihood`, each an integer from 1 to 5.

Use the dashboard's **JSON export** (`impossible-menu-analytics.json`) for nested session/event data and **CSV export** (`impossible-menu-analytics.csv`) for session summaries. CSV includes serialized per-step timing and ratings, but not individual events; cells are quoted and protected against spreadsheet formulas. Both exports include **all** local sessions, irrespective of the dashboard mode filter. Exports are downloaded locally; sharing a file is a separate, deliberate action. Review and anonymize files before sharing. Clearing local data cannot delete copies already downloaded or shared.

### Study caveat

This is a demonstration, **not a validated psychological instrument or controlled study**. Time, revisits, and changes are descriptive behavioral proxies and do not establish fatigue, paralysis, or causation. Learning effects, mode order, familiarity, accessibility needs, interruptions, and the deliberately unequal flows can affect results. Local participant IDs do not prove unique people. Browser closures and storage restrictions can lose events. Do not make population-level claims from the dashboard; a real study needs consent, an appropriate protocol, counterbalancing, and analysis beyond this MVP.

## Tests and checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

On a fresh Linux machine, use `npx playwright install --with-deps chromium` to install required system libraries too. Playwright starts Vite at `http://127.0.0.1:4173`; free that port before running tests. Tests use desktop Chromium by default. Use `npx playwright show-report` to inspect `playwright-report/`. Browser traces and screenshots are retained on failures; unit/component tests are selected by `src/**/*.test.{ts,tsx}`. `npm run test:watch` starts Vitest interactively.

CI runs clean installation, lint, TypeScript checks, unit/component tests, production build, Chromium installation, and browser tests. Failed browser reports are uploaded as a short-lived GitHub Actions artifact.

## Docker

```sh
docker compose up --build -d
# Open http://localhost:8080
docker compose down
```

Or build and run directly:

```sh
docker build -t impossible-menu .
docker run --rm -p 8080:80 impossible-menu
```

The multi-stage image builds with `node:22-alpine` and serves only static output using `nginx:stable-alpine`. Nginx provides SPA fallback, long caching for hashed `/assets/` files, fresh HTML, a restrictive content-security policy, and defensive browser headers. Root-path hosting is the default. Put production HTTPS/TLS at your reverse proxy or hosting layer; the container itself serves HTTP. Browser local data remains in the visitor's browser, not inside the container.

## Original application's static hosting

This branch publishes the standalone showcase using the instructions at the top of this README. To build the retained React application for a separate static host, use:

```sh
VITE_BASE_PATH=/your-subpath/ npm run build
```

Base paths must begin and end with `/`. Set `/` for a root deployment. Changing this variable after building does not alter existing static output. The application uses in-page navigation rather than requiring a server router.

## Screenshots

No screenshots are required to run the application. To document a change:

1. Start the app and use a fresh browser profile or clear local experiment data.
2. Capture the landing view, a representative simple/impossible stage, and the debrief/dashboard.
3. Capture desktop and mobile viewport sizes; avoid hover-only states and wait for fonts/layout to settle.
4. Do not capture personal browser information or participant exports. Label screenshots with mode, stage, and viewport.
5. Attach images to the pull request or use a project documentation asset directory if they should be versioned.

## Limitations and contributing

There is no production ordering, payment processing, account system, server persistence, multi-user analytics, or cross-device synchronization. All food imagery, options, prices, and nutrition are mock educational content. The prototype should be reviewed with keyboard, screen-reader, zoom, and mobile testing; automated tests do not constitute a full accessibility audit.

See [AGENTS.md](AGENTS.md) for contributor guidance. Keep mock interactions explicit, avoid manipulative additions, and preserve the privacy-first local-only design. The repository's existing [LICENSE](LICENSE) applies.
