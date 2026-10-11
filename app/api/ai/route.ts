import { connection } from "next/server";
import { AiError, aiConfig, generateDrafts, parseDraftRequest } from "@/lib/ai/live";

/**
 * Server-side endpoint for optional live AI drafting. The browser never sees the API key: it only learns
 * whether live AI is configured, and receives drafts or a safe error message.
 */

const MAX_BODY_BYTES = 20_000;

// Each draft costs real money, so cap requests per server process (a simple sliding window).
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const recent: number[] = [];

function rateLimited(): boolean {
  const now = Date.now();
  while (recent.length && now - recent[0] > WINDOW_MS) recent.shift();
  if (recent.length >= MAX_PER_WINDOW) return true;
  recent.push(now);
  return false;
}

function failure(error: AiError) {
  return Response.json({ ok: false, code: error.code, error: error.message }, { status: error.status });
}

/** Lets the UI show or hide the live option. Never includes the key. */
export async function GET() {
  await connection(); // read the environment per request, not once at build time
  const { configured, model } = aiConfig();
  return Response.json({ configured, model: configured ? model : null }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    // Requiring JSON means a cross-site form post can't trigger a paid generation.
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      throw new AiError("invalid_request", 415, "Requests must be sent as JSON.");
    }
    if (!aiConfig().configured) throw new AiError("not_configured", 503, "Live AI isn't configured on this server.");

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) throw new AiError("invalid_request", 413, "That request is too large.");
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      throw new AiError("invalid_request", 400, "Request body must be valid JSON.");
    }
    const draftRequest = parseDraftRequest(body);

    if (rateLimited()) throw new AiError("rate_limited", 429, "Too many AI requests. Wait a minute and try again.");

    const { model, posts } = await generateDrafts(draftRequest);
    return Response.json({ ok: true, model, posts }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof AiError) return failure(error);
    console.error("[signalpost] unexpected AI route error:", error instanceof Error ? error.message : "unknown");
    return failure(new AiError("provider_unavailable", 500, "Something went wrong while generating. Please try again."));
  }
}
