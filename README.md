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

**Test Live (remote browser):** Runs the backend (Playwright + MJPEG stream + WebSocket input) and the Vite dev server so you can use “Test Live” from the preview.

```bash
npm run build:widget   # build injectable widget once
npm run server         # in one terminal: backend on :3001
npm run dev            # in another: Vite on :5173
```

Or use `npm run dev:all` to build the widget and start both server and Vite together (requires `concurrently`).

- **Backend:** `POST /api/config-snapshots`, `POST /api/test-live/sessions`, `GET /api/test-live/sessions/:id/stream` (MJPEG), `WS /api/test-live/input?sessionId=:id` for input forwarding. Sessions expire after 10 minutes; rate limit 3 sessions per IP.
- **Flow:** Click “Test Live” → enter URL → server launches headless Chromium, opens the URL, injects the widget script, and streams the viewport as MJPEG. You interact via the stream (mouse/keyboard sent over WebSocket). No iframes or browser extension.

### Build

```bash
npm run build
npm run build:widget    # optional: build injectable widget for Test Live
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

