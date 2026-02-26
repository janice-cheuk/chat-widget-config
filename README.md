# Chat Widget

A configurable chat widget with live preview, built with React, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- **Theme Selection**: Choose from Vibrant, Minimalist, or Glass themes
- **Brand Color Binding**: Automatically applies brand colors to theme-specific elements
- **WCAG AA Contrast**: Automatically selects black or white text for optimal readability
- **UI Roundness**: Configure border radius (Circle, Oval, Rectangle, Square)
- **Typography Controls**: Font family and size selection
- **Launcher Configuration**: Customize launcher color, icon, and visibility
- **Live Preview**: Real-time preview with light/dark mode support

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

## Project Structure

- `src/components/ConfigPanel.tsx` - Configuration panel with Figma-accurate styling
- `src/components/ChatPreview.tsx` - Live preview of the chat widget
- `src/theme/color.ts` - Color utilities for WCAG contrast calculation
- `src/theme/deriveTokens.ts` - Theme token derivation logic
- `src/context/WidgetConfigContext.tsx` - Configuration state management

## Design Specs

The configuration panel follows Figma design specs:
- Padding: `1.25rem`
- Gap: `1.5rem` (--Spacing-XL)
- Layout: Flex column with align-items: flex-start
- Background: `#F8F9FA`
- Border radius: `16px`

