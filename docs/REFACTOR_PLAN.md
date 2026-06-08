# Refactor Plan: cdk-canvas

**Created:** 2026-06-08
**Source:** `docs/CODE_REVIEW.md`
**Goal:** Resolve all HIGH/MEDIUM findings and flatten the unnecessary monorepo structure into a
single publishable NPM package that follows TrueMark standards.

---

## Background

The current project is a pnpm workspace monorepo with two packages:

- `packages/cdk-canvas` — CLI + Express server (the published NPM package)
- `packages/frontend` — React/Vite app (private, embedded as static files)

The monorepo exists only because Vite requires `"type": "module"` while the CLI/server outputs
CommonJS. The frontend is never published independently, so the workspace adds complexity without
benefit. The correct shape is a single flat package with a build script that runs Vite first
(outputting to `dist/public/`), then `tsc` for the server/CLI.

---

## Phases

### Phase 1 — Immediate Security & Standards Fixes ✅

- [x] **Fix path traversal vulnerability**
  - Fixed in `src/server/routes/stacks.ts` and `src/server/routes/layouts.ts` (all three layout routes)
  - Regex validation `^[\w-]+$` added before any path construction

- [x] **Add `readonly` to `stackName` and `originalId`**
  - Fixed in `src/lib/types.ts`
  - Also fixed `MergedStack` interface properties in `src/lib/multi-stack-parser.ts`

- [x] **Fix frontend `tsconfig.json` include glob**
  - N/A — on closer inspection `"include": ["src"]` was already correct (directory reference covers .tsx)
  - Superseded by Phase 2: `tsconfig.frontend.json` now scopes to `src/frontend`

- [x] **Remove explanatory comments**
  - Cleaned `src/lib/stack-parser.ts` and `src/frontend/lib/layout-algorithms.ts`

---

### Phase 2 — Flatten Monorepo to Single Package ✅

- [x] **Established new root `package.json`** as `@skyionblue/cdk-canvas` — single publishable package,
  React/Vite deps moved to `devDependencies` (bundled by Vite, not runtime deps)

- [x] **Moved CLI/server source** — `src/`, `bin/`, `assets/` at repo root

- [x] **Moved frontend source** — `packages/frontend/src/` → `src/frontend/`

- [x] **Configured Vite** — `vite.config.ts` at root, `build.outDir: 'dist/public'`
  - `server.ts` static path updated to `path.join(__dirname, '../public')`

- [x] **Consolidated tsconfigs**
  - `tsconfig.json` — server/CLI only (`src/**/*.ts`, excludes `src/frontend/**`)
  - `tsconfig.frontend.json` — Vite/React type checking (`src/frontend`)

- [x] **Removed `packages/` and `pnpm-workspace.yaml`**

- [x] **Build validated** — `pnpm build` passes (prettier + eslint + vite + tsc), 30/30 tests pass
  - `dist/` — server/CLI JS
  - `dist/public/` — bundled React frontend (index.html + assets)

---

### Phase 3 — Migrate Frontend from React to Qwik

Replace the React/ReactFlow UI with a Qwik equivalent to comply with TrueMark standards.

- [ ] **Evaluate ReactFlow alternatives for Qwik**
  - Assess whether `@xyflow/react` has a Qwik-compatible wrapper or if a canvas library
    (e.g., Konva, D3) should be used directly
  - Document the chosen approach before beginning implementation

- [ ] **Set up Qwik in the flat package**
  - Replace `@vitejs/plugin-react` with `@builder.io/qwik/optimizer` in `vite.config.ts`
  - Remove React, ReactDOM, ReactFlow dependencies

- [ ] **Migrate components**
  - Port each component from `src/frontend/components/` to Qwik equivalents
  - Priority order: `Canvas`, `Toolbar`, `Sidebar`, `NodeInspector`, then editors and panels
  - Migrate contexts (`ThemeContext`, `CloudBoxEditorContext`) to Qwik signals/stores

- [ ] **Migrate layout and lib utilities**
  - `src/frontend/lib/` files are framework-agnostic TypeScript — verify they work unchanged
  - `layout-algorithms.ts`, `stack-to-flow.ts`, `topology-layout.ts`, etc. should need no changes

- [ ] **Validate feature parity**
  - Load a CDK stack and verify the diagram renders correctly
  - Verify export, annotation, grouping, and styling features work

---

### Phase 4 — Remaining Standards Fixes

- [ ] **Convert `LayoutMode` to an enum**
  - File: `src/frontend/lib/layout-algorithms.ts`
  - Replace `export type LayoutMode = 'dependency' | 'topology' | 'type'` with:
    ```typescript
    export enum LayoutMode {
      Dependency = 'dependency',
      Topology = 'topology',
      Type = 'type',
    }
    ```
  - Update all call sites

- [ ] **Consolidate and document shared types**
  - After Phase 2, `src/lib/types.ts` (CLI types) is the single source of truth
  - Delete the duplicate `src/frontend/types/index.ts`
  - Import `CdkResource`, `CdkStack`, `CdkOutput` from `../../lib/types` in frontend files
  - Add missing JSDoc to any properties that lack it

---

## Success Criteria

- [ ] `pnpm build` passes with no type errors
- [ ] `pnpm lint` passes with no violations
- [ ] `pnpm test` passes
- [ ] Single `package.json` at repo root — no `pnpm-workspace.yaml`, no `packages/` directory
- [ ] Frontend is Qwik-based
- [ ] No React or ReactFlow dependencies remain
- [ ] `GET /api/stacks/../../../etc` returns 400, not an attempted file read
- [ ] All `CdkResource` properties are `readonly`
- [ ] No duplicate type definitions

---

## Risk Notes

- **Phase 3 is the highest-risk phase.** ReactFlow provides drag-and-drop canvas, edge routing,
  and node grouping that have no direct Qwik equivalent. Plan for significant implementation work.
- **Phase 2 and Phase 3 can be parallelized** once the flat structure is in place — the frontend
  migration does not depend on the Qwik choice being finalised before the flatten happens.
- **Phase 1 fixes are independent** and should not wait for the larger refactor.
