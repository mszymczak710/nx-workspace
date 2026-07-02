# Nx Workspace

This is an [Nx](https://nx.dev) monorepo containing two Angular applications and shared libraries.

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

## Applications

This workspace contains **two independent applications**:

### 🧠 `brainiacs`

An Angular application that requires a dedicated backend to run.

- **Backend repository:** [brainiacs-backend](https://github.com/mszymczak710/brainiacs-backend)
- Before running `brainiacs` locally, clone and start the backend separately (see its own README for setup instructions).
- The frontend is configured to proxy API requests to the backend during local development via `apps/brainiacs/proxy.conf.mjs`. Make sure the `target` in that file points to your locally running backend instance.

### 🧾 `invoice-generator`

An Angular application backed by [`json-server`](https://github.com/typicode/json-server) as a lightweight mock REST API.

- No external backend repository is required.
- `json-server` serves data from a local `db.json` file, making it self-contained and easy to run without any additional setup.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm

## Installation

Clone the repository and install dependencies:

```sh
git clone https://github.com/mszymczak710/nx-workspace.git
cd nx-workspace
npm install
```

## Running the applications

### brainiacs

1. Clone and start the [brainiacs-backend](https://github.com/mszymczak710/brainiacs-backend) following its own setup instructions.
2. Update `apps/brainiacs/proxy.conf.mjs` if your backend runs on a different host/port than the default.
3. Serve the frontend:

```sh
npx nx serve brainiacs
# or
npm run start:brn
```

### invoice-generator

1. Start the mock API with `json-server` (adjust the command/port to match your `db.json` location):

```sh
npm run mock:klg
```

1. Serve the frontend:

```sh
npx nx serve invoice-generator
# or
npm run start:klg
```

## Building

```sh
# Build a single app
npx nx build brainiacs
npx nx build invoice-generator

# Build everything
npm run build

# Build only what's affected by your changes (compared to the base branch)
npm run build:affected
```

## Testing

### Unit tests (Vitest)

All applications and shared libraries use [Vitest](https://vitest.dev/) for unit testing.

```sh
# Run unit tests for a single project
npx nx test brainiacs
npx nx test invoice-generator
npx nx test core

# Run all unit tests
npm run test

# Run only affected unit tests
npm run test:affected
```

Coverage reports are generated automatically and can be found under the `coverage/` directory at the workspace root.

### End-to-end tests

The applications also include end-to-end (e2e) test coverage.

```sh
# Run e2e tests for a specific app
npx nx e2e brainiacs-e2e
npx nx e2e invoice-generator-e2e
```

> Note: for `brainiacs`, make sure the [brainiacs-backend](https://github.com/mszymczak710/brainiacs-backend) is running before executing e2e tests, since the app depends on it for real data. For `invoice-generator`, make sure `json-server` is running with the expected `db.json` fixture data.

## Linting

```sh
# Lint a single project
npx nx lint brainiacs

# Lint everything
npm run lint

# Lint only affected projects
npm run lint:affected

# Lint and auto-fix affected projects
npm run lint:fix:affected
```

## Project structure

```plain
apps/
  brainiacs/            # Angular app – requires brainiacs-backend
  invoice-generator/     # Angular app – requires json-server
libs/
  shared/
    core/                # Shared services, interceptors, types, utils
```

## Useful Nx commands

```sh
# Visualize the project graph
npx nx graph

# Visualize the graph of affected projects
npx nx affected:graph

# Show a project's full configuration (targets, tags, executors, etc.)
npx nx show project brainiacs --json
```

[Learn more about running tasks in Nx »](https://nx.dev/features/run-tasks)

## Learn more

- [Nx documentation](https://nx.dev)
- [json-server documentation](https://github.com/typicode/json-server)
- [Vitest documentation](https://vitest.dev/)
- [brainiacs-backend repository](https://github.com/mszymczak710/brainiacs-backend)
