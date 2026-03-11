/**
 * Backend: config snapshots + Remote Browser Test Live (Playwright, MJPEG stream, WS input).
 * Run: node server/index.js (port 3001). Vite proxies /api to this server.
 */
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { chromium } from "playwright";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3001;
const SESSION_TTL_MS = 10 * 60 * 1000; // 10 min
const MAX_SESSIONS_PER_IP = 3;
const VIEWPORT = { width: 1280, height: 720 };
const FRAME_INTERVAL_MS = 150;

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: true }));
app.use(express.json());

// Config snapshots (ephemeral, in-memory)
const configStore = new Map();
const CONFIG_TTL_MS = 60 * 60 * 1000;

app.post("/api/config-snapshots", (req, res) => {
  const config = req.body?.config ?? req.body;
  if (!config || typeof config !== "object") {
    return res.status(400).json({ error: "Missing config" });
  }
  const token = "cfg_" + Math.random().toString(36).slice(2, 12);
  configStore.set(token, { config, createdAt: Date.now() });
  setTimeout(() => configStore.delete(token), CONFIG_TTL_MS);
  res.json({ configToken: token, token });
});

app.get("/api/config-snapshots/:token", (req, res) => {
  const entry = configStore.get(req.params.token);
  if (!entry) return res.status(404).json({ error: "Not found" });
  res.json(entry.config);
});

// Test Live sessions
const sessions = new Map();
const ipSessionCount = new Map();

function getClientIp(req) {
  return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
}

function cleanupSession(sessionId) {
  const s = sessions.get(sessionId);
  if (!s) return;
  if (s.frameTimer) clearInterval(s.frameTimer);
  s.streamConsumers.forEach((c) => {
    try { c.res.end(); } catch (_) {}
  });
  s.streamConsumers.length = 0;
  if (s.page) s.page.close().catch(() => {});
  if (s.browser) s.browser.close().catch(() => {});
  sessions.delete(sessionId);
  if (s.clientIp) {
    const n = (ipSessionCount.get(s.clientIp) || 1) - 1;
    if (n <= 0) ipSessionCount.delete(s.clientIp);
    else ipSessionCount.set(s.clientIp, n);
  }
}

setInterval(() => {
  const now = Date.now();
  for (const [id, s] of sessions.entries()) {
    if (now - s.createdAt > SESSION_TTL_MS) cleanupSession(id);
  }
}, 60 * 1000);

app.post("/api/test-live/sessions", async (req, res) => {
  const { url, configToken } = req.body || {};
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing url" });
  }
  const clientIp = getClientIp(req);
  const count = ipSessionCount.get(clientIp) || 0;
  if (count >= MAX_SESSIONS_PER_IP) {
    return res.status(429).json({ error: "Too many sessions", code: "RATE_LIMIT" });
  }

  const sessionId = "tl_" + Math.random().toString(36).slice(2, 12);
  const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
  const widgetScriptUrl = `${baseUrl}/widget.js?configToken=${encodeURIComponent(configToken || "")}&apiBase=${encodeURIComponent(baseUrl)}`;

  let browser;
  let page;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const ctx = await browser.newContext({
      viewport: VIEWPORT,
      ignoreHTTPSErrors: true,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
    page = await ctx.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 }).catch(async (err) => {
      await browser.close();
      throw err;
    });
    await page.addScriptTag({ url: widgetScriptUrl }).catch(() => {});
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    const msg = err.message || String(err);
    const blocked = /blocked|refused|timeout|navigation|net::|certificate/i.test(msg);
    return res.status(400).json({
      error: blocked ? "Site cannot be previewed." : "Failed to load page",
      code: blocked ? "SITE_BLOCKED" : "NAVIGATION_ERROR",
    });
  }

  ipSessionCount.set(clientIp, count + 1);
  const session = {
    browser,
    page,
    createdAt: Date.now(),
    clientIp,
    streamConsumers: [],
    viewport: VIEWPORT,
  };
  sessions.set(sessionId, session);

  session.frameTimer = setInterval(async () => {
    if (!session.page) return;
    try {
      const buf = await session.page.screenshot({ type: "jpeg", quality: 80 });
      const boundary = "frame";
      const header = `--${boundary}\r\nContent-Type: image/jpeg\r\nContent-Length: ${buf.length}\r\n\r\n`;
      session.streamConsumers = session.streamConsumers.filter((c) => {
        try {
          c.res.write(header);
          c.res.write(buf);
          c.res.write("\r\n");
          return true;
        } catch (_) {
          return false;
        }
      });
    } catch (_) {}
  }, FRAME_INTERVAL_MS);

  res.json({
    sessionId,
    streamUrl: `/api/test-live/sessions/${sessionId}/stream`,
    viewport: { width: VIEWPORT.width, height: VIEWPORT.height },
    expiresAt: session.createdAt + SESSION_TTL_MS,
  });
});

app.get("/api/test-live/sessions/:id/stream", (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).end();
  res.setHeader("Content-Type", "multipart/x-mixed-replace; boundary=frame");
  res.setHeader("Cache-Control", "no-store");
  res.flushHeaders();
  session.streamConsumers.push({ res });
  req.on("close", () => {
    session.streamConsumers = session.streamConsumers.filter((c) => c.res !== res);
  });
});

app.delete("/api/test-live/sessions/:id", (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: "Not found" });
  cleanupSession(req.params.id);
  res.json({ ok: true });
});

// WebSocket: input events (path /api/test-live/input?sessionId=xxx)
const wss = new WebSocketServer({ noServer: true });
httpServer.on("upgrade", (request, socket, head) => {
  const url = new URL(request.url || "", "http://localhost");
  if (url.pathname === "/api/test-live/input") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request, url.searchParams.get("sessionId"));
    });
  } else {
    socket.destroy();
  }
});

wss.on("connection", (ws, req, sessionId) => {
  const session = sessionId ? sessions.get(sessionId) : null;
  if (!session?.page) {
    ws.close(1008, "session not found");
    return;
  }
  const page = session.page;
  const vp = session.viewport || VIEWPORT;

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      const { type, x, y, clientWidth, clientHeight, key, button, deltaX, deltaY } = msg;
      const scaleX = clientWidth ? vp.width / clientWidth : 1;
      const scaleY = clientHeight ? vp.height / clientHeight : 1;
      const px = x != null ? Math.round(x * scaleX) : 0;
      const py = y != null ? Math.round(y * scaleY) : 0;

      switch (type) {
        case "mousemove":
          page.mouse.move(px, py).catch(() => {});
          break;
        case "click":
          page.mouse.click(px, py, { button: button || "left" }).catch(() => {});
          break;
        case "mousedown":
          page.mouse.down({ button: button || "left" }).catch(() => {});
          break;
        case "mouseup":
          page.mouse.up({ button: button || "left" }).catch(() => {});
          break;
        case "scroll":
          page.mouse.wheel(deltaX ?? 0, deltaY ?? 0).catch(() => {});
          break;
        case "keydown":
          page.keyboard.press(key || "").catch(() => {});
          break;
        case "keyup":
          page.keyboard.up(key || "").catch(() => {});
          break;
        default:
          break;
      }
    } catch (_) {}
  });
  ws.on("close", () => {});
});

// Serve widget.js from dist (built by build:widget)
app.get("/widget.js", (req, res) => {
  res.type("application/javascript");
  res.sendFile(join(__dirname, "../dist/widget.js"), (err) => {
    if (err) res.status(404).end();
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
