import Anthropic from "@anthropic-ai/sdk";
import { info } from "./_profile.js";

const MODEL = "claude-sonnet-5";
// This endpoint is public, so cap how much any one request can cost.
const MAX_TOKENS = 2048;
const MAX_HISTORY = 20;
const MAX_MESSAGE_CHARS = 2000;

const SYSTEM_PROMPT = `You are the chatbot on Gabriel's personal website. Visitors, often recruiters, classmates or friends, come here to learn about him.

Answer questions about Gabriel using the profile below. Refer to him in the third person. If the profile doesn't cover something, say you don't know that about Gabriel rather than guessing, and point them to his LinkedIn if it fits. For questions unrelated to Gabriel, answer briefly and steer back to him.

Keep replies short and conversational, usually a few sentences. The chat window renders Markdown, so use it where it helps, like a short list or a code block, but keep formatting light. Reply in the language the visitor writes in.

<profile>
${JSON.stringify(info, null, 2)}
</profile>`;

function parseMessages(body: unknown): Anthropic.MessageParam[] | null {
  const raw = (body as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(raw)) return null;

  const messages: Anthropic.MessageParam[] = [];
  for (const m of raw.slice(-MAX_HISTORY)) {
    if (m?.role !== "user" && m?.role !== "assistant") return null;
    if (typeof m.content !== "string" || !m.content || m.content.length > MAX_MESSAGE_CHARS) return null;
    messages.push({ role: m.role, content: m.content });
  }

  // Trimming the history can leave an assistant turn first; the API needs a user turn there.
  while (messages[0]?.role === "assistant") messages.shift();
  if (messages.at(-1)?.role !== "user") return null;
  return messages;
}

export async function POST(request: Request): Promise<Response> {
  const messages = parseMessages(await request.json().catch(() => null));
  if (!messages) return Response.json({ error: "Invalid request." }, { status: 400 });

  const client = new Anthropic();
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    output_config: { effort: "low" },
    system: SYSTEM_PROMPT,
    messages,
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let wroteText = false;
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
            wroteText = true;
          }
        }
        // A refusal can end the turn without any text.
        if (!wroteText) controller.enqueue(encoder.encode("Sorry, I can't help with that one."));
      } catch (err) {
        console.error("Claude request failed:", err);
        controller.enqueue(
          encoder.encode(wroteText ? "\n\n(The answer got cut off. Please try again.)" : "Sorry, something went wrong. Please try again."),
        );
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
