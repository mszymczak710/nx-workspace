---
applyTo: 'apps/brainiacs/**/*.ts,apps/invoice-generator/**/*.ts,libs/**/*.ts'
---

Angular good-practice conventions for this workspace, beyond what ESLint already enforces (naming,
member ordering, `no-explicit-any`, arrow-function preference, etc. — see
[eslint.config.mjs](../../eslint.config.mjs), not restated here). See [AGENTS.md](../../AGENTS.md) for
the wider repo overview. Scoped to `apps/brainiacs`, `apps/invoice-generator`, and `libs/` only —
deliberately excludes `apps/*-e2e`, which is plain TypeScript (Playwright Page Objects), not Angular
code; see [e2e-testing.instructions.md](e2e-testing.instructions.md) for that.

These patterns are universal across the workspace (they don't depend on which UI kit an app uses —
see [AGENTS.md](../../AGENTS.md)'s per-app stack table for that split, which only matters for
[accessibility.instructions.md](accessibility.instructions.md) and
[styling.instructions.md](styling.instructions.md)).

# Components

- Standalone components only, always `ChangeDetectionStrategy.OnPush`, dependencies via `inject()`
  (never constructor injection) — this is ESLint-enforced, not a suggestion.
- Model local state with `signal()` and derived state with `computed()` instead of a plain method that
  re-derives the value on every change-detection pass — e.g. an `isValid`/`hasUnsavedChanges` computed
  from a couple of underlying signals, not a getter method doing the same work repeatedly.
- Use the signal-based component boundary APIs — `input()`, `model()`, `output()`, `viewChild()`,
  `viewChildren()` — not `@Input()`/`@Output()`/`@ViewChild()` decorators.
- Side effects that must react to signal changes go in `effect()`; anything that needs teardown uses
  the `onCleanup` callback — e.g. an `effect()` that kicks off an HTTP call whenever an input signal
  changes must cancel/unsubscribe that call in `onCleanup`, not rely on a manually-tracked subscription
  field that's never cleaned up.
- Split smart/container components (own store/service access, own state) from presentational ones
  (inputs/outputs only) — e.g. a feature container owns the store and passes data down to a table
  component, which passes each row down to its own row component; don't put store/service access in a
  presentational leaf component.
- Keep `@Component({...})` metadata in a consistent order: `selector`, `imports`, `templateUrl`,
  `styleUrl` (if any), `changeDetection`. Every component in this workspace already follows this order
  — don't reshuffle it for a new one.

# Member ordering

ESLint's `member-ordering` only enforces the coarse grouping (static fields → instance fields → static
methods → instance methods — see [eslint.config.mjs](../../eslint.config.mjs)). Within that, order
class members like this:

- Instance fields, in dependency order: injected dependencies (`inject()`) first, then local reactive
  state (`signal()`, `input()`, `model()`, `viewChild()`/`viewChildren()`), then derived state
  (`computed()`) — each group generally depends on the one before it, so this also reads top-to-bottom
  as "inputs → state → derived state".
- Within each of those groups (and within methods too), order by visibility: `private` → `protected` →
  `public`. Existing methods aren't always this strict — they're sometimes grouped by related
  functionality instead — so don't feel obligated to reshuffle a whole file for this, but apply it to
  new members.
- Declare every signal-holding field `readonly` — an injected dependency, a `signal()`/`computed()`,
  an `input()`/`model()`, a `viewChild()` — the _reference_ is never reassigned, only the value inside
  it (via `.set()`/`.update()`, or never, for `computed()`). `@typescript-eslint/prefer-readonly` will
  flag most misses, but write it `readonly` the first time rather than relying on the linter to catch
  it.

# Zoneless change detection

- This workspace runs **zoneless**: `zone.js` is not a dependency anywhere (not in `package.json`, not
  installed), and no app config loads it. Angular does **not** auto-run change detection after async
  callbacks, timers, or DOM events the way a zone-based app does.
- Practical consequence: state that should update the UI **must** flow through a signal (`signal()`,
  `computed()`, a `signalStore`, `input()`/`model()`). A plain class field mutated outside a signal (or
  a manual `markForCheck()`-free side effect) will silently fail to re-render — this is why `OnPush` +
  signals aren't just a style preference here, they're required for the UI to update at all.
- This is also why tests use `await fixture.whenStable()` rather than `fixture.detectChanges()` — see
  [unit-testing.instructions.md](unit-testing.instructions.md).

# Templates

- Use built-in control flow (`@if`, `@for`, `@switch`) — never `*ngIf`/`*ngFor`.
- Never negate an async pipe result (`!(x | async)`); read it into a local binding via `@if` instead.
- Self-close a component/element tag when it has no projected content:
  `<child-component [value]="value()" />`, not `<child-component [value]="value()"></child-component>`.
  This workspace already applies this consistently — keep doing it for every new usage.
- Order attributes/bindings on a tag consistently: plain attributes (`id`, `class`, `type`, ...) first,
  then property/two-way bindings (`[x]`, `[(x)]`), then event bindings (`(x)`) last — e.g.
  `<button type="button" [disabled]="isDisabled()" (click)="onClick()">`. Most of the codebase already
  follows this; a few call sites interleave a static attribute between bindings — treat those as
  legacy to tidy up when touched, not a pattern to copy.

# Interceptors, guards & resolvers

- Write HTTP interceptors, route guards, and route resolvers as **functions**
  (`HttpInterceptorFn`, `CanActivateFn`/`CanDeactivateFn`, `ResolveFn`), registered via
  `provideHttpClient(withInterceptors([...]))` / the `canActivate`/`resolve` route config — not as
  classes implementing `HttpInterceptor`/`CanActivate`/`Resolve`. Both interceptors in this workspace
  already follow this (`HttpInterceptorFn` + `inject()` inside the function body); do the same for any
  new interceptor, guard, or resolver.

# Forms

- This workspace uses the **signal forms** API (`@angular/forms/signals`: `form()`, `FormField`,
  `FormRoot`, and validators like `required`/`pattern`/`maxLength`/`email`) — not
  `ReactiveFormsModule`/`FormGroup`/`FormBuilder`. Model form state as a plain `signal()`, define
  validation in the second argument to `form()`, and wire submission through the
  `submission.action`/`onInvalid` options.
- Centralize failed-save → field-error mapping in one small utility per app (a
  `mapHttpErrorToSubmitErrors`-style helper that turns a failed save's HTTP error into per-field submit
  errors) instead of hand-rolling that mapping inline in every form component.
- On invalid submit, focus the first invalid field
  (`field().errorSummary()[0]?.fieldTree().focusBoundControl()`) — required for accessibility, see
  [accessibility.instructions.md](accessibility.instructions.md).

# State management

- Cross-component state lives in `@ngrx/signals` stores (`signalStore`), one per domain (e.g. a
  `UserStore`): `withState` for scalar fields, `withEntities` for collections,
  `withMethods` for actions, `patchState` to update — never mutate state directly.
- Wrap async loads with `rxMethod` + `tapResponse` (split `next`/`error`) + `finalize` to reset loading
  flags. Use `exhaustMap` for "reload/refresh" actions that should ignore concurrent triggers, and
  `switchMap`/`tap` for save chains that must run in sequence (e.g. save entity → upload a related file
  → toast → reload the list). Keep this shape consistent across stores instead of inventing a new async
  pattern per store.
- Components read store state directly as signals (e.g. `this.store.selectedItem`) and call store
  methods for mutations — don't copy store state into component-local signals.

# Error handling

- Generic HTTP errors are already handled globally by a shared interceptor + toast service in
  `libs/shared/core` — don't add a per-call `catchError` + toast in a service/component just to show a
  generic failure message. Only add local handling when the request needs field-level or
  flow-specific behavior (e.g. mapping submit errors onto form fields, per the Forms section above).

# Subscriptions & cleanup

- Prefer signals / `rxMethod` / `toSignal()` over manual `.subscribe()`. Where a manual subscription is
  genuinely needed:
  - Inside an `effect()`, tie its teardown to that `effect`'s `onCleanup`.
  - Anywhere else (e.g. a `.subscribe()` triggered by a user action, not by a signal change), pipe it
    through `takeUntilDestroyed(this.destroyRef)` (from `@angular/core/rxjs-interop`) so Angular
    unsubscribes it automatically on destroy — this workspace already does this for one-off
    fire-and-forget subscriptions. Don't leave a subscription running past the component/effect's
    lifetime either way.

# Bundle size

- Lazy-load routes/features (`loadComponent`/`loadChildren`). Production budgets are enforced per app
  in `project.json` (500kb warn / 1mb error initial bundle, 4kb/8kb per component style) — keep new
  features within that rather than waiting for CI to flag a budget overrun.

# A note on "core" as a folder name

- Both `apps/brainiacs/src/app/core` and `apps/invoice-generator/src/app/core` (an app-local "core"
  folder for app-wide singletons — services, interceptors, types, utils) and `libs/shared/core` (the
  actual shared Nx library, imported as `@libs/shared/core`) exist in this workspace and are named
  `core` — but they are unrelated. Per the module boundaries in [AGENTS.md](../../AGENTS.md), an app's
  own `src/app/core` is **not** importable from another app; only `libs/shared/core` is meant to be
  reused across `brainiacs` and `invoice-generator`. If something under an app's own `core` folder
  needs to be shared, promote it into `libs/shared/core` rather than importing across the app boundary.

# Enums

- Avoid TypeScript's native `enum` (and `const enum`) — prefer a `const` object literal with
  `as const` plus a derived union type via `typeof X[keyof typeof X]`, e.g.:

```typescript
export const HttpMethod = {
  Get: 'GET',
  Post: 'POST',
  Put: 'PUT',
  Patch: 'PATCH',
  Delete: 'DELETE'
} as const;

export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod];
```

This keeps the values tree-shakeable (a real `enum` emits a runtime object even when none of its
members are used), avoids numeric-enum footguns (reverse mapping, non-exhaustive numeric values,
accidental structural typing across unrelated numeric enums), and produces a type that's a plain
string/number union — easier to narrow in a `switch`, serialize over HTTP, and compare with `===`
than a TypeScript enum member.

- Key casing is PascalCase (`Get`, `Post`, ...) for ergonomic access (`HttpMethod.Get`); the _value_
  is whatever casing the external contract expects (e.g. `'GET'` for an HTTP method, since that's what
  actually goes over the wire).
- Existing native `enum` usages aren't required to be migrated on sight — treat them as legacy to
  convert when you're already touching that file, not a repo-wide cleanup task.
