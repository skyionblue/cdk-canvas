# CDK-Canvas Rebuild Guide

## When to Rebuild

You need to rebuild the frontend whenever you make changes to:
- Any `.tsx` or `.ts` files in `packages/frontend/src/`
- Any `.css` files in `packages/frontend/src/`
- Any React components or TypeScript code

## How to Rebuild

### Option 1: Full Build (Production)

```bash
cd packages/frontend
pnpm run build
```

This compiles TypeScript and bundles all assets into `packages/cdk-canvas/dist/`.

### Option 2: Development Mode with Auto-Reload

```bash
cd packages/frontend
pnpm run dev
```

This starts Vite dev server with hot module replacement (HMR). Changes appear instantly without manual rebuild.

## After Rebuilding

1. **If using the published npm package:** 
   - Restart your CDK-Canvas server
   - Or refresh your browser

2. **If testing locally:**
   - Navigate to `packages/cdk-canvas`
   - Run `npx ts-node src/cli/index.ts` (or your local test command)
   - Refresh browser

## Quick Commands

```bash
# From project root
cd packages/frontend && pnpm run build

# Or use pnpm workspace commands
pnpm --filter @skyionblue/cdk-canvas-frontend build

# Clean before building (removes old dist files)
pnpm --filter @skyionblue/cdk-canvas-frontend clean
pnpm --filter @skyionblue/cdk-canvas-frontend build
```

## Development Workflow

For active development, use two terminal windows:

**Terminal 1 - Frontend Dev Server:**
```bash
cd packages/frontend
pnpm run dev
```

**Terminal 2 - Backend Server:**
```bash
cd packages/cdk-canvas
npx ts-node src/cli/index.ts --cdk-out /path/to/your/cdk.out
```

The frontend will auto-reload on code changes. The backend serves the API.

## Troubleshooting

**Changes not appearing?**
1. Hard refresh browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. Clear browser cache
3. Check browser console for errors
4. Verify build completed without errors
5. Restart the CDK-Canvas server

**Build errors?**
1. Run `pnpm install` to ensure dependencies are up to date
2. Check TypeScript errors with `tsc --noEmit`
3. Review error messages in build output

**Port conflicts?**
- Frontend dev server: default port 5173 (Vite)
- Backend server: default port 3000
- Change ports if needed in respective configs
