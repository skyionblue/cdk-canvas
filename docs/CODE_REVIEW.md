# Code Review: cdk-canvas

**Date:** 2026-06-08
**Reviewer:** Claude Code (TrueMark CDK Standards)
**Scope:** Full codebase review against TrueMark coding standards

---

## Summary

The CLI/server package (`packages/cdk-canvas`) is well-structured and closely follows TrueMark
standards. The main violations are in the frontend package: it uses React (standard requires Qwik),
duplicates types from the CLI package, and has a `tsconfig.json` that silently excludes all `.tsx`
files from type checking. Additionally, the monorepo structure (two `packages/` workspaces) is
unnecessary since the frontend is private and only ever an embedded build artifact — see
`docs/REFACTOR_PLAN.md` for the plan to flatten this.

---

## Findings

### Passes

- [x] Prettier config — correct (`singleQuote`, `bracketSpacing: false`, `quoteProps: consistent`)
- [x] ESLint flat config (`eslint.config.mjs`), extends `tseslint.configs.recommended`
- [x] Root `tsconfig.json` — all required flags present (`strict`, `noImplicitReturns`, `ES2018`, `commonjs`, `experimentalDecorators`)
- [x] Test files excluded from root `tsconfig.json`
- [x] Test framework — Vitest, imports from `vitest`, co-located with implementation
- [x] File naming — kebab-case throughout
- [x] Named imports preferred; namespace imports only for `fs`/`path` (idiomatic Node.js)
- [x] Interface properties `readonly` in most interfaces
- [x] JSDoc on all public functions in CLI package, with `@param` / `@returns`
- [x] Package manager — PNPM

---

### Issues Found

#### HIGH — Approved Technologies: Frontend uses React, not Qwik

- **Location:** `packages/frontend/package.json`
- **Problem:** `react`, `react-dom`, and `reactflow` are the UI stack. TrueMark standard specifies
  Qwik only for frontend frameworks.
- **Fix:** Rewrite the frontend in Qwik, or obtain explicit approval to use React for this tool.
  See `docs/REFACTOR_PLAN.md` — this is addressed as part of the flatten + Qwik migration.

---

#### HIGH — Security: Path traversal in stack name parameter

- **Location:** `packages/cdk-canvas/src/server/routes/stacks.ts:29,55`
- **Problem:** `req.params.stackName` is passed directly into `path.join` with no validation.
  `GET /api/stacks/../../etc/passwd` constructs the path `/etc/passwd.template.json`. The
  `.template.json` suffix limits damage but files outside `cdk.out` can still be targeted.
- **Fix:** Validate `stackName` before use:
  ```typescript
  if (!/^[\w-]+$/.test(stackName)) {
    return res.status(400).json({error: 'Invalid stack name'});
  }
  ```

---

#### MEDIUM — Interface: `readonly` missing on two properties

- **Location:** `packages/cdk-canvas/src/lib/types.ts:48,53`
- **Problem:** `stackName` and `originalId` on `CdkResource` are not `readonly`. All interface
  properties must be `readonly` per TrueMark standards.
- **Fix:**
  ```typescript
  readonly stackName?: string;
  readonly originalId?: string;
  ```

---

#### MEDIUM — TypeScript: Frontend `tsconfig.json` excludes all `.tsx` files

- **Location:** `packages/frontend/tsconfig.json`
- **Problem:** `"include": ["src/**/*.ts"]` only matches `.ts`, not `.tsx`. The `tsc` step in
  `build: "tsc && vite build"` silently skips type-checking all React component files.
- **Fix:**
  ```json
  "include": ["src/**/*.ts", "src/**/*.tsx"]
  ```

---

#### MEDIUM — Type duplication: Interfaces defined in both packages

- **Location:** `packages/cdk-canvas/src/lib/types.ts` and `packages/frontend/src/types/index.ts`
- **Problem:** `CdkResource`, `CdkOutput`, `CdkStack` are copy-pasted between packages. The
  frontend copy is missing `stackName` and `originalId`, and lacks all JSDoc. These will silently
  drift as the CLI types evolve.
- **Fix:** With the planned flat package structure, this problem disappears — there is only one
  `types.ts`. In the meantime, the frontend copy should import from the CLI package.

---

#### MEDIUM — Interface: Frontend `types/index.ts` missing JSDoc on all properties

- **Location:** `packages/frontend/src/types/index.ts:1-32`
- **Problem:** All three interfaces have no property-level JSDoc comments. TrueMark standard
  requires every property to be documented with at least a one-line description, and optional
  properties require a `@default` annotation.

---

#### LOW — Naming: `LayoutMode` should be an enum, not a string union

- **Location:** `packages/frontend/src/lib/layout-algorithms.ts:5`
- **Problem:** `export type LayoutMode = 'dependency' | 'topology' | 'type'` — TrueMark standard
  uses PascalCase enums with PascalCase members for named sets of values.
- **Fix:**
  ```typescript
  export enum LayoutMode {
    Dependency = 'dependency',
    Topology = 'topology',
    Type = 'type',
  }
  ```

---

#### LOW — Comments: Several describe what the code does, not why

- **Locations:** `stack-parser.ts:28,43`, `layout-algorithms.ts:44,50,56,59,103,113,123`
- **Problem:** Comments like `// Add nodes to graph`, `// Run dagre layout`, `// VPCs at top`,
  `// Parse outputs` restate what the code already says. Per TrueMark standards, comments should
  only explain non-obvious WHY — a hidden constraint, subtle invariant, or workaround.

---

## Recommendations

The structural issue (unnecessary monorepo) and the React/Qwik violation are related. Flattening
to a single package and migrating to Qwik resolves the type duplication and `tsconfig` issues as a
side effect. The security fix and `readonly` fixes are independent and can be applied immediately.
See `docs/REFACTOR_PLAN.md` for the full remediation plan.
