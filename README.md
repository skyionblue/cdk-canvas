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

That's it! Select your stacks from the sidebar and start designing.

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
└── package.json
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
├── packages/
│   ├── cdk-canvas/        # Main package (backend + CLI)
│   │   ├── bin/           # CLI entry point
│   │   ├── dist/          # Built frontend assets
│   │   └── src/           # Server code
│   └── frontend/          # React application
│       ├── src/
│       │   ├── components/
│       │   ├── lib/
│       │   └── types/
│       └── vite.config.ts
├── logos-icons/           # Source assets
└── package.json           # Root workspace
```

### Running Locally

**Terminal 1 - Frontend (hot reload):**

```bash
cd packages/frontend
pnpm run dev
```

**Terminal 2 - Backend:**

```bash
cd packages/cdk-canvas
npx ts-node src/cli/index.ts --cdk-out /path/to/cdk.out
```

Open http://localhost:3000 (or the Vite dev server port).

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
