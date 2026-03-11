/**
 * Test Live: Remote Browser flow.
 * 1) Modal with URL input -> create config snapshot + session.
 * 2) Full-screen stream overlay with MJPEG, input forwarding via WS, Stop + expiry.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import type { WidgetConfig } from "../types";

const API_BASE = "";

type SessionState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string; code?: string }
  | {
      status: "streaming";
      sessionId: string;
      streamUrl: string;
      viewport: { width: number; height: number };
      expiresAt: number;
    };

export function TestLiveModal({
  open,
  onClose,
  config,
}: {
  open: boolean;
  onClose: () => void;
  config: WidgetConfig;
}) {
  const [url, setUrl] = useState("https://example.com");
  const [state, setState] = useState<SessionState>({ status: "idle" });
  const wsRef = useRef<WebSocket | null>(null);
  const streamContainerRef = useRef<HTMLDivElement>(null);
  const [expirySeconds, setExpirySeconds] = useState(0);

  const closeSession = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (state.status === "streaming") {
      fetch(`${API_BASE}/api/test-live/sessions/${state.sessionId}`, { method: "DELETE" }).catch(() => {});
    }
    setState({ status: "idle" });
    setUrl("https://example.com");
    onClose();
  }, [state, onClose]);

  useEffect(() => {
    if (state.status !== "streaming") return;
    const expiresAt = state.expiresAt;
    const tick = () => {
      const s = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      setExpirySeconds(s);
      if (s <= 0) closeSession();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [state, closeSession]);

  useEffect(() => {
    if (!open || state.status !== "streaming") return;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}${API_BASE}/api/test-live/input?sessionId=${state.sessionId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [open, state.status === "streaming" ? state.sessionId : null]);

  const sendInput = useCallback(
    (msg: object) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(msg));
      }
    },
    []
  );

  const sendPointerEvent = useCallback(
    (type: string, e: { clientX: number; clientY: number; button?: number }) => {
      const r = streamContainerRef.current?.getBoundingClientRect();
      if (!r) return;
      sendInput({
        type,
        x: e.clientX - r.left,
        y: e.clientY - r.top,
        clientWidth: r.width,
        clientHeight: r.height,
        ...(e.button !== undefined && {
          button: e.button === 0 ? "left" : e.button === 2 ? "right" : "middle",
        }),
      });
    },
    [sendInput]
  );

  const handleStreamMouseMove = useCallback(
    (e: React.MouseEvent) => sendPointerEvent("mousemove", e),
    [sendPointerEvent]
  );
  const handleStreamMouseDown = useCallback(
    (e: React.MouseEvent) => sendPointerEvent("mousedown", e),
    [sendPointerEvent]
  );
  const handleStreamMouseUp = useCallback(
    (e: React.MouseEvent) => sendPointerEvent("mouseup", e),
    [sendPointerEvent]
  );
  const handleStreamClick = useCallback(
    (e: React.MouseEvent) => sendPointerEvent("click", e),
    [sendPointerEvent]
  );
  const handleStreamWheel = useCallback(
    (e: React.WheelEvent) => {
      sendInput({ type: "scroll", deltaX: e.deltaX, deltaY: e.deltaY });
    },
    [sendInput]
  );
  const handleStreamKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      sendInput({ type: "keydown", key: e.key });
    },
    [sendInput]
  );
  const handleStreamKeyUp = useCallback(
    (e: React.KeyboardEvent) => {
      sendInput({ type: "keyup", key: e.key });
    },
    [sendInput]
  );

  const startSession = async () => {
    setState({ status: "loading" });
    try {
      const snapshotRes = await fetch(`${API_BASE}/api/config-snapshots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      if (!snapshotRes.ok) throw new Error("Failed to create config snapshot");
      const { configToken } = await snapshotRes.json();

      const sessionRes = await fetch(`${API_BASE}/api/test-live/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), configToken }),
      });
      const data = await sessionRes.json().catch(() => ({}));
      if (!sessionRes.ok) {
        setState({
          status: "error",
          message: data.error || "Failed to start session",
          code: data.code,
        });
        return;
      }
      setState({
        status: "streaming",
        sessionId: data.sessionId,
        streamUrl: `${API_BASE}${data.streamUrl}`,
        viewport: data.viewport || { width: 1280, height: 720 },
        expiresAt: data.expiresAt || Date.now() + 10 * 60 * 1000,
      });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Failed to start session",
      });
    }
  };

  if (!open) return null;

  if (state.status === "streaming") {
    const streamFullUrl =
      window.location.origin + (state.streamUrl.startsWith("/") ? state.streamUrl : "/" + state.streamUrl);
    return (
      <div
        className="fixed inset-0 z-[9999] flex flex-col bg-black"
        style={{ top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-black/70 text-white z-10">
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 14 }}>
            Live Preview — Session expires in {expirySeconds}s
          </span>
          <button
            type="button"
            onClick={closeSession}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-medium text-sm"
          >
            Stop session
          </button>
        </div>
        <div
          ref={streamContainerRef}
          className="flex-1 flex items-center justify-center min-h-0 overflow-hidden"
          onMouseMove={handleStreamMouseMove}
          onMouseDown={handleStreamMouseDown}
          onMouseUp={handleStreamMouseUp}
          onClick={handleStreamClick}
          onWheel={handleStreamWheel}
          onKeyDown={handleStreamKeyDown}
          onKeyUp={handleStreamKeyUp}
          tabIndex={0}
          role="application"
          aria-label="Remote browser stream"
        >
          <img
            src={streamFullUrl}
            alt="Remote browser"
            className="max-w-full max-h-full object-contain"
            style={{ pointerEvents: "none", userSelect: "none" }}
            draggable={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontFamily: "Inter, sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
          Test Live
        </h2>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#5D666F", marginBottom: 16 }}>
          Enter a URL. A remote browser will open it and inject the widget. Session expires in 10 minutes.
        </p>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full border border-[#DEE5EB] rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#205AE3]"
          style={{ fontFamily: "Inter, sans-serif" }}
        />
        {state.status === "error" && (
          <p className="text-red-600 text-sm mb-4" style={{ fontFamily: "Inter, sans-serif" }}>
            {state.message}
          </p>
        )}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#DEE5EB] text-[#25252A] hover:bg-gray-50 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={startSession}
            disabled={state.status === "loading"}
            className="px-4 py-2 rounded-lg bg-[#205AE3] text-white hover:bg-[#1644b8] disabled:opacity-50 text-sm font-medium"
          >
            {state.status === "loading" ? "Starting…" : "Start"}
          </button>
        </div>
      </div>
    </div>
  );
}
