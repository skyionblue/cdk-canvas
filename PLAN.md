# CDK-Canvas - Interactive CDK Diagram Designer

**Vision**: A web-based interactive tool that allows users to create, customize, and export professional infrastructure diagrams from AWS CDK stacks.

## Project Overview

CDK-Canvas solves the challenge of automatically generating "perfect" CDK diagrams by putting the user in control. Instead of fighting with automatic layout algorithms, users can:

- View auto-generated diagrams from synthesized CDK stacks
- Drag, reposition, and reorganize resources visually
- Create custom groupings and containers
- Save layouts as reusable templates
- Export professional diagrams with branding

## Core Principles

1. **User Control**: Users know their infrastructure best - let them design the layout
2. **Iterative Design**: Start with auto-layout, refine interactively
3. **Persistence**: Save layouts so they survive CDK changes
4. **Minimal Diagrams**: Combine multiple stacks into single diagrams when it makes sense
5. **Professional Output**: Export publication-ready diagrams with branding

---

## Technical Architecture

### Technology Stack

**Frontend:**

- **Framework**: React
- **Diagram Library**: TBD - candidates:
  - React Flow (declarative, React-native)
  - Cytoscape.js (powerful graph visualization)
  - D3.js + custom (maximum control)
  - Canvas-based (Konva.js / Fabric.js)
- **Styling**: TBD (Tailwind CSS / Material-UI / styled-components)

**Backend:**

- **Type**: Local web server (Node.js/Express)
- **Purpose**:
  - Serve the web UI
  - Read CDK synthesis outputs from filesystem
  - Save/load layout configurations
  - Watch for CDK changes (optional)

**Deployment:**

- Distributed as npm package (`@skyionblue/cdk-canvas`)
- Users install in their CDK project and run via `npx cdk-canvas` or similar CLI command
- Launches local web server automatically
- No cloud hosting required
- Possibly package as Electron app later

---

## Data Model

### CDK Stack Data (Input)

**Source**: `cdk.out/*.template.json` files

```typescript
interface CdkResource {
  id: string; // CloudFormation logical ID
  type: string; // AWS::EC2::Instance, AWS::Lambda::Function, etc.
  properties: Record<string, any>;
  metadata?: {
    path: string; // CDK construct path
  };
}

interface CdkOutput {
  id: string;
  description?: string;
  value: any;
  exportName?: string;
}

interface CdkStack {
  name: string;
  resources: Record<string, CdkResource>;
  outputs: Record<string, CdkOutput>;
  parameters?: Record<string, any>;
}
```

### Diagram Layout Data (Persisted)

**Location**: `<cdk-project>/diagram-layouts/*.json`

```typescript
interface DiagramLayout {
  version: string; // Schema version for migration
  name: string; // "Production Topology", "Full Stack", etc.
  description?: string;

  // Which stacks are included in this diagram
  stacks: string[]; // ["LvDatabaseStack", "LvWordPressStack"]

  // Node positions and styling
  nodes: {
    [resourceId: string]: {
      x: number;
      y: number;
      width?: number;
      height?: number;
      style?: NodeStyle;
      hidden?: boolean; // User chose to hide this resource
    };
  };

  // Custom groupings (containers)
  groups: DiagramGroup[];

  // Edges (auto-detected + user-added)
  edges: DiagramEdge[];

  // Branding
  branding?: {
    logo?: string; // Path to logo image
    title?: string;
    footer?: string;
    theme?: string; // Color scheme
  };

  // Metadata
  created: string; // ISO timestamp
  lastModified: string;
  basedOnTemplate?: string; // Template ID if created from template
}

interface DiagramGroup {
  id: string;
  label: string;
  type: 'container' | 'vpc' | 'subnet' | 'custom';
  x: number;
  y: number;
  width: number;
  height: number;
  style?: GroupStyle;
  children: string[]; // Resource IDs contained in this group
  parent?: string; // Parent group ID (for nesting)
}

interface DiagramEdge {
  id: string;
  source: string; // Resource ID
  target: string; // Resource ID
  type: 'dependency' | 'reference' | 'network' | 'custom';
  autoDetected: boolean; // True if discovered from CDK, false if user-added
  style?: EdgeStyle;
  label?: string;
}

interface NodeStyle {
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  backgroundColor?: string;
  iconSize?: number;
  labelSize?: number;
}

interface GroupStyle {
  borderColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
}

interface EdgeStyle {
  color?: string;
  width?: number;
  style?: 'solid' | 'dashed' | 'dotted';
  arrow?: 'none' | 'forward' | 'backward' | 'both';
}
```

### Template Data

**Location**: `<cdk-project>/diagram-layouts/templates/*.json`

Templates are similar to layouts but include rules for auto-positioning:

```typescript
interface DiagramTemplate {
  id: string;
  name: string;
  description: string;
  version: string;

  // Layout structure
  layout: DiagramLayout;

  // Rules for auto-applying template
  rules?: {
    // "Place all Lambda functions in bottom-left"
    resourceType: string; // AWS::Lambda::Function
    position: {x: number; y: number} | 'auto';
    group?: string; // Group ID to place them in
  }[];

  // Preview image
  thumbnail?: string; // Base64 or path
}
```

---

## Progress Summary

### Phase 1: Core Functionality (MVP) ✅ COMPLETE

All core features implemented and working:

- Stack parsing and discovery (60+ AWS resource types)
- Three layout algorithms (dependency, topology, type-based)
- Interactive canvas with drag/drop
- Custom grouping with visual containers and layers panel
- Save/load layouts
- Enhanced export (PNG/SVG, title, footer, custom logo upload)
- Custom node creation and editing (50+ AWS resource types)
- Multi-selection (box select and Ctrl+click)
- AWS Cloud & VPC box customization (resize, recolor)
- CIDR legend as draggable diagram node (positioned bottom-right of AWS Cloud)
- Node Inspector with editable CloudFormation properties (discovery tool)
- Full layer management for all diagram elements

### Phase 2: Advanced Features ✅ COMPLETE

Completed: Multi-stack diagrams, Resource filtering, Edge & node customization, Node Inspector, Styling & Theming
**Template system removed** - Not needed for single-use diagram customization workflow

---

## Feature Breakdown

### Phase 1: Core Functionality (MVP) ✅ COMPLETE

#### 1.1 Stack Discovery & Parsing ✅ COMPLETE

- [x] Scan `cdk.out/` directory for `*.template.json` files
- [x] Parse CloudFormation templates to extract resources
- [x] Parse outputs to find imported/referenced resources
- [x] Load AWS icon mappings for resource types (60+ resource types mapped)

#### 1.2 Auto-Layout Generation ✅ COMPLETE

- [x] Implemented three layout algorithms (dependency, topology, type)
- [x] Generate initial node positions using dagre hierarchical layout
- [x] Detect dependencies between resources (Ref, GetAtt, DependsOn)
- [x] Create VPC → Subnets hierarchy for topology view

#### 1.3 Interactive Canvas ✅ COMPLETE

- [x] Render diagram in web UI with React Flow
- [x] Drag & drop nodes to reposition
- [x] Select multiple nodes
- [x] Zoom & pan
- [x] Fit view button

#### 1.4 Grouping & Containers ✅ COMPLETE

- [x] Create custom groups (draw a box around selected nodes)
- [x] Automatic VPC/subnet nesting in topology view
- [x] Group configuration (label, 6 color options)
- [x] Group nodes draggable and selectable
- [x] Visual group boundaries with labeled headers
- [x] Groups positioned behind nodes (zIndex: -1)
- [x] Layers panel for managing ALL layers (custom groups, AWS Cloud, VPC boxes, legend)
- [x] System layers (AWS Cloud, VPC, Legend) can be toggled but not deleted
- [x] Custom groups can be edited, toggled, and deleted
- [x] AWS Cloud box editing via clickable badge (resize, recolor, cannot delete)
- [x] VPC box editing via clickable badge (resize, recolor, cannot delete)
- [x] CIDR legend as draggable node in diagram (positioned bottom-right of AWS Cloud)
- [x] CIDR legend extracts VPCs and Subnets with CIDR blocks from CloudFormation
- [x] Legend names editable via double-click (custom display names)
- [x] Legend appears in Layers panel as toggleable layer

#### 1.5 Save & Load Layouts ✅ COMPLETE

- [x] Save layout to `diagram-layouts/<name>.json`
- [x] Load saved layouts
- [x] List available layouts
- [x] Preserve positions across layout mode changes

#### 1.6 Export Diagrams ✅ COMPLETE

- [x] Export to PNG with enhanced options
- [x] Export to SVG (converts to PNG - native SVG support planned)
- [x] Custom logo upload (PNG/SVG/JPG) in upper-left corner
- [x] TrueMark default logo fallback
- [x] Logo preview with remove option
- [x] Custom title (centered header)
- [x] Custom footer text (centered bottom)
- [x] Configurable dimensions (width/height)
- [x] Export dialog with all options

### Phase 2: Advanced Features

#### 2.1 Multi-Stack Diagrams ✅ COMPLETE

- [x] Select which stacks to include in a diagram (checkbox multi-select)
- [x] Merge multiple stacks into one visualization
- [x] Show cross-stack dependencies (preserved via prefixed IDs)
- [x] Handle resource name conflicts (stack::resource prefixing)
- [x] Visual stack grouping with labeled containers
- [x] Purple stack badges on each group
- [x] 150px gap between stack groups
- [x] CDKMetadata resources filtered out

#### 2.2 Node & Edge Customization ✅ COMPLETE

- [x] Drag-to-connect from any handle (4-way connections: top, right, bottom, left)
- [x] Custom edge creation between any resources
- [x] Edge styling via Edge Editor panel (6 colors, thickness 1-6px, dashed, labels)
- [x] 90-degree angle routing (smoothstep with rounded corners)
- [x] Delete any edge (CloudFormation or custom) via Delete key or Edge Editor
- [x] Visual distinction (custom edges show ✏️ badge, CloudFormation edges semi-transparent)
- [x] Add custom AWS resource nodes (50+ resource types across 10 categories)
- [x] Custom nodes fully interactive (draggable, connectable, positioned at viewport center)
- [x] Node Inspector with 3 tabs (Edit, Properties, Info)
- [x] Edit tab: Display label (80 chars), Custom notes (500 chars)
- [x] Properties tab: CloudFormation properties as editable key-value pairs
- [x] Properties editing for exploration/learning (visual only, doesn't modify infrastructure)
- [x] Info tab: Resource Type, Stack, Construct Path, Original ID, Node Type
- [x] Double-click ANY node (CloudFormation or custom) to open Node Inspector
- [x] Works for both custom nodes and CloudFormation resources

#### 2.3 Template System ❌ REMOVED

**Decision: Template system removed from roadmap**

**Rationale:**
- Each CDK stack is unique - templates don't fit the real workflow
- Tool's value is in **one-time customization** for specific design communications
- Users run `cdk diff` → get `cdk.out/` → customize diagram → export for meetings/PRs/docs
- Reusable templates don't make sense when every stack has different resources
- Focus on making single-diagram customization as fast and powerful as possible

#### 2.4 Resource Filtering ✅ COMPLETE

- [x] Hide/show resource types via Filter dropdown
- [x] Checkbox list of all resource types with counts
- [x] "Hide All" and "Show All" quick actions
- [x] Auto-hide topology plumbing in Topology mode (40+ types)
- [x] Transitive edges preserved when nodes filtered
- [x] Filter state persists across layout changes

#### 2.5 Styling & Theming ✅ COMPLETE

- [x] Color schemes (light/dark mode)
- [x] Custom node colors by type
- [x] Custom node colors for selected nodes
- [x] Font size adjustments (global and per-type)
- [x] Alignment tools (align left/right/top/bottom/center-h/center-v)
- [x] Distribute tools (horizontal/vertical spacing)
- [x] Comprehensive styling panel with tabbed interface
- [ ] Icon customization (future enhancement)

### Phase 3: Polish & Productivity

#### 3.1 Smart Features

- [ ] Auto-arrange selected nodes (grid, circle, hierarchy) - Not wanted
- [ ] Suggest groupings based on resource types - Not wanted
- [x] Detect and highlight security issues ✅ COMPLETE
  - [x] Security scanner for common issues
  - [x] Security Groups open to 0.0.0.0/0
  - [x] S3 buckets without encryption or public access blocks
  - [x] RDS databases publicly accessible
  - [x] IAM roles with wildcard permissions
  - [x] Lambda URLs without authentication
  - [x] Visual warning badges on affected resources
  - [x] Security panel with issue list and filtering
  - [x] Click to highlight/zoom to affected resource
  - [x] Critical vs Warning severity levels
- [ ] Show estimated costs per resource (integrate with pricing API) - Not wanted

#### 3.2 Collaboration

- [ ] Export layout config to share with team
- [ ] Version control friendly (JSON diff-able)
- [x] Comments/annotations on diagram ✅ COMPLETE
  - [x] Text annotations (sticky notes)
  - [x] Callout annotations (with arrows)
  - [x] Highlight boxes (emphasis areas)
  - [x] Full editor with color, size, opacity controls
  - [x] Drag and position annotations
  - [x] Show in layers panel (visibility, edit, delete)
  - [x] Export with diagrams (PNG/SVG)
  - [ ] Save/load with layouts (not needed - annotations are session-based)
- [ ] Multiple diagram views of same stack

#### 3.3 Live Updates

- [ ] Watch `cdk.out/` for changes
- [ ] Auto-refresh when CDK synth runs
- [ ] Highlight what changed (new/modified/deleted resources)
- [ ] Preserve user layout when resources change

---

## File Organization

```
cdk-canvas/                    # Development repository
├── packages/
│   ├── cdk-canvas/            # Main npm package (published to npm)
│   │   ├── bin/
│   │   │   └── cdk-canvas.js  # CLI entry point
│   │   ├── dist/              # Bundled frontend assets
│   │   │   ├── index.html
│   │   │   ├── bundle.js
│   │   │   └── bundle.css
│   │   ├── src/
│   │   │   ├── cli/           # CLI logic
│   │   │   │   └── index.ts   # Parse args, start server
│   │   │   ├── server/        # Local web server
│   │   │   │   ├── routes/
│   │   │   │   │   ├── stacks.ts  # List/read CDK stacks
│   │   │   │   │   ├── layouts.ts # Save/load layouts
│   │   │   │   │   └── templates.ts
│   │   │   │   └── server.ts
│   │   │   └── lib/           # Shared utilities
│   │   ├── assets/
│   │   │   ├── aws-icons/     # AWS SVG icons (bundled)
│   │   │   └── logos/         # TrueMark logos (bundled)
│   │   ├── templates/         # Built-in diagram templates
│   │   │   ├── basic-topology.json
│   │   │   ├── three-tier-web.json
│   │   │   └── serverless-app.json
│   │   └── package.json       # Published package.json
│   │
│   └── frontend/              # React web app (builds to cdk-canvas/dist)
│       ├── src/
│       │   ├── components/
│       │   │   ├── Canvas/    # Main diagram canvas
│       │   │   ├── Sidebar/   # Resource list, properties
│       │   │   ├── Toolbar/   # Tools, actions
│       │   │   └── Modals/    # Dialogs (export, templates, etc.)
│       │   ├── lib/
│       │   │   ├── parser.ts  # Parse CDK templates
│       │   │   ├── layout.ts  # Layout algorithms
│       │   │   ├── icons.ts   # AWS icon mappings
│       │   │   └── export.ts  # PNG/SVG export
│       │   ├── hooks/         # React hooks
│       │   ├── types/         # TypeScript types
│       │   └── App.tsx
│       └── package.json
│
├── logos-icons/               # Source logos (bundled into package)
│   ├── logo.png
│   ├── logo-dark.png
│   └── truemark-logo-left-dark.png
│
├── docs/
│   ├── USER_GUIDE.md
│   ├── ARCHITECTURE.md
│   └── API.md
│
├── package.json               # Root workspace package
├── tsconfig.json
└── PLAN.md                    # This file

# When installed in a user's CDK project:
my-cdk-project/
├── bin/
├── lib/
├── cdk.out/                   # CDK synthesis output
│   ├── MyStack.template.json
│   └── manifest.json
├── diagram-layouts/           # Created by CDK-Canvas
│   ├── production-topology.json
│   ├── network-view.json
│   └── complete-system.json
├── node_modules/
│   └── @skyionblue/
│       └── cdk-canvas/        # The installed package
└── package.json
```

---

## Open Questions & Decisions

**Status Summary:**

- ✅ Question 1: Diagram Library - **React Flow**
- ✅ Question 2: Resource Identity - **CDK construct path with fuzzy fallback**
- ✅ Question 3: Multi-Stack Strategy - **Multiple diagram views (Option C)**
- ✅ Question 4: Imported Resources - **Dashed border + icon overlay**
- ✅ Question 5: Initial Layout - **Multiple layout modes (dependency/topology/type)**
- ✅ Question 6: Package Distribution - **`@skyionblue/cdk-canvas`, layouts in `diagram-layouts/`, TrueMark branding, pre-bundled assets**

---

### 1. Diagram Library Selection

**Options:**

- **React Flow**: Pros: React-native, easy, good docs. Cons: May be limiting for complex layouts
- **Cytoscape.js**: Pros: Powerful, battle-tested. Cons: Not React-native, steeper learning curve
- **D3.js + Custom**: Pros: Maximum control. Cons: More work, we have to build everything
- **Canvas-based (Konva/Fabric)**: Pros: Performance, flexibility. Cons: More low-level work

**Recommendation**: Start with **React Flow** for rapid prototyping. Can migrate to Cytoscape.js or custom later if needed.

**Decision**: ✅ **React Flow**

- Handles scale from dozens to hundreds of nodes
- Works well with standard AWS icon-in-box designs
- Fastest path to MVP
- Migration path available if limitations encountered

### 2. Resource Identity Across Stack Changes

When a CDK resource is renamed or recreated, how do we match it to the saved layout?

**Options:**

- Use CloudFormation Logical ID (changes when resource is renamed)
- Use CDK construct path (more stable)
- Use resource properties (type + name + key properties)
- Combination with fuzzy matching

**Recommendation**: Primary key = CDK construct path, fallback to type + properties matching.

**Decision**: ✅ **CDK construct path with fuzzy fallback**

- Primary identifier: CDK construct path from template metadata
- Fallback: Type + properties fuzzy matching when path doesn't match
- Since refactoring is infrequent, this provides "close enough" matching
- Unmatched resources use default layout algorithm

### 3. Multi-Stack Diagram Strategy

**Option A**: One canvas, all stacks merged

- Pros: Single view of entire system
- Cons: Can get cluttered

**Option B**: Tabbed view, switch between stacks

- Pros: Cleaner, focused
- Cons: Harder to see cross-stack relationships

**Option C**: User chooses (can create multiple diagrams)

- Pros: Flexible
- Cons: More complexity

**Recommendation**: Option C - let user create multiple diagram views, each can include any combination of stacks.

**Decision**: ✅ **Option C - Multiple diagram views**

- Users can create multiple saved diagrams (separate `.json` files)
- Each diagram can include any combination of stacks
- Examples: "Complete Infrastructure", "Network Topology", "API Layer"
- Switch between different saved views
- Maximum flexibility for different visualization needs

### 4. Imported Resource Visualization

How should we show resources that are imported (from Outputs) vs. created in the stack?

**Visual Distinctions:**

- Dashed border for imported resources
- Different icon overlay (chain link icon)
- Different background color
- Grouped separately

**Recommendation**: Dashed border + small icon indicator.

**Decision**: ✅ **Dashed border + icon overlay**

- Imported/supplied resources: dashed border
- Created resources: solid border
- Small chain-link or import icon overlay on imported resources
- Clear visual distinction since cross-stack imports are frequent
- Users can immediately see what's supplied vs. created

### 5. Initial Layout Algorithm

What algorithm should we use for the initial auto-layout?

**Options:**

- Reuse existing Graphviz from cdk-dia
- Force-directed graph (D3.js)
- Hierarchical layout (dagre)
- Grid-based (simple but predictable)

**Recommendation**: Start with hierarchical (dagre) for topology, grid-based for stack view.

**Decision**: ✅ **Multiple initial layout modes (2-3 options)**
Users can select starting layout when opening a stack:

1. **Dependency View** (hierarchical/dagre) - Shows what depends on what (top-to-bottom flow)
2. **Topology View** (network-centric) - VPC → Subnets → Resources hierarchy
3. **Resource Type View** (grid-based) - Grouped by resource type (Lambdas, databases, etc.)

Rationale: Different diagrams benefit from different starting points. Users think in both layers (dependencies) AND zones (network/compute/storage). Implement all 2-3 to experiment and see which gets used most. Can refine/remove in later phases based on usage.

---

## New Questions & Considerations

### 6. Package Distribution & CLI Design

Since CDK-Canvas will be distributed as an npm package installed in CDK projects, several design questions arise:

**Package Name:**

- Option A: `cdk-canvas`
- Option B: `@truemark/cdk-canvas`
- Option C: `@skyionblue/cdk-canvas`

**Recommendation**: `@truemark/cdk-canvas` for namespacing and alignment with TrueMark packages.

**Decision**: ✅ **`@skyionblue/cdk-canvas`**

**CLI Command:**

- Users run `npx cdk-canvas` from their CDK project root
- Should automatically detect `cdk.out/` directory
- Open browser to `http://localhost:3000` (or similar)

**Configuration:**

- Should there be a config file? (e.g., `cdk-canvas.config.json`)
- Or rely on command-line flags? (`npx cdk-canvas --port 3001`)
- Where should `diagram-layouts/` be stored? (Project root? `.stackforge/`? `cdk.out/`?)

**Recommendation**:

- No config file for MVP (keep it simple)
- Command-line flags for port, output directory if needed
- Store layouts in `diagram-layouts/` at project root (version control friendly)

**Decision**: ✅ **Store layouts in `diagram-layouts/` at project root**

- Layouts represent manual work (time arranging, grouping, styling)
- Should be version controlled and shared with team
- Persists across `cdk synth` operations
- NOT stored in `cdk.out/` (ephemeral directory)
- No config file for MVP

**Branding Configuration:**

- TrueMark branding as built-in default
- Allow users to override with their own branding?
- If yes, how? (CLI flags? Config file? UI settings?)

**Recommendation**:

- TrueMark branding built-in as default for MVP
- Phase 2: Add branding customization via UI settings panel

**Decision**: ✅ **TrueMark branding built-in as default**

- TrueMark logos from `logos-icons/` bundled with package
- MVP: TrueMark branding only
- Phase 2: Add UI settings panel for custom logo/footer/theme override

**Dependencies Bundling:**

- Bundle frontend assets with the package?
- Or require separate build step?
- How to handle AWS icons distribution?

**Recommendation**:

- Pre-bundle all frontend assets and AWS icons in the npm package
- Users just install and run - no build step required

**Decision**: ✅ **Pre-bundle all assets in npm package**

- Frontend built and bundled into `dist/` during package publish
- AWS icons and TrueMark logos bundled in `assets/`
- Users run `npm install @skyionblue/cdk-canvas` then `npx cdk-canvas`
- Zero build step for end users

---

## Implementation Phases

### Sprint 1: Foundation (Week 1-2)

- [ ] Project setup (monorepo with frontend + server)
- [ ] Parse CDK templates (reuse cdk-dia logic)
- [ ] Basic React UI skeleton
- [ ] Display resources as nodes (static positions)
- [ ] AWS icon integration

### Sprint 2: Interactivity (Week 3-4)

- [ ] Drag & drop nodes
- [ ] Zoom & pan
- [ ] Save layout to JSON
- [ ] Load saved layout
- [ ] Sidebar with resource list

### Sprint 3: Grouping & Export (Week 5-6)

- [ ] Create custom groups
- [ ] Drag groups
- [ ] Nest groups
- [ ] PNG export with branding
- [ ] SVG export

### Sprint 4: Advanced Features (Week 7-8)

- [ ] Multi-stack support
- [ ] Edge customization
- [ ] Templates system
- [ ] Resource filtering

### Sprint 5: Polish (Week 9-10)

- [ ] Undo/redo
- [ ] Keyboard shortcuts
- [ ] Alignment tools
- [ ] Performance optimization
- [ ] Documentation

---

## Success Criteria

### MVP (Phase 1) ✅ COMPLETE

- ✅ Can load any CDK stack from `cdk.out/`
- ✅ Can drag resources to reposition them
- ✅ Three layout algorithms (dependency, topology, type)
- ✅ Can save and reload layouts
- ✅ Can export PNG (basic)
- ✅ 60+ AWS resource types with icons mapped
- ✅ Imported resources show with dashed borders
- ✅ 30 passing tests

### Phase 2 ✅ COMPLETE

- [x] Multi-stack diagrams ✅
- [x] Resource filtering ✅
- [x] Node & Edge customization ✅
- [x] Node Inspector (discovery tool) ✅
- [x] Enhanced PNG export with custom logo upload ✅
- [x] Topology layout with AWS Cloud, VPC boxes, CIDR legend ✅
- [x] Full layer management system ✅
- [x] Styling & Theming (light/dark mode, custom colors, font sizes, alignment tools) ✅
- ❌ Template system removed (doesn't fit workflow)

### Full Release (Phase 2 & 3)

- [ ] Can combine multiple stacks into one diagram
- [ ] Can create and reuse templates
- [ ] Professional-quality exports match design standards
- ✅ Fast and responsive (handles 100+ resource stacks)
- [ ] User documentation and examples

---

## Next Steps

1. ✅ **Decide on diagram library** - React Flow selected
2. ✅ **Decide on core architecture questions** - All 5 decisions made
3. **Answer package distribution questions** (Question #6 - package name, CLI design, branding config)
4. **Set up project structure** (monorepo with `packages/stackforge` and `packages/frontend`)
5. **Configure build pipeline** (bundle frontend assets into npm package)
6. **Create initial parser** (read CDK templates from `cdk.out/`, extract resources)
7. **Build basic canvas** (render nodes with AWS icons)
8. **Implement drag & drop** (user can reposition nodes)

---

## Key Architectural Decisions & Workflow Insights

### Tool Purpose & User Workflow

**What CDK-Canvas Is:**
A visual customization tool for creating design diagrams from CDK stacks. Helps developers quickly create professional diagrams by:
1. Starting with existing stack resources (from `cdk.out/`)
2. Adding proposed resources visually
3. Customizing layout, labels, and grouping
4. Exporting for meetings, PRs, and design documentation

**What CDK-Canvas Is NOT:**
- Not infrastructure documentation (that's what CloudFormation templates are for)
- Not a template system (each stack is unique)
- Not trying to be "perfect" automated layout (user control is the feature)

### Node Inspector as Discovery Tool

The Node Inspector serves dual purposes:
1. **Label editing** - Rename resources for clearer communication
2. **CloudFormation exploration** - See and experiment with available properties

Users can edit CloudFormation properties to:
- Learn what configuration options exist for a resource
- Visually propose infrastructure changes in diagrams
- Understand current vs. proposed configurations

**Important:** All property edits are visual-only and don't modify actual infrastructure.

### Layer Management Philosophy

Three types of layers with different behaviors:

1. **System Layers** (AWS Cloud, VPC boxes, CIDR legend)
   - Auto-generated from topology layout
   - Can be toggled on/off
   - Cannot be deleted (structural diagram elements)
   - AWS Cloud/VPC: Clickable badges for resize/recolor
   - Legend: Double-click to edit display names

2. **Custom Groups** (user-created containers)
   - Full user control (edit, delete, toggle)
   - 6 color options for visual organization
   - Can contain any selection of nodes

3. **CIDR Legend** (hybrid system/content layer)
   - System-generated but content-editable
   - Positioned bottom-right of AWS Cloud box
   - Extracts VPCs/Subnets from CloudFormation
   - Users can customize display names
   - Toggleable but not deletable

### Topology Layout Design

Topology mode creates a network-centric view:
- **AWS Cloud box** - Top-level boundary (orange)
- **VPC boxes** - Network containers (green)
- **Resources** - Positioned within VPCs or external
- **CIDR Legend** - Embedded node showing network blocks

Key decisions:
- Boxes use `pointerEvents: 'none'` so only badges are clickable
- Legend is a draggable node (not sidebar) so it exports with diagram
- VPC/Subnet CIDR blocks extracted from CloudFormation properties

### Multi-Selection Implementation

React Flow doesn't expose selection state changes, so we poll:
- `setInterval(updateSelectionCount, 100)`
- Reads `reactFlowInstance.getNodes()` to get current selection
- Only counts `resourceNode` types (excludes groups, legend)
- Enables "Group (N)" button when nodes selected

### Export Customization

Export system uses `html-to-image` with wrapper div:
- Creates temporary container with logo, title, footer
- Clones React Flow canvas into wrapper
- Exports wrapper as PNG (captures everything)
- Logo uploaded as base64 data URL
- Title/footer rendered with absolute positioning

---

## Notes & Ideas

- Could we integrate this back into the cdk-dia CLI? `tm-cdk-dia --interactive` launches the web UI?
- Template marketplace: users could share layouts for common patterns
- AI suggestions: "This looks like a 3-tier web app, want to apply that template?"
- Export to Mermaid/PlantUML for documentation
- Integration with CDK diff: highlight what changed between deployments
- Cost estimates: show $/month for each resource
- Security scanning: highlight security groups with 0.0.0.0/0
