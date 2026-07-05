---
applyTo: 'apps/brainiacs-e2e/**/*.ts,apps/invoice-generator-e2e/**/*.ts'
---

Conventions for the Playwright e2e suites (`brainiacs-e2e`, `invoice-generator-e2e`), built with the
**Page Object Model (POM)**. See [AGENTS.md](../../AGENTS.md) for the wider repo overview and
[unit-testing.instructions.md](unit-testing.instructions.md) for unit tests — the two are not interchangeable:
e2e specs use Playwright's own `test`/`expect` from `@playwright/test`, never Vitest globals or
`TestBed`.

# Layout

```
apps/<app>-e2e/
  src/
    pages/            # one Page Object class per page / major reusable UI area
      <feature>.page.ts
    fixtures.ts        # test.extend(...) wiring POM instances into `test`
    <feature>.spec.ts  # one spec file per user-facing flow
  playwright.config.ts
```

Mirror the app's own component composition in the POM layer: if a list component renders repeated row
components, model that as a `<Feature>Page` exposing a `row(index)` method that returns a
`<Feature>RowComponent` POM, rather than one flat page class with every locator inlined.

# Page objects

- One class per page/dialog/major component. Constructor takes the Playwright `Page` and builds all
  locators as `readonly` properties — don't query the DOM lazily inside every method.
- Prefer role/label/text-based locators (`page.getByRole(...)`, `getByLabel(...)`, `getByText(...)`)
  over CSS selectors or `data-testid`. This is deliberate: if a locator can only be found by CSS class,
  that's usually also an accessibility gap (see [accessibility.instructions.md](accessibility.instructions.md)).
  Reach for `data-testid` only when an element genuinely has no accessible role or name.
- Expose **intention-revealing action methods** (`create()`, `fillForm(data)`, `submit()`), not raw
  locators — specs should read as user stories, not DOM plumbing. Only expose a locator directly when
  the spec needs to assert on it (e.g. `get errorAlert()`).
- POM methods perform actions and return data/locators; they do not contain `expect(...)` assertions.
  Assertions belong in the spec files.

# Fixtures

- Wire POM instances through a shared `fixtures.ts` using `test.extend<{ featurePage: FeaturePage }>({...})`,
  and import `test`/`expect` from that file in specs — don't hand-construct `new FeaturePage(page)` in
  every test.

# Test independence & data

- `brainiacs-e2e` depends on the separately-running `brainiacs-backend`; don't write tests that assume
  specific pre-existing rows beyond what the test itself creates/seeds. Prefer creating and cleaning up
  a test's own data over relying on backend fixture state. For flows that don't need real persistence,
  consider mocking responses with `page.route()` to keep the test deterministic and fast; reserve a
  smaller set of true full-stack tests for the critical paths.
- `invoice-generator-e2e` runs against `json-server` backed by `db.json`, which persists mutations to
  disk. Tests that create/update/delete data must leave it as they found it (`test.afterEach` cleanup,
  or restore/reset `db.json` before the run) so the suite stays idempotent and re-runnable.
- Each test must be runnable in isolation and in any order — no test should depend on state left behind
  by another.

# Config (`playwright.config.ts`)

- Set `baseURL` and use `webServer` to auto-start the app (and `json-server` for
  `invoice-generator-e2e`) before the run, instead of requiring it to already be running.
- `retries` on CI only, `trace: 'on-first-retry'`.
- Start with the `chromium` project only unless cross-browser coverage is explicitly required — keep
  the suite fast.

# Waiting & assertions

- Rely on Playwright's auto-waiting, web-first assertions: `await expect(locator).toBeVisible()`,
  `toHaveText(...)`, etc. Never use `page.waitForTimeout()`.
- When a flow depends on a specific request completing, wait for it explicitly
  (`page.waitForResponse(...)`, `page.waitForURL(...)`) instead of guessing a delay.

# Accessibility scans

- Wire `@axe-core/playwright` into a shared helper (e.g. `expectNoA11yViolations(page)` in a test
  utils file) that runs `new AxeBuilder({ page }).analyze()` and asserts `violations` is empty, then
  call it once per **major flow** (a page's initial render, a dialog once open) — not in every single
  test, or the suite slows down for redundant coverage of the same DOM state.
- A passing scan is not a substitute for the manual keyboard/screen-reader checks in
  [accessibility.instructions.md](accessibility.instructions.md) — axe catches missing labels, contrast,
  and some ARIA misuse, but not focus order, keyboard operability, or whether an announcement actually
  makes sense read aloud.

# Running

```sh
npx nx e2e brainiacs-e2e
npx nx e2e invoice-generator-e2e

npx nx e2e brainiacs-e2e --ui       # interactive/debug mode
npx nx e2e brainiacs-e2e --headed   # watch the browser
```

Per [README.md](../../README.md): `brainiacs-e2e` needs `brainiacs-backend` running (or the
`webServer` hook driving it); `invoice-generator-e2e` needs `json-server` serving the expected
`db.json`.

# CI

The e2e job in [.github/workflows/ci.yml](../workflows/ci.yml) starts the required backend(s) first
(service container / `json-server` step, or the `webServer` hook in `playwright.config.ts`) before
running `nx affected --target=e2e` (or `nx e2e <project>` for a full run).
