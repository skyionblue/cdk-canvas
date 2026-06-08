# Styling & Theming Features (Section 2.5)

## Overview

Section 2.5 of the CDK-Canvas roadmap has been **fully implemented**. This includes a comprehensive theming system and a powerful styling panel that gives users complete control over diagram appearance.

---

## Features Implemented

### 1. Light/Dark Theme Toggle ✅

**What it does:**
- Seamless switching between light and dark color schemes
- Persists user preference in localStorage
- Smooth transitions between themes
- Comprehensive CSS variable system for consistency

**Location:**
- Toggle button in the toolbar (🌙 Dark / ☀️ Light)
- Theme context: `src/contexts/ThemeContext.tsx`
- CSS variables: `src/theme.css`

**Key Benefits:**
- Reduces eye strain in low-light environments
- Professional appearance with carefully chosen color palettes
- All UI components automatically adapt to theme changes

---

### 2. Custom Node Color Styling ✅

**What it does:**
- Customize border and background colors per resource type
- Override colors for individual selected nodes
- Visual feedback with color pickers
- Reset to defaults with one click

**Location:**
- Styling Panel → "By Type" tab for type-specific styling
- Styling Panel → "Global" tab for selected node styling

**Use Cases:**
- Color-code Lambda functions in blue, databases in green
- Highlight critical resources in red
- Match company branding guidelines
- Create visual groupings by service category

---

### 3. Font Size Adjustments ✅

**What it does:**
- Global font size control (10px - 24px)
- Per-type font size overrides
- Per-node font size customization
- Real-time preview with slider

**Location:**
- Styling Panel → "Global" tab for global settings
- Styling Panel → "By Type" tab for type-specific sizes
- Styling Panel → "Global" tab (Selected Nodes section) for individual nodes

**Use Cases:**
- Make important resource labels larger
- Reduce font size for dense diagrams
- Improve readability for presentations
- Match corporate design standards

---

### 4. Alignment Tools ✅

**What it does:**
- Align selected nodes: Left, Right, Top, Bottom, Center Horizontal, Center Vertical
- Distribute spacing evenly: Horizontal or Vertical
- Works with 2+ selected nodes
- Instant visual feedback

**Location:**
- Styling Panel → "Alignment" tab

**Operations:**
- **Align Left**: Align all left edges
- **Align Right**: Align all right edges
- **Align Top**: Align all top edges
- **Align Bottom**: Align all bottom edges
- **Center H**: Align horizontal centers
- **Center V**: Align vertical centers
- **Distribute Horizontal**: Equal spacing left-to-right
- **Distribute Vertical**: Equal spacing top-to-bottom

**Use Cases:**
- Create clean, organized layouts
- Align Lambda functions in a row
- Stack databases vertically
- Distribute API Gateway endpoints evenly

---

### 5. Comprehensive Styling Panel ✅

**What it does:**
- Single unified interface for all styling operations
- Tabbed interface (Global, By Type, Alignment)
- Modal overlay with smooth animations
- Context-aware controls (shows selected node count)

**Location:**
- Toolbar → 🎨 Styling button

**Tabs:**
1. **Global Tab**
   - Global font size slider
   - Selected nodes styling (border, background, font size)
   
2. **By Type Tab**
   - Dropdown to select resource type
   - Color pickers for border and background
   - Font size slider
   - Reset button to clear type styles
   
3. **Alignment Tab**
   - 6 alignment buttons (left, right, top, bottom, center-h, center-v)
   - 2 distribute buttons (horizontal, vertical)
   - Selected node count display

---

## Technical Implementation

### Architecture

```
src/
├── contexts/
│   └── ThemeContext.tsx          # Theme state management
├── components/
│   └── StylingPanel/
│       ├── StylingPanel.tsx      # Main styling panel component
│       ├── StylingPanel.css      # Styling panel styles
│       └── index.ts              # Exports
├── theme.css                     # CSS variables for theming
└── App.tsx                       # Integration and state management
```

### Key Concepts

**CSS Variables:**
All colors, shadows, and spacing use CSS variables (`--accent-primary`, `--bg-secondary`, etc.) that automatically switch based on the `data-theme` attribute.

**Styling State:**
```typescript
interface StylingOptions {
  globalFontSize: number;
  nodeStylesByType: Record<string, NodeStyle>;
  selectedNodeStyle?: NodeStyle;
}

interface NodeStyle {
  fontSize?: number;
  borderColor?: string;
  backgroundColor?: string;
}
```

**React Flow Integration:**
Styles are applied to node data and rendered inline via the `ResourceNode` component.

---

## User Workflows

### Scenario 1: Dark Mode for Evening Work
1. Click "🌙 Dark" button in toolbar
2. Entire interface switches to dark theme
3. Preference saved automatically

### Scenario 2: Color-Code Resource Types
1. Click "🎨 Styling" button
2. Switch to "By Type" tab
3. Select "AWS::Lambda::Function" from dropdown
4. Choose blue border color
5. All Lambda functions update instantly
6. Repeat for other types

### Scenario 3: Align Database Layer
1. Select all database resources (Shift+Click or box select)
2. Click "🎨 Styling" button
3. Switch to "Alignment" tab
4. Click "⬅️ Left" to align left edges
5. Click "↕️ Vertical" to distribute evenly
6. Perfect alignment achieved

### Scenario 4: Highlight Critical Path
1. Select critical path nodes
2. Open styling panel
3. In "Global" tab → Selected Nodes section
4. Choose red border color
5. Increase font size to 18px
6. Critical path now stands out

---

## Future Enhancements (Out of Scope for 2.5)

- Icon customization (custom SVGs per type)
- Gradient backgrounds
- Node shadows and effects
- Animation presets
- Style templates (save/load styling configurations)
- Keyboard shortcuts for alignment (Ctrl+L for align left, etc.)

---

## Testing Checklist

- [x] Theme toggle works and persists
- [x] All UI components respect theme variables
- [x] Node colors can be customized by type
- [x] Selected node styling works
- [x] Font size adjustments apply correctly
- [x] Alignment tools work with 2+ nodes
- [x] Distribute tools create even spacing
- [x] Styling panel is responsive and accessible
- [x] Reset buttons clear customizations
- [x] Changes persist through layout mode switches

---

## Completion Status

**Section 2.5: Styling & Theming** is now **100% complete** with all planned features implemented and working.

Phase 2 of the CDK-Canvas project is now **fully complete**.
