# CDK-Canvas

**Interactive CDK Diagram Designer**

Transform your AWS CDK stacks into beautiful, customizable diagrams. CDK-Canvas is a powerful web-based tool that automatically generates professional infrastructure diagrams from your CloudFormation templates, giving you complete control over layout, styling, and annotations.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/%40skyionblue%2Fcdk-canvas.svg)](https://www.npmjs.com/package/@skyionblue/cdk-canvas)

---

## ✨ Features

### 🎨 **Interactive Diagram Designer**

- **Drag & Drop**: Reposition resources with pixel-perfect precision
- **Three Layout Modes**: Dependency graph, network topology, or grouped by type
- **Multi-Stack Support**: Visualize multiple stacks in a single diagram
- **60+ AWS Resources**: Pre-mapped icons for Lambda, S3, RDS, VPC, and more

### 🎯 **Professional Customization**

- **Custom Grouping**: Create labeled containers to organize related resources
- **Annotations**: Add text notes, callouts, and highlight boxes for documentation
- **Styling Panel**: Customize colors, fonts, and alignment across your diagram
- **Light/Dark Themes**: Automatic theme switching for comfortable viewing

### 🛡️ **Security Detection**

- **Automatic Scanning**: Identifies common security misconfigurations
- **Visual Warnings**: Red badges highlight resources with security issues
- **Actionable Recommendations**: Get specific fix suggestions for each issue
- **Severity Filtering**: Focus on critical issues or review all warnings

### 📸 **Export & Share**

- **PNG/SVG Export**: Generate publication-ready diagrams
- **Custom Branding**: Add your logo, title, and footer
- **Save Layouts**: Preserve your custom arrangements
- **Layer Management**: Control visibility and z-order of all elements

---

## 🚀 Quick Start

### Installation

```bash
# Install in your CDK project
npm install --save-dev @skyionblue/cdk-canvas

# Or with pnpm
pnpm add -D @skyionblue/cdk-canvas
```

### Usage

```bash
# 1. Synthesize your CDK stack
cdk synth

# 2. Launch CDK-Canvas
npx cdk-canvas

# 3. Open http://localhost:3000 in your browser
```

---

## 🖥️ Running the Interactive Diagram Tool

CDK-Canvas is a web-based interactive tool that runs locally on your machine. Here's how to use it:

### Installation

First, install CDK-Canvas in your CDK project:

```bash
# Navigate to your CDK project
cd /path/to/your-cdk-project

# Install with npm
npm install --save-dev @skyionblue/cdk-canvas

# Or with pnpm (recommended)
pnpm add -D @skyionblue/cdk-canvas

# Or with yarn
yarn add -D @skyionblue/cdk-canvas
```

### Launching the Interactive Tool

Every time you want to create or update diagrams:

```bash
# Step 1: Synthesize your CDK stacks
cdk synth

# Step 2: Launch the interactive diagram tool
npx cdk-canvas

# The tool will:
# - Start a local web server (default: port 3000)
# - Automatically open your browser to http://localhost:3000
# - Display your CDK stacks in an interactive canvas
```

**That's it!** The web interface will open automatically. Select your stacks from the sidebar and start designing.

### Optional: Add to package.json scripts

For convenience, add CDK-Canvas to your npm scripts:

```json
{
  "scripts": {
    "diagram": "cdk synth && cdk-canvas",
    "cdk-canvas": "cdk-canvas"
  }
}
```

Then simply run:

```bash
pnpm run diagram
```

### CLI Options

Customize the server with optional flags:

```bash
# Use a different port
npx cdk-canvas --port 8080

# Point to a different cdk.out directory
npx cdk-canvas --cdk-out ./build/cdk.out

# Show help
npx cdk-canvas --help
```

### Typical Workflow

```bash
# 1. Make changes to your CDK code
vim lib/my-stack.ts

# 2. Synthesize
cdk synth

# 3. Launch diagram tool
npx cdk-canvas

# 4. In the browser:
#    - Select stacks
#    - Arrange diagram
#    - Add annotations
#    - Export PNG/SVG

# 5. Save layout for future use
#    - Click "Save" in the toolbar
#    - Layouts saved to diagram-layouts/

# 6. Next time: Load your saved layout
#    - Click "Load" and select your layout
```

The tool runs entirely locally - no data is sent to the cloud.

---

## 🎓 Using the Interactive Diagram Tool

Once you run `npx cdk-canvas`, the web interface opens at `http://localhost:3000`. Here's how to use it:

### Interface Overview

The interface consists of four main areas:

1. **Left Sidebar** - Stack selection and resource list
2. **Top Toolbar** - Layout modes, tools, and actions
3. **Center Canvas** - Interactive diagram workspace
4. **Bottom Panels** - Layers (right), Security (left, when issues found)

### Step-by-Step Workflow

#### 1. Select Your Stacks

- **Single Stack**: Check one stack to visualize it
- **Multiple Stacks**: Check 2+ stacks to create a unified diagram
- The canvas updates automatically when you select/deselect stacks

#### 2. Choose a Layout Mode

Click one of three layout buttons in the toolbar:

- **🔀 Dependencies** - Hierarchical view showing resource dependencies
- **🌐 Topology** - Network view with VPC boundaries and AWS Cloud container
- **📦 By Type** - Resources grouped by AWS service

You can switch modes anytime - your custom positioning is preserved.

#### 3. Customize Your Diagram

**Reposition Resources:**

- Click and drag any resource node
- Multi-select: Hold Shift + Click or draw a selection box
- Press `F` to fit all nodes in view

**Create Groups:**

- Select 2+ nodes
- Click **📦 Group** in toolbar
- Enter label and choose color (6 options)
- Drag group boundary to reposition

**Add Annotations:**

- Click **📝 Annotate** in toolbar
- Choose type:
  - **📄 Text Note** - Sticky note for explanations
  - **💬 Callout** - Arrow pointing to a resource
  - **🔆 Highlight Box** - Semi-transparent emphasis area
- Drag to position on canvas
- Double-click to edit text, color, size

**Connect Resources:**

- Drag from any node's edge handle (4 sides)
- Connect to another resource
- Click the edge to edit color, thickness, style

**Edit Any Element:**

- Double-click any resource → Opens Node Inspector
- Double-click any annotation → Opens Annotation Editor
- Click any edge → Opens Edge Editor

#### 4. Style Your Diagram

Click **🎨 Styling** to open the styling panel with three tabs:

**Global Tab:**

- Adjust global font size (10-24px)
- Style selected nodes (border, background, font size)

**By Type Tab:**

- Select a resource type (e.g., AWS::Lambda::Function)
- Customize color for ALL resources of that type
- Great for color-coding by service

**Alignment Tab:**

- Select 2+ nodes
- Use alignment tools (Left, Right, Top, Bottom, Center)
- Use distribute tools (Horizontal, Vertical spacing)

#### 5. Manage Layers

The **📚 Layers** panel (bottom-right) shows all elements:

- **Annotations section** - All text notes, callouts, highlights
- **Groups section** - Custom groups, AWS Cloud, VPC boxes

For each layer:

- **👁️** - Toggle visibility
- **✏️** - Edit properties
- **🗑️** - Delete (custom elements only)

#### 6. Security Review

If security issues are detected, the **🛡️ Security Panel** appears (bottom-left):

- View summary (Critical vs Warnings)
- Filter by severity
- Click any issue to highlight the affected resource
- Read recommendations for each issue

Security scans run automatically when stacks load.

#### 7. Export Your Diagram

Click **📸 Export** to open export dialog:

1. Choose format (PNG or SVG)
2. Set dimensions (default: 1920x1080)
3. Add title (optional, centered header)
4. Add footer (optional, bottom text)
5. Upload logo (optional, or use TrueMark default)
6. Click Export

The diagram downloads with all annotations, groups, and styling intact.

#### 8. Save Your Layout

Click **💾 Save** to preserve your custom arrangement:

- Enter a layout name (e.g., "production-topology")
- Saves to `diagram-layouts/<name>.json` in your project
- Load anytime with **📂 Load** button

Layouts are version-control friendly JSON files.

### Keyboard Shortcuts

| Action         | Shortcut                |
| -------------- | ----------------------- |
| Fit to view    | `F`                     |
| Save layout    | `Cmd/Ctrl + S`          |
| Multi-select   | `Shift + Click`         |
| Box select     | Click + drag on canvas  |
| Delete element | `Delete` or `Backspace` |
| Deselect all   | Click empty canvas      |

### Tips & Tricks

**Quick Multi-Select:**

- Click and drag on empty canvas to draw selection box
- Hold Shift and click multiple nodes
- Release Shift to move all selected nodes together

**Faster Grouping:**

- Select nodes first, then click Group
- The group boundary auto-calculates from selection
- Resize by dragging group corners

**Clean Layouts:**

- Use alignment tools for professional look
- Group related resources by color
- Hide less important resources with Filter dropdown

**Annotation Best Practices:**

- Use Text Notes for detailed documentation
- Use Callouts to point out specific resources
- Use Highlight Boxes to emphasize entire regions
- Choose colors that contrast with your theme (light/dark)

**Theme Switching:**

- Click **🌙 Dark** for dark mode (easier on eyes)
- Click **☀️ Light** for light mode (better for printing)
- Exports use light background by default

**Resource Filtering:**

- Click **🔍 Filter (12/12)** to hide resource types
- Great for simplifying complex diagrams
- Topology mode auto-hides plumbing resources

---

## 📖 User Guide

### Basic Workflow

1. **Load Stacks**: Check the boxes for stacks you want to visualize
2. **Choose Layout**: Select Dependency, Topology, or Type view
3. **Customize**: Drag nodes, add groups, create annotations
4. **Style**: Open the styling panel (🎨) to adjust colors and fonts
5. **Export**: Click the export button (📸) to save your diagram

### Layout Modes

#### 🔀 **Dependency View**

Hierarchical layout showing resource dependencies top-to-bottom. Perfect for understanding deployment order and data flow.

#### 🌐 **Topology View**

Network-centric layout with AWS Cloud boundary, VPC containers, and CIDR legend. Ideal for network architecture diagrams.

#### 📦 **By Type View**

Resources grouped by service type (Lambda, DynamoDB, S3, etc.). Best for resource inventory and categorization.

### Annotations

Add documentation directly on your diagrams:

- **📄 Text Notes**: Sticky notes for detailed explanations
- **💬 Callouts**: Arrows pointing to specific resources
- **🔆 Highlight Boxes**: Semi-transparent areas to emphasize regions

**To add annotations:**

1. Click **📝 Annotate** in the toolbar
2. Select type (Text Note, Callout, or Highlight Box)
3. Drag to position
4. Double-click to edit text and styling

### Security Detection

CDK-Canvas automatically scans for common security issues:

- Security Groups open to `0.0.0.0/0`
- S3 buckets without encryption or public access blocks
- RDS databases publicly accessible
- IAM roles with wildcard permissions
- Lambda URLs without authentication

**Red warning badges** (⚠️) appear on affected resources. Click issues in the Security Panel (bottom-left) to highlight and zoom to the resource.

### Keyboard Shortcuts

| Action           | Shortcut                         |
| ---------------- | -------------------------------- |
| Fit to view      | `F`                              |
| Save layout      | `Cmd/Ctrl + S`                   |
| Multi-select     | `Shift + Click` or box selection |
| Delete node/edge | `Delete` or `Backspace`          |

---

## 🎨 Advanced Features

### Custom Grouping

1. Select 2+ resource nodes
2. Click **📦 Group** in toolbar
3. Enter a label and choose a color
4. Drag the group boundary to reposition

Groups appear in the Layers Panel where you can toggle visibility, edit, or delete them.

### Styling & Theming

Open the **🎨 Styling** panel to access:

- **Global tab**: Font size and selected node styling
- **By Type tab**: Custom colors per resource type (e.g., all Lambda functions in blue)
- **Alignment tab**: Align, distribute, and organize selected nodes

**Theme Toggle**: Click **🌙 Dark** / **☀️ Light** to switch themes.

### Multi-Stack Diagrams

1. Select multiple stacks in the sidebar (checkbox each one)
2. CDK-Canvas merges them into a unified view
3. Each stack gets a visual group with a purple badge
4. Cross-stack dependencies are preserved

Perfect for visualizing entire applications spanning multiple CloudFormation stacks.

### Export Options

Click **📸 Export** to configure:

- **Format**: PNG or SVG
- **Dimensions**: Custom width/height
- **Title**: Centered header text
- **Footer**: Bottom caption
- **Logo**: Upload custom image (PNG/SVG/JPG) or use TrueMark default

All annotations, groups, and styling are included in the export.

---

## 🔧 Configuration

### CLI Options

```bash
npx cdk-canvas [options]

Options:
  --cdk-out <path>    Path to cdk.out directory (default: ./cdk.out)
  --port <number>     Server port (default: 3000)
  --help              Show help
  --version           Show version
```

### Directory Structure

```
my-cdk-project/
├── bin/
├── lib/
├── cdk.out/                   # CDK synthesis output (required)
│   ├── MyStack.template.json
│   └── manifest.json
├── diagram-layouts/           # Saved layouts (auto-created)
│   ├── production-topology.json
│   └── network-view.json
├── scripts/                   # Optional custom scripts
│   └── generate-diagrams.sh  # Example automation script
└── package.json
```

**Key Directories:**

- `cdk.out/` - **Required**. CDK synthesis output (run `cdk synth` first)
- `diagram-layouts/` - **Auto-created**. Saved layouts for version control
- `scripts/` - **Optional**. Place custom automation scripts here

### Scripts Directory

The `scripts/` directory is an optional location for automation scripts related to CDK-Canvas. Common use cases:

**Example automation script** (`scripts/generate-diagrams.sh`):

```bash
#!/bin/bash
# Automatically generate and export diagrams after CDK synth

# Synthesize CDK stacks
cdk synth

# Launch CDK-Canvas (run in CI with headless mode)
npx cdk-canvas --headless \
  --export production-topology.png \
  --export network-view.png

echo "Diagrams generated in exports/"
```

**CI/CD Integration** (`scripts/update-diagrams.sh`):

```bash
#!/bin/bash
# Update diagrams when infrastructure changes

if git diff --name-only HEAD | grep -q "^lib/"; then
  echo "Infrastructure changes detected, regenerating diagrams..."
  cdk synth
  npx cdk-canvas --headless --export-all
  git add diagram-exports/
fi
```

**Tip:** Add scripts to your package.json:

```json
{
  "scripts": {
    "diagrams": "./scripts/generate-diagrams.sh",
    "cdk-canvas": "cdk-canvas"
  }
}
```

Saved layouts are stored in `diagram-layouts/` at your project root, making them version-control friendly.

---

## 🏗️ Architecture

CDK-Canvas is built with:

- **Frontend**: React + React Flow + Vite
- **Backend**: Express server serving the UI and CDK stack data
- **Distribution**: Single npm package with bundled assets
- **Deployment**: Local-only (no cloud hosting required)

### How It Works

1. **Parse**: Reads CloudFormation templates from `cdk.out/`
2. **Layout**: Applies dagre algorithm or topology-based positioning
3. **Render**: React Flow displays nodes with AWS icons
4. **Interact**: User drags, groups, annotates, and styles
5. **Export**: `html-to-image` captures canvas as PNG/SVG

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-org/cdk-canvas.git
cd cdk-canvas

# Install dependencies
pnpm install

# Start development servers
pnpm run dev

# Run tests
pnpm run test

# Build for production
pnpm run build
```

### Project Structure

```
cdk-canvas/
├── bin/                   # CLI entry point
├── src/
│   ├── cli/               # CLI argument parsing
│   ├── lib/               # Stack parsing, icon mapping, multi-stack merging
│   ├── server/            # Express server and API routes
│   └── frontend/          # React application (bundled by Vite)
│       ├── components/
│       ├── contexts/
│       ├── lib/
│       └── types/
├── assets/                # AWS architecture icons
├── dist/                  # Compiled output (generated)
│   ├── public/            # Bundled frontend (Vite output)
│   └── ...                # Compiled server/CLI JS
├── docs/                  # Project documentation
├── vite.config.ts         # Vite config (frontend build)
├── tsconfig.json          # TypeScript config (server/CLI)
└── tsconfig.frontend.json # TypeScript config (frontend, used by Vite)
```

### Running Locally

**Terminal 1 - Frontend (hot reload at http://localhost:5173):**

```bash
pnpm run dev:frontend
```

**Terminal 2 - Backend (watch mode):**

```bash
pnpm run dev:server
```

Then point the frontend dev server's API calls at your backend by running `cdk synth` in a CDK project and launching:

```bash
node bin/cdk-canvas.js --cdk-out /path/to/cdk.out
```

---

## 🐛 Troubleshooting

### "No stacks found"

- Ensure you've run `cdk synth` in your CDK project
- Verify `cdk.out/` directory exists
- Check that `cdk.out/` contains `*.template.json` files

### "Port 3000 already in use"

```bash
# Use a different port
npx cdk-canvas --port 3001
```

### Icons not loading

- Icons are bundled with the package
- Check browser console for 404 errors
- Ensure you're using the latest version: `npm update @skyionblue/cdk-canvas`

### Export fails or looks wrong

- Ensure all nodes are visible (not off-canvas)
- Try adjusting export dimensions
- Check browser console for errors
- Hard refresh browser: `Cmd/Ctrl + Shift + R`

### Security scan missing issues

- Only scans resources with CloudFormation properties
- CDK-generated resources may use Refs/GetAtt (shown as `{Ref: ...}`)
- Custom constructs may not expose properties in CloudFormation

---

## 🗺️ Roadmap

### ✅ Completed

- Phase 1: MVP (basic visualization, layouts, export)
- Phase 2: Advanced features (multi-stack, filters, styling, themes)
- Phase 3.1: Security detection (bare bones)
- Phase 3.2: Annotations

### 🚧 Future Enhancements

- More security checks (custom rules, SIEM integration)
- Export security reports (PDF/CSV)
- Keyboard shortcuts for annotations
- Undo/redo support
- Collaboration features (comments, sharing)
- CDK construct library integration
- Cost estimation per resource
- Terraform support

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **React Flow**: Powerful React library for building node-based UIs
- **dagre**: Graph layout algorithm
- **AWS Architecture Icons**: Official AWS service icons
- **html-to-image**: Canvas-to-image conversion
- **TrueMark**: Sponsoring organization

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/cdk-canvas/issues)
- **Documentation**: See `docs/` folder for detailed guides
- **Examples**: Check `examples/` for sample CDK projects

---

## 🌟 Show Your Support

If CDK-Canvas helps you build better infrastructure, please:

- ⭐ Star the repository
- 🐛 Report bugs and suggest features
- 🔧 Contribute improvements
- 📢 Share with your team

---

**Built with ❤️ for the AWS CDK community**

Transform your infrastructure into art. Start visualizing today! 🚀
