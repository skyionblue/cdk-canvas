# Getting Started with CDK-Canvas

## Prerequisites

- Node.js >= 18.0.0
- PNPM >= 8.0.0

## Initial Setup

1. **Install dependencies**

```bash
pnpm install
```

2. **Build all packages**

```bash
pnpm build
```

## Development Workflow

### Running in Development Mode

Start both the backend and frontend in watch mode:

```bash
pnpm dev
```

This will:

- Start the backend server with TypeScript watch mode
- Start Vite dev server for the frontend
- Both run in parallel

### Testing the CLI

**Step 1: Build CDK-Canvas**

```bash
cd /path/to/cdk-canvas
pnpm build
```

**Step 2: Navigate to your CDK project**

```bash
cd /path/to/your-cdk-project
```

**Step 3: Ensure CDK is synthesized**

```bash
# Only needed if cdk.out/ is missing or outdated
cdk synth
```

**Step 4: Run CDK-Canvas**

```bash
node /path/to/cdk-canvas/packages/cdk-canvas/bin/cdk-canvas.js
```

Or with custom options:

```bash
# Custom port
node /path/to/cdk-canvas/packages/cdk-canvas/bin/cdk-canvas.js --port 3001

# Custom cdk.out path
node /path/to/cdk-canvas/packages/cdk-canvas/bin/cdk-canvas.js --cdk-out ./cdk.out
```

**Step 5: Open your browser**

Navigate to: **http://localhost:3000**

You should see the CDK-Canvas interface.

**Step 6: Stop the server**

Press **Ctrl+C** in the terminal where the server is running.

### Testing the API (Optional)

In another terminal, you can test the API endpoints:

```bash
# List all stacks
curl http://localhost:3000/api/stacks

# Get a specific stack
curl http://localhost:3000/api/stacks/YourStackName

# List saved layouts
curl http://localhost:3000/api/layouts
```

### Code Quality

**Format code:**

```bash
pnpm fmt
```

**Lint code:**

```bash
pnpm lint
```

**Run prebuild checks (format + lint):**

```bash
pnpm prebuild
```

## Project Structure

```
cdk-canvas/
├── packages/
│   ├── cdk-canvas/              # Backend package
│   │   ├── bin/                 # CLI entry point
│   │   ├── src/
│   │   │   ├── cli/             # CLI logic
│   │   │   ├── server/          # Express server
│   │   │   │   └── routes/      # API routes
│   │   │   └── lib/             # Shared utilities
│   │   ├── assets/              # AWS icons, logos
│   │   └── templates/           # Built-in templates
│   │
│   └── frontend/                # React frontend
│       └── src/
│           ├── components/      # React components
│           ├── lib/             # Utilities
│           ├── hooks/           # React hooks
│           └── types/           # TypeScript types
```

## TrueMark Standards

This project follows TrueMark coding standards:

- **Files:** kebab-case (`stack-parser.ts`)
- **Classes:** PascalCase (`StackParser`)
- **Formatting:** Single quotes, no bracket spacing
- **Testing:** Vitest (not Jest)
- **Package Manager:** PNPM only

See the [TrueMark CDK Review Checklist](../PLAN.md) for complete standards.

## Next Steps

1. Review the [PLAN.md](../PLAN.md) for project roadmap
2. Start implementing Phase 1 features
3. Follow Sprint 1 tasks for MVP development

## Troubleshooting

**TypeScript errors:**

```bash
pnpm clean
pnpm install
pnpm build
```

**Port already in use:**

```bash
# Kill existing server on port 3000
lsof -ti:3000 | xargs kill

# Or use a different port
node /path/to/cdk-canvas/packages/cdk-canvas/bin/cdk-canvas.js --port 3001
```

**CDK output not found:**

```bash
# In your CDK project, synthesize first
cdk synth

# Then run CDK-Canvas
node /path/to/cdk-canvas/packages/cdk-canvas/bin/cdk-canvas.js
```

**Module not found errors:**

```bash
# In the cdk-canvas directory
cd /path/to/cdk-canvas
pnpm install
pnpm build
```
