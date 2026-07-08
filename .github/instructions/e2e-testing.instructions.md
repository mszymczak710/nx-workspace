---
applyTo: 'apps/brainiacs-e2e/**/*.ts,apps/invoice-generator-e2e/**/*.ts'
---

Conventions for this workspace's Playwright e2e suites (one `<app>-e2e` project per app), built with the
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
  playwright.config.mts
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

- Every API request is intercepted and mocked via `page.route()` (see the suite's `src/mocks/*.mock.ts`),
  so the suite is deterministic, fast, and runnable without any real backend/database available or in
  any particular data state. Each `<app>-e2e` project in this workspace follows this strategy.
- If a suite genuinely needs to run against a real/locally-served backend that persists mutations
  instead, tests that create/update/delete data must leave it as they found it (`test.afterEach`
  cleanup, or restore/reset the backing store before the run) so the suite stays idempotent and
  re-runnable.
- Each test must be runnable in isolation and in any order — no test should depend on state left
  behind by another.

# Config (`playwright.config.mts`)

- Set `baseURL` and use `webServer` to auto-start the app before the run, instead of requiring it to
  already be running.
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
npx nx e2e <app>-e2e

npx nx e2e <app>-e2e --ui       # interactive/debug mode
npx nx e2e <app>-e2e --headed   # watch the browser
```

Run `npx nx show project <app>-e2e --json` (or check `apps/`) for the exact `<app>-e2e` project names in
this workspace.

# CI

The `e2e-test` job in [.github/workflows/ci.yml](../workflows/ci.yml) runs
`nx affected --target=e2e` independently of the other jobs (no backend/service-container setup needed)
— the `webServer` hook in each project's `playwright.config.mts` starts the app itself before tests run.
