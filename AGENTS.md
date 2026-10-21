# Contributor guidance

## Scope and architecture

- This is a local-first educational React/TypeScript experiment, not a real ordering service. Preserve the existing license.
- Keep the catalog in `src/data/catalog.ts`, model/calculation/rule code in `src/domain/`, measurement logic in `src/analytics/`, and presentation in React components.
- Reuse typed data, calculation helpers, and rule evaluation across views. Do not add competing totals, nutrition calculations, or conflict rules in UI code.
- Use strict TypeScript, explicit domain types, stable IDs, and deterministic pure functions. Avoid `any` and unnecessary dependencies.
- Keep UI state transitions understandable: validation, back navigation, changed selections, abandonment, and completion must leave consistent state.

## Data and configuration rules

- Treat all menu content as mock data. Prices/nutrition must remain visibly illustrative.
- Give new catalog records unique stable identifiers and the fields required by the model. Update related tests and catalog relationships together.
- Add compatibility rules to the central rule evaluator, with readable explanations and a way to recover. Keep impossible mode challenging but completable.
- Validate incompatible options before mock checkout. Handle defaults, deleted/changed upstream choices, and missing optional selections without crashing.
- Prefer integer minor currency units and shared formatting helpers where the domain model supports them; do not silently change model units.

## Events, timing, and privacy

- Reuse the analytics store instead of writing directly to storage from components. Maintain its versioned schema and validate stored data defensively.
- Record actual user transitions once, not React rerenders. Keep event types and counter semantics consistent with exports and README.
- `present()` accumulates options on every call. Deduplicate display occurrences in the UI, including dynamically revealed controls; do not count navigation as a decision or suppress real option displays in the store.
- Preserve hidden/unfocused time exclusion, cleanup of timers/listeners, and the distinction between completion, deliberate abandonment, and interruption.
- Do not add third-party analytics, accounts, remote persistence, tracking pixels, or personal data. Never place secrets in `VITE_*`, client code, fixtures, or documentation.
- Export only deliberately requested local data; guard CSV cells against spreadsheet formula execution and revoke generated download URLs.
- If the event/session schema changes, update persistence validation, CSV/JSON exports, tests, and documentation together. Provide migration or explicit version handling.

## Accessibility and presentation

- Use semantic headings, real buttons and labels, and accessible names for icon-only controls. Do not substitute clickable generic elements.
- Ensure all decisions, navigation, dialogs, and export/reset controls are usable by keyboard. Provide visible focus, logical tab order, and recoverable validation messages.
- Do not rely on color alone for selection, nutrition, errors, or state. Respect reduced motion and keep targets readable and usable on narrow screens.
- Keep running totals and important errors understandable to assistive technology without announcing every incidental rerender.
- Do not hide an exit, falsely imply urgency, or accidentally submit a real order/payment.

## Tests and verification

Use the existing tooling rather than adding a parallel test/lint stack:

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

- Unit/component tests belong in `src/**/*.test.ts` or `.test.tsx`; Vitest uses jsdom and React Testing Library. `src/test/setup.ts` installs jest-dom matchers and cleans up after each test.
- Cover calculations, modifier boundaries, conflicts and recovery, both mode flows, analytics event/counter consistency, unavailable/corrupt storage, and export safety as appropriate.
- Browser acceptance tests belong in `e2e/`; Playwright starts the local Vite server on port 4173. Install Chromium with `npx playwright install chromium` if missing.
- Test visible behavior and accessible roles rather than incidental CSS or internal component state. Keep time/randomness controllable in measurement tests.
- Run targeted tests first, then relevant broader checks. Review keyboard navigation and mobile layout manually when changing the experience.

## Deployment

- Vite integrates React and Tailwind; `VITE_BASE_PATH` defaults to `/`. Test subpath builds when changing asset references.
- Pages builds at `/the-impossible-menu/`; Docker uses `/` and Nginx SPA fallback. Do not hard-code root-relative public asset paths that break Pages.
- Preserve the Nginx security headers and hashed-asset cache behavior; HTML should not be cached long term.
- Keep workflow permissions minimal. Check dependencies/actions for advisories before adding or changing them, and prefer immutable action revisions when available.
- Never commit build output, dependencies, `.env` secrets, browser reports, or participant exports.

## Documentation

Document only behavior implemented in the code. If adding a step, rule, measurement, storage field, or deployment requirement, update README and relevant tests. Preserve the study caveat: these descriptive measurements are not validated diagnoses of fatigue or proof of causation.
