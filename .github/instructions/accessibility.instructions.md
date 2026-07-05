---
applyTo: 'apps/brainiacs/**/*.html,apps/brainiacs/**/*.ts,apps/invoice-generator/**/*.html,apps/invoice-generator/**/*.ts,libs/**/*.html,libs/**/*.ts'
---

Accessibility conventions for this workspace, targeting **WCAG 2.1 AA**. Apply these when writing or
reviewing templates/components, not just when someone explicitly asks for "a11y work" — accessibility
regressions are usually introduced incidentally. See [AGENTS.md](../../AGENTS.md) for the wider repo
overview and [angular.instructions.md](angular.instructions.md) for general component conventions.
Scoped to the two apps' source and `libs/` — deliberately excludes `apps/*-e2e` (Playwright specs,
covered by [e2e-testing.instructions.md](e2e-testing.instructions.md); those tests _verify_ a11y via
`@axe-core/playwright`, they don't need these authoring rules applied to themselves).

Written by **technology**, not by app — the "Modals & dialogs" section below has one subsection per
UI kit (ng-bootstrap, Angular Material); apply whichever one matches the app you're in. See
[AGENTS.md](../../AGENTS.md)'s per-app stack table for which app uses which. Everything else applies
equally regardless of UI kit.

# Semantic structure

- Use native elements for their built-in semantics/keyboard behavior (`button`, `nav`, `header`,
  `main`, `table` + `th scope`) instead of `div`/`span` with a click handler bolted on.
- One `<h1>` per view; keep heading levels sequential (don't skip a level purely for visual size —
  style with CSS instead).
- Expose landmarks: the root layout should have a `<nav>` for the navbar and a `<main>` wrapping the
  routed content (`<router-outlet>`). `brainiacs`' layout currently renders navbar + `<router-outlet>`
  with no `<main>` around it — treat that as a real gap to fix when touched, not a pattern to copy.
- Provide a "skip to main content" link as the first focusable element on the page (visually hidden
  until focused), so keyboard users can bypass the navbar instead of tabbing through it on every page.
  This is currently missing — add it alongside the `<main>` landmark above when touching the layout.

# Forms

- Every input has a programmatically associated label: `<label for="email">Email</label>` matching
  `<input id="email">`. Never rely on `placeholder` alone as the label.
- Mark required fields with the native `required` attribute (and/or `aria-required="true"`), not just a
  visual asterisk.
- Associate validation errors with their field via `aria-describedby`, and give dynamically-appearing
  error containers `role="alert"` or `aria-live="polite"` so screen readers announce them without a
  page reload.
- On invalid submit, move focus to the first invalid field or the error summary. The signal-forms API
  supports this directly (`field().errorSummary()[0]?.fieldTree().focusBoundControl()`) — use it for
  every form, don't silently drop it.

# Interactive controls & keyboard

- Anything clickable must be reachable and operable via keyboard: use `button`/`a`, not `div (click)`.
  If a custom widget is unavoidable, give it `tabindex="0"`, an appropriate `role`, and handle
  `(keydown.enter)`/`(keydown.space)`.
- Never remove the focus outline (`outline: none`) without providing an equally visible custom focus
  style in its place.
- Icon-only buttons need an accessible name via `aria-label` on the `button`, regardless of icon
  library (icon font, `mat-icon`/Material Symbols, inline SVG, ...); purely decorative icons get
  `aria-hidden="true"`.
- Tab order should follow visual/reading order — don't fight this with arbitrary `tabindex` values.

# Modals & dialogs

## ng-bootstrap (`NgbModal`/`NgbActiveModal`)

- The dialog needs `aria-modal="true"` and `aria-labelledby` pointing at its title — ng-bootstrap
  provides most of this by default; don't override it away.
- Focus should move into the dialog on open (first input or the close control) and return to the
  triggering element on close.
- Provide Escape-to-close **and** a visible close/cancel control. A dialog opened with
  `backdrop: 'static'` (no dismiss-on-backdrop-click) makes a visible close affordance mandatory, not
  optional.

## Angular Material (`MatDialog`)

- `MatDialog`/`CdkTrapFocus` handle `aria-modal` and focus trapping automatically — don't fight or
  duplicate that behavior.
- Give the dialog an accessible name via `mat-dialog-title` (referenced automatically) or explicit
  `ariaLabel`/`ariaLabelledBy` in `MatDialogConfig` when there's no visible title element.
- Leave `autoFocus` at its default (`'first-tabbable'`) unless a specific control should receive
  initial focus instead; leave `restoreFocus: true` (the default) so focus returns to the triggering
  element on close.
- Provide Escape-to-close **and** a visible close/cancel control. A dialog opened with
  `disableClose: true` (the `MatDialog` equivalent of ng-bootstrap's `backdrop: 'static'`) makes a
  visible close affordance mandatory, not optional — same rule as ng-bootstrap above.

# SPA route changes & loading state

- A client-side route change has no full page reload, so screen readers get no automatic signal that
  the view changed. Set a `title` on each route and let Angular's router update `document.title` from
  it — most screen readers announce a document title change. None of `brainiacs`' routes set `title`
  today (see `app.routes.ts`) — treat that as a real gap to fix, not a pattern to copy for new routes.
- Indicate loading/busy state with `role="status"` plus a visually-hidden text label (e.g.
  `<span class="visually-hidden">{{ loadingLabel }}</span>` inside the spinner element) — never via
  animation or color alone. This workspace already has one component doing this correctly; match it.
- Respect `prefers-reduced-motion` for any non-essential animation/transition you add — don't assume
  everyone wants motion.

# Color & visual state

- Text contrast must be ≥ 4.5:1 (≥ 3:1 for large text / UI components) against its background — check
  any new theme color (Bootstrap Sass variable, Material theme token, or equivalent) against this
  before shipping.
- Never convey state (error/success/disabled/selected) through color alone — pair it with text, an
  icon, or an `aria-*` attribute.

# Internationalization (Transloco)

- Keep `<html lang>` in sync with the active Transloco language. If nothing currently updates it on
  language change, treat that as a real gap to fix when touched, not a pattern to copy.
- Any string used as an accessible name (`aria-label`, image `alt`) goes through Transloco like the
  rest of the UI copy — no hardcoded English fallback.

# Images & icons

- Meaningful images (e.g. a user's avatar/profile photo) need descriptive `alt` text (e.g. the
  person's name), not a generic `"image"`/empty string.
- Purely decorative images/icons get `alt=""` / `aria-hidden="true"` so screen readers skip them.

# Automated checks

- `angular-eslint` template a11y rules (`@angular-eslint/template/alt-text`,
  `click-events-have-key-events`, `mouse-events-have-key-events`, `interactive-supports-focus`,
  `valid-aria`, `role-has-required-aria`) are **not currently enabled** in
  [eslint.config.mjs](../../eslint.config.mjs). If you're improving a11y tooling, proposing these is
  reasonable — but don't assume they're already enforced.
- Pair manual review with automated scans (`@axe-core/playwright`) on key flows — see
  [e2e-testing.instructions.md](e2e-testing.instructions.md). Automated scans only catch a minority of
  WCAG issues (missing labels, contrast, some ARIA misuse) — manual keyboard-only navigation and
  screen-reader spot checks are still required for new interactive flows.
