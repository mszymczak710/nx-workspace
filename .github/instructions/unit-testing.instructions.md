---
applyTo: 'apps/brainiacs/**/*.spec.ts,apps/invoice-generator/**/*.spec.ts,libs/**/*.spec.ts'
---

These are the **unit test** conventions for this Nx/Angular workspace (Vitest + `TestBed`). Follow
them when writing or modifying `*.spec.ts` files under `apps/brainiacs`, `apps/invoice-generator`, or
`libs/`, so new specs read like the existing ones. See [AGENTS.md](../../AGENTS.md) for the wider
repo overview. For Playwright/e2e specs under `apps/*-e2e`, see
[e2e-testing.instructions.md](e2e-testing.instructions.md) instead — these two do not overlap and are not
interchangeable.

# Stack

- Test runner: **Vitest**, executed through Nx (`nx test <project>`) — never invoke `vitest`
  directly. The underlying executor differs by project; see "Coverage & running" below.
- Import test globals explicitly from `vitest` (`describe`, `it`, `beforeEach`, `afterEach`, `expect`,
  `vi`, plus types like `Mock`, `MockInstance` when needed). Don't rely on implicit globals.
- Angular testing via `TestBed` / `ComponentFixture` from `@angular/core/testing`.
- i18n: use `getTranslocoModule()` from `@libs/shared/core/testing` in the `imports` array instead of
  hand-rolling a Transloco test setup.

# File layout & naming

- Co-locate specs with the file under test: `foo.ts` → `foo.spec.ts` in the same directory.
- `describe` block name = the class/function/interceptor name (e.g. `describe('SomeComponent', ...)`,
  `describe('someInterceptor', ...)`).
- `it` descriptions are full sentences starting with "should", describing observable behavior, not
  implementation (`'should disable the button when loading is true'`, not `'sets disabled = true'`).
- Use `it.each([...])` for repeated assertions over a small matrix of inputs, e.g.:
  ```ts
  it.each([
    ['showSuccess', 'success'],
    ['showError', 'error']
  ] as const)('%s should call the underlying %s method', (serviceMethod, toastMethod) => {
    // ...
  });
  ```

# Structure of a spec

```ts
describe('Thing', () => {
  let component: Thing; // or `service`
  let fixture: ComponentFixture<Thing>; // components only
  let dependencyMock: { method: Mock };

  beforeEach(async () => {
    dependencyMock = { method: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Thing, getTranslocoModule()],
      providers: [{ provide: Dependency, useValue: dependencyMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(Thing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

- **Use `await fixture.whenStable()`, never `fixture.detectChanges()`**, after `createComponent`, after
  DOM events that trigger signals/async work, and before asserting on the rendered DOM. See below for
  why.
- When a component test needs different setup per test (e.g. a store value set before creation), pull
  `TestBed` configuration into a local `setup()` helper called explicitly at the top of each `it`
  instead of always doing it in `beforeEach`.
- Extract repeated DOM interaction sequences into small local helper functions (e.g. `fillForm`,
  `submitForm`, `selectFile`) rather than duplicating querySelector calls across tests.

# Zoneless testing

- This workspace is **zoneless** (`zone.js` is not a dependency anywhere — see
  [angular.instructions.md](angular.instructions.md)). `fixture.whenStable()` is Angular's
  zoneless-aware stability API and is what actually waits for pending signal/async work here;
  `fixture.detectChanges()` doesn't reliably do that in a zoneless app, so don't use it.
- Don't reach for `fakeAsync`/`tick()` — they're zone.js-based and don't apply to a zoneless app. If a
  test needs deterministic control over timers, use Vitest's own `vi.useFakeTimers()` /
  `vi.advanceTimersByTimeAsync()` instead.

# Mocking

- Mock dependencies with plain object literals typed inline, using `vi.fn()` per method — do not
  reach for a mocking library or `jasmine`-style spies:
  ```ts
  let dialogRefMock: { close: Mock; dismiss: Mock };
  dialogRefMock = { close: vi.fn(), dismiss: vi.fn() };
  { provide: SomeDialogRefToken, useValue: dialogRefMock }
  ```
  The same technique applies regardless of what's being mocked — an injected dialog reference, an
  HTTP-backed service, a UI-kit token — always a plain object with `vi.fn()` methods via `useValue`.
- For signal-based store/service dependencies, mock the signal itself with `signal(...)` and provide
  the mock object via `useValue` (e.g. a store exposing `selectedItem: signal<Item | null>(null)`).
- Reset/restore global stubs in `afterEach` (`vi.unstubAllGlobals()`) whenever a test uses
  `vi.stubGlobal` (e.g. stubbing a browser global like `Image` or `ResizeObserver`) or `vi.spyOn` on a
  global (`window.confirm`).
- Prefer `vi.spyOn(object, 'method')` over reassigning methods directly when you still need the real
  implementation to run for other calls.

# HTTP

- Use `provideHttpClient()` + `provideHttpClientTesting()` and inject `HttpTestingController`.
- Assert on the request via `httpTestingController.expectOne(url)` and check
  `req.request.method` / `req.request.headers` as needed; respond with `req.flush(...)`.
- Use `httpTestingController.expectNone(...)` to assert no request was made.
- Always call `httpTestingController.verify()` — either in `afterEach` (interceptor specs) or at the
  end of the relevant test (component specs), to catch unexpected outstanding requests.

# DOM interaction

- Query with `fixture.nativeElement.querySelector(...)`, typed as the concrete HTML element
  (`HTMLInputElement`, `HTMLButtonElement`, `HTMLFormElement`).
- Set input values via a small helper that sets `.value` and dispatches an `Event('input')`; submit
  forms by dispatching `Event('submit', { cancelable: true })` on the `<form>`, not by calling
  component methods directly, when the behavior under test is template-driven.
- Assert user-visible state (`button.disabled`, presence/absence of an element) rather than internal
  component fields when the behavior is DOM-facing.
- For Angular Material components (`invoice-generator`), prefer a **component test harness** from
  `@angular/cdk/testing` (e.g. `TestbedHarnessEnvironment.loader(fixture)` + `MatButtonHarness`,
  `MatDialogHarness`, ...) over raw `querySelector` on Material's internal DOM. Harnesses interact
  through the same public API a user would (click, type, read text) and stay stable across Material's
  internal markup changes; a raw selector into `.mat-mdc-*` classes does not.

# Snapshot testing

- Snapshot infrastructure is wired in (`@analogjs/vitest-angular/setup-snapshots` in
  [test-setup.ts](../../libs/shared/core/src/test-setup.ts)) but nothing currently uses
  `toMatchSnapshot()` — there's no established convention to follow yet, so set one deliberately rather
  than defaulting to "snapshot the whole component." If you do add a snapshot: scope it to a small,
  meaningful fragment (e.g. one computed label, one rendered row), not an entire component's DOM tree —
  a whole-component snapshot breaks on any unrelated markup change and stops being a meaningful
  assertion. Commit the generated `.snap` file and review diffs on every change, don't blindly
  update-and-commit.

# Coverage & running

- Run the specific project's tests while iterating: `npx nx test <project>` (or `npm run test:brn` /
  `test:klg`; there's no direct npm script for `core`, use `npx nx test core`).
- Coverage behavior differs by project — don't assume it's always on:
  - `brainiacs`/`invoice-generator` use the `@angular/build:unit-test` executor, for which `nx.json`
    `targetDefaults` forces `coverage: true` — plain `npx nx test brainiacs` already writes to
    `coverage/apps/brainiacs` with no extra flags.
  - `core` gets its `test` target from the `@nx/vitest` Nx plugin instead (no executor override in its
    `project.json`), which is **not** covered by that same `targetDefaults` entry — `npx nx test core`
    alone produces no coverage output. Pass `--coverage` explicitly (`npx nx test core --coverage`) or
    use `npm run test:coverage` (which passes `--coverage` to every project via
    `nx run-many --target=test --all --coverage`) to get it, same as CI does.
- A change is not done until its project's test target passes: `npx nx test <affected-project>`.
- New or changed public behavior (component inputs/outputs, service methods, interceptors, utils)
  needs a corresponding spec — don't rely solely on type-checking or manual verification.
