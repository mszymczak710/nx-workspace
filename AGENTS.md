# AGENTS.md

Guidance for AI coding agents (Claude Code, Copilot, etc.) working in this repository. This file is
the high-level index — detailed, topic-specific conventions live in `.github/instructions/` and are
linked from the relevant section below rather than repeated here. If you're about to restate a rule
from one of those files here, don't — link to it instead.

- [unit-testing.instructions.md](.github/instructions/unit-testing.instructions.md) — unit tests (Vitest/TestBed)
- [e2e-testing.instructions.md](.github/instructions/e2e-testing.instructions.md) — Playwright + POM e2e tests
- [accessibility.instructions.md](.github/instructions/accessibility.instructions.md) — WCAG 2.1 AA
- [angular.instructions.md](.github/instructions/angular.instructions.md) — Angular good practices
- [styling.instructions.md](.github/instructions/styling.instructions.md) — SCSS/theming conventions (Bootstrap Sass variables and Angular Material)
- [sonarqube_mcp.instructions.md](.github/instructions/sonarqube_mcp.instructions.md) — SonarQube MCP tool usage

## Project overview

Nx monorepo (Nx 23) with two independent Angular 21 applications and one shared library:

- `apps/brainiacs` (prefix `brn`) — Angular app, requires the [brainiacs-backend](https://github.com/mszymczak710/brainiacs-backend) API.
- `apps/invoice-generator` (prefix `klg`) — Angular app, backed by a local `json-server` mock API.
- `libs/shared/core` (project name `core`, import path `@libs/shared/core`) — shared services, interceptors, types, utils, and test helpers (`@libs/shared/core/testing`).

Stack: Angular 21 (standalone components, signals, `@angular/build`), Vitest for unit tests (executor differs by project — see Commands below and unit-testing.instructions.md), Transloco for i18n, `@ngrx/signals` for state (e.g. `UserStore`), ESLint (flat config) + Prettier + Stylelint, Husky + lint-staged + commitlint, SonarCloud, deployed to Vercel.

## Per-app stack

The two apps use **different UI kits** — this is the one significant per-app split in an otherwise
shared set of conventions (both apps' e2e suites use the same fully-mocked API strategy — see
[e2e-testing.instructions.md](.github/instructions/e2e-testing.instructions.md)):

|         | `brainiacs`                                | `invoice-generator`            |
| ------- | ------------------------------------------ | ------------------------------ |
| UI kit  | ng-bootstrap (`NgbModal`/`NgbActiveModal`) | Angular Material (`MatDialog`) |
| Theming | Bootstrap 5 Sass variables                 | Angular Material theme tokens  |
| Icons   | FontAwesome                                | `mat-icon` / Material Symbols  |

The files in `.github/instructions/` describe these conventions **by technology**, not by app name, so
they stay reusable as-is in other projects — use this table to know which part of a given instructions
file applies to which app here. Everything else in those files (Angular/signals conventions, testing,
accessibility fundamentals, e2e/POM conventions) is written to be universal and isn't app-specific at
all.

## Module boundaries

Enforced by `@nx/enforce-module-boundaries` in [eslint.config.mjs](eslint.config.mjs) via project tags:

- `scope:brainiacs` may depend on `scope:brainiacs`, `scope:shared`.
- `scope:invoice-generator` may depend on `scope:invoice-generator`, `scope:shared`.
- `scope:shared` may depend only on `scope:shared`.

Never import one app's code from another app or from a narrower-scoped lib. New shared code goes in `libs/shared/*`.

## Commands

Always use Nx/npm scripts, not raw `ng` or `vitest` invocations — this repo has no Angular CLI workspace config, only Nx project configs.

```sh
# Serve
npx nx serve brainiacs        # npm run start:brn
npx nx serve invoice-generator # npm run start:klg

# Build
npx nx build <project>         # brainiacs | invoice-generator | core
npm run build                  # all projects
npm run build:affected         # only projects affected by current changes

# Test (Vitest — @angular/build:unit-test executor for brainiacs/invoice-generator, @nx/vitest plugin for core; see unit-testing.instructions.md for the coverage difference this causes)
npx nx test <project>
npm run test                   # all projects
npm run test:affected          # only affected projects
npm run test:coverage          # all projects, with coverage → coverage/

# Lint
npx nx lint <project>
npm run lint / lint:affected
npm run lint:fix:affected      # auto-fix affected only

# Format
npm run format / format:check  # nx format:write / format:check

# Nx introspection
npx nx graph
npx nx show project <project> --json
```

Use `nx affected` / `<target>:affected` scripts by default when validating a change — it mirrors what CI runs and is much faster than running everything.

## Coding conventions

Formatting is Prettier-owned (140 print width, single quotes, no trailing commas, `arrowParens: avoid`)
— don't hand-format, run `format` if needed. Lint rules (naming, member ordering, `no-any`, signals
usage, etc.) are enforced by [eslint.config.mjs](eslint.config.mjs) — don't fight them, and don't
restate them here; see [angular.instructions.md](.github/instructions/angular.instructions.md) for the
good-practice conventions that go beyond what ESLint checks (state management, forms, error handling,
subscriptions).

## Testing

- Unit tests (Vitest/`TestBed`): [unit-testing.instructions.md](.github/instructions/unit-testing.instructions.md).
  Every new component/service/interceptor/util needs a co-located `*.spec.ts`; run
  `npx nx test <project>` after every change.
- E2E tests (Playwright + POM, `brainiacs-e2e` / `invoice-generator-e2e`):
  [e2e-testing.instructions.md](.github/instructions/e2e-testing.instructions.md).
- Accessibility (WCAG 2.1 AA): [accessibility.instructions.md](.github/instructions/accessibility.instructions.md)
  — applies to templates/components, not just dedicated a11y tasks.

## Git workflow

- Conventional commits enforced by commitlint ([commitlint.config.mjs](commitlint.config.mjs)): types `build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test`, scopes from `@commitlint/config-nx-scopes` (i.e. Nx project names — `brainiacs`, `invoice-generator`, `core`).
- Husky hooks ([.husky/](.husky/)):
  - `pre-commit`: `lint-staged` (Prettier, Stylelint on staged files) + `nx affected --target=lint --fix --uncommitted`.
  - `pre-push`: `nx affected --target=test --base=origin/develop` then `nx affected --target=e2e --base=origin/develop` then `nx affected --target=build --base=origin/develop`.
- Default/base branch for `nx affected` comparisons is `develop` ([nx.json](nx.json) `defaultBase`), not `main`.
- Don't bypass hooks (`--no-verify`) to get around a failing lint/test — fix the underlying issue.

## CI (`.github/workflows/ci.yml`)

On PRs/pushes to `develop`: `format-check`, `lint`, `unit-test` (+coverage upload), and `e2e-test` run independently/in parallel; `sonar` needs `unit-test`; `build` needs `lint` + `format-check` + `unit-test` + `e2e-test`; `deploy` (push to `develop` only) needs all of the above including `sonar` and `build`. No backend/database is started for `e2e-test` — the e2e suites mock all API responses via Playwright's `page.route()` (see e2e-testing.instructions.md), so they don't depend on `brainiacs-backend` or `json-server` being available. Before opening a PR, a change should pass: `npm run format:check`, `npm run lint:affected`, `npm run test:affected` (or `test:coverage` if touching many projects), `npm run build:affected`, and the relevant `nx affected --target=e2e`.

## PR checklist

Match [.github/pull_request_template.md](.github/pull_request_template.md): describe what/why, note how it was tested, confirm lint/format pass, confirm tests were added/updated.
