# Annotations Feature - Complete Guide

## Overview

The **Annotations** feature allows you to add explanatory text, callouts, and highlights directly on your CDK diagrams. This is perfect for:
- Documenting design decisions
- Highlighting critical areas
- Adding context for presentations
- Proposing architectural changes
- Creating professional documentation

---

## Annotation Types

### 1. 📄 Text Note
**Sticky note-style annotations**

- Classic yellow note appearance
- Perfect for longer explanations
- Resizable width and height
- Custom font size (10-24px)
- 6 color options
- Comic Sans font for the "sticky note" feel

**Use Cases:**
- Document "why" decisions
- Add implementation notes
- Link to tickets or PRs
- Propose changes

---

### 2. 💬 Callout
**Arrows pointing to specific resources**

- Compact labeled boxes
- Connection handle (drag to connect)
- Arrow position: Top, Right, Bottom, Left
- Custom font size
- 6 color options
- Bold, centered text

**Use Cases:**
- Point to specific resources
- Label critical components
- Show data flow direction
- Highlight security concerns

---

### 3. 🔆 Highlight Box
**Colored boxes to emphasize areas**

- Semi-transparent backgrounds
- Dashed borders
- Optional label (appears above box)
- Resizable dimensions
- Adjustable opacity (10-80%)
- 6 color options

**Use Cases:**
- Group related resources visually
- Mark security zones
- Highlight critical paths
- Show blast radius
- Indicate deployment stages

---

## How to Use

### Adding Annotations

1. Click **"📝 Annotate"** button in toolbar
2. Select annotation type from dropdown:
   - 📄 Text Note
   - 💬 Callout
   - 🔆 Highlight Box
3. Annotation appears at center of viewport
4. Drag to reposition

### Editing Annotations

1. **Double-click** any annotation
2. Annotation Editor opens with:
   - Text/label field
   - Size controls (width/height for notes and boxes)
   - Font size slider
   - Color swatches (6 colors)
   - Arrow position (for callouts only)
   - Opacity slider (for highlight boxes only)
3. Click **Save Changes**

### Deleting Annotations

- Double-click annotation → Click **Delete** button
- Or select annotation → Delete key (coming soon)

### Connecting Callouts

1. Add a callout annotation
2. Drag from the visible handle (circle on edge)
3. Connect to any resource node
4. Arrow shows the connection

---

## Color Options

All annotation types support 6 color themes:

| Color | Light Theme | Dark Theme | Best For |
|-------|-------------|------------|----------|
| 🟡 Yellow | `#fff59d` | `#f9a825` | General notes, warnings |
| 🔵 Blue | `#e3f2fd` | `#1565c0` | Information, data flow |
| 🟢 Green | `#c8e6c9` | `#388e3c` | Success, approved, go-live |
| 🔴 Red | `#ffcdd2` | `#d32f2f` | Critical, security, urgent |
| 🟣 Purple | `#e1bee7` | `#7b1fa2` | Special, future work |
| 🟠 Orange | `#ffe0b2` | `#f57c00` | Attention, in-progress |

---

## Keyboard Shortcuts

*Coming soon:*
- `A` - Add text note
- `C` - Add callout
- `H` - Add highlight box
- `Delete` - Delete selected annotation
- `Cmd/Ctrl + D` - Duplicate annotation

---

## Integration with Existing Features

### Layers Panel
- Annotations appear in layers panel (coming soon)
- Toggle visibility
- Reorder z-index
- Quick edit/delete

### Save/Load Layouts
- Annotations save with layouts (in progress)
- Position preserved
- Styles retained
- Load with diagram

### Export
- Annotations render in PNG exports (in progress)
- Include in SVG exports (in progress)
- Position and styling preserved

### Themes
- Colors adapt to light/dark theme
- Readable in both modes
- Consistent styling

---

## Component Architecture

### Files Created

```
packages/frontend/src/components/
├── Canvas/
│   ├── TextAnnotation.tsx          # Sticky note component
│   ├── TextAnnotation.css          # Yellow note styling
│   ├── CalloutAnnotation.tsx       # Callout with arrow
│   ├── CalloutAnnotation.css       # Blue callout styling
│   ├── HighlightBox.tsx            # Semi-transparent box
│   └── HighlightBox.css            # Highlight styling
├── AnnotationEditor/
│   ├── AnnotationEditor.tsx        # Edit panel (all types)
│   ├── AnnotationEditor.css        # Editor styling
│   └── index.ts                    # Exports
└── Toolbar/
    ├── Toolbar.tsx                 # Added annotation menu
    └── Toolbar.css                 # Annotation dropdown styles
```

### Data Structures

**Text Annotation:**
```typescript
{
  id: 'annotation-text-1234567890',
  type: 'textAnnotation',
  position: {x: 400, y: 300},
  data: {
    text: 'This database handles...',
    color: '#fff59d',
    fontSize: 14,
    width: 200,
    height: 100,
  }
}
```

**Callout Annotation:**
```typescript
{
  id: 'annotation-callout-1234567890',
  type: 'calloutAnnotation',
  position: {x: 500, y: 200},
  data: {
    text: 'Critical API',
    color: '#e3f2fd',
    fontSize: 13,
    arrowPosition: 'right',
  }
}
```

**Highlight Box:**
```typescript
{
  id: 'annotation-highlight-1234567890',
  type: 'highlightBox',
  position: {x: 300, y: 150},
  data: {
    label: 'Security Zone',
    color: '#ffcdd2',
    width: 400,
    height: 300,
    opacity: 0.3,
  },
  style: {zIndex: -5}  // Behind resources
}
```

---

## Best Practices

### For Documentation
- Use **text notes** for detailed explanations
- Keep callouts short (< 30 chars)
- Use consistent colors (e.g., red = critical)
- Add notes near affected resources

### For Presentations
- Use **highlight boxes** to focus attention
- Use **callouts** for key points
- Less is more - don't over-annotate
- Use large font sizes (18-20px)

### For Design Reviews
- Yellow notes for questions
- Red highlights for concerns
- Green highlights for approved areas
- Blue callouts for data flow

### For PRs and Documentation
- Document "why" not "what"
- Link to tickets/docs in notes
- Use highlights to show scope
- Callouts for quick explanations

---

## Examples

### Security Review Diagram
```
🔴 Highlight Box (Red) - "Public Subnet"
  ↓ Contains
  💬 Callout (Red) - "Needs WAF"
  ↓ Points to
  API Gateway resource

📄 Text Note (Orange) - "TODO: Add rate limiting"
```

### Architecture Proposal
```
🟢 Highlight Box (Green) - "Approved Architecture"
🟡 Highlight Box (Yellow) - "Proposed Change"
💬 Callout (Blue) - "New microservice"
📄 Text Note - "Handles user authentication..."
```

### Production Deployment Map
```
🔵 Highlight Box - "Primary Region (us-east-1)"
🟣 Highlight Box - "DR Region (us-west-2)"
💬 Callout - "Active-Active"
📄 Text Note - "Failover time: < 5 minutes"
```

---

## Upcoming Features

- [ ] Save/load annotations with layouts
- [ ] Export annotations in PNG/SVG
- [ ] Show in layers panel
- [ ] Keyboard shortcuts
- [ ] Annotation templates (common patterns)
- [ ] Arrow customization (thickness, style)
- [ ] Rich text formatting (bold, italic)
- [ ] Markdown support in text notes
- [ ] Image annotations (logos, diagrams)
- [ ] Link annotations (clickable URLs)

---

## Technical Notes

### React Flow Integration
- Annotations are custom node types
- Registered in `nodeTypes` map
- Fully draggable and selectable
- Support handles for connections
- Z-index controlled per type

### Styling System
- Uses CSS variables (theme-aware)
- Inline styles for dynamic values
- Transitions for smooth interactions
- Shadow elevation on selection

### State Management
- Stored in `annotations` state array
- Separate from CDK resources
- Updated via callbacks
- Persisted on save (coming soon)

---

## Troubleshooting

**Annotation menu doesn't appear:**
- Make sure you've loaded stacks first
- Check toolbar shows "📝 Annotate" button
- Click the button to open dropdown

**Can't edit annotation:**
- Double-click the annotation (not single-click)
- Make sure it's not hidden behind other elements
- Check z-index if using highlight boxes

**Colors don't change:**
- Click Save Changes after selecting color
- Refresh browser if stuck
- Check theme (colors adapt to light/dark)

**Annotations disappear:**
- Currently not saved with layouts (in progress)
- Don't reload page before this feature is complete
- Export diagrams to preserve current state

---

## Feedback Welcome!

This is the first iteration of annotations. We'd love to hear:
- What annotation types are most useful?
- What colors/styles do you need?
- What keyboard shortcuts would help?
- What features are missing?

File issues or suggestions at: [GitHub Issues](https://github.com/anthropics/claude-code/issues)

---

**Status:** ✅ Core features implemented, save/load/export in progress
**Phase:** 3.2 Collaboration
**Version:** 0.2.0 (MVP ready for testing)
