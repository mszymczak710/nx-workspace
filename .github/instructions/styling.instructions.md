---
applyTo: 'apps/brainiacs/**/*.scss,apps/invoice-generator/**/*.scss,libs/**/*.scss'
---

SCSS/styling conventions for this workspace. Written by **theming technology** — this workspace has
one app theming with Bootstrap 5 Sass variables and one with Angular Material; see
[AGENTS.md](../../AGENTS.md)'s per-app stack table for which is which, and don't cross-apply one
system's conventions to the other. See [AGENTS.md](../../AGENTS.md) for the wider repo overview.

# Tooling — don't restate, don't fight

- Rules themselves come from `stylelint-config-standard-scss` ([.stylelintrc.json](../../.stylelintrc.json))
  — read that instead of copying its rules here.
- Formatting is Prettier's job (`.scss` is not in [.prettierignore](../../.prettierignore)); on commit,
  `lint-staged` runs `prettier --write` then `stylelint --fix` on staged `*.scss` files
  ([.lintstagedrc](../../.lintstagedrc)) — don't hand-format or hand-fix what those already cover.

# Theming with Bootstrap Sass variables

- The app defines its theme overrides once, in a single `_variables.scss` (colors, breakpoints,
  component sizing), and feeds them into Bootstrap via `@use 'bootstrap/scss/bootstrap' with (...)` in
  the app's `styles.scss`. If a value already has a Bootstrap Sass variable (`$primary`, `$modal-md`,
  `$dropdown-min-width`, ...), override it there — don't hardcode the equivalent value again in a
  component's stylesheet.
- Prefer Bootstrap utility classes in the template (spacing, flex, text/background color) over adding
  custom CSS for something Bootstrap already provides. Component `.scss` files in this codebase are
  intentionally small — a handful of rules per component, not full custom stylesheets.
- Use `@use`/`@forward` for local partials and package imports — legacy `@import` has no place here,
  not even for fonts; see the **Fonts** section below.
- Don't introduce new hardcoded colors (e.g. a `.required { color: #f00; }` rule using a raw hex
  value) when a theme variable or Bootstrap utility class already expresses the same intent. A few
  existing components still do this — treat that as legacy to clean up when touched, not a pattern to
  copy. New code should reference the theme variables or a Bootstrap text/border utility class instead.

# Theming with Angular Material

- The app defines its Material theme once — via `@use '@angular/material' as mat;` plus the theme
  config (color palettes, typography, density) applied through Material's theming mixins, in the app's
  `styles.scss` — the same single-entry-point role a `_variables.scss` plays for the Bootstrap-themed
  app. Don't redefine palette/typography/density values ad hoc in a component stylesheet.
- Prefer Material's design tokens/CSS custom properties (the `--mat-*`/theme-level variables Material
  generates) and Material components' own theming API over hand-rolled CSS — reach for a Material
  theme override before writing custom component CSS for something Material already themes.
- Never use `::ng-deep` to override Material internals. Use Material's supported theming mixins/tokens,
  or wrap the component in your own `:host` container and style that, instead of piercing Material's
  encapsulation.
- Same `@use`/`@forward` rule as above: use them for local partials/package imports — see the
  **Fonts** section below for how to load web fonts without `@import`.

# Fonts

- **Don't load web fonts with a SCSS/CSS `@import url(...)`** (e.g.
  `@import 'https://fonts.googleapis.com/css2?family=...'`). A CSS `@import` is only discovered once
  the browser has already started fetching and parsing the stylesheet that contains it, so the font
  request only starts after that — it's a well-known render-blocking anti-pattern, on top of shipping a
  third-party network call to Google from inside your styles. A couple of stylesheets in this codebase
  still do this — treat that as legacy to fix when touched, not a pattern to copy into new code.
- Prefer **self-hosting via an npm font package** (e.g. `@fontsource/<font-name>`) loaded with `@use`
  in the app's `styles.scss`, the same way icon fonts are already loaded via `@use` elsewhere in this
  workspace. This removes the third-party request entirely, lets the bundler fingerprint/cache the
  font files, and works offline.
- If there's no package for a given font (a custom/brand font, or one without an `@fontsource`
  equivalent), self-host the font **files** instead: put the `.woff2` files under the app's
  `public/fonts/` (alongside the app's other static assets — everything under `public/` is copied to
  the build output as-is per each app's `assets: [{ glob: '**/*', input: 'apps/<app>/public' }]` in
  `project.json`) and declare an `@font-face` in `styles.scss` pointing at `/fonts/<file>.woff2`. Keep
  this declaration in the app's shared `styles.scss`, not per-component, so it's registered once.
- Only if neither of the above is viable, load a CDN font from `index.html`'s `<head>` with
  `<link rel="preconnect" href="https://fonts.googleapis.com">` +
  `<link rel="stylesheet" href="...">` — never from inside a `.scss`/`.css` file. The browser's
  preloader discovers `<link>` tags immediately, without waiting on CSS parsing first. This is the
  least preferred option: it still costs a third-party request and an external dependency at runtime.

# Component styles

- Wrap component styles in `:host { ... }` and nest selectors inside it, rather than relying on global
  selectors — this is the existing scoping convention in this workspace, not Angular's default
  `ViewEncapsulation` alone. Apply it regardless of theming system.
- Per-component style budget is enforced in `project.json` for both apps (4kb warn / 8kb error) — keep
  component-specific SCSS minimal and push anything reusable into the app's shared theme instead of
  duplicating it per component.

# Responsive layout

- Reach for the framework's own responsive tools before hand-rolling `@media` queries: Bootstrap's
  responsive utility classes/breakpoint mixins for the Bootstrap-themed app, the CDK's
  `BreakpointObserver` (`@angular/cdk/layout`) for the Material-themed one. No stylesheet in this
  workspace currently has a custom `@media` query — keep it that way unless the framework tools
  genuinely can't express what's needed.
