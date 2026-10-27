import { addClient } from '@/lib/realtime';


export async function GET() {
  const encoder = new TextEncoder();
  let cleanup;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial heartbeat to keep connection alive
      controller.enqueue(encoder.encode('event: connected\ndata: {"status":"connected"}\n\n'));

      // Register client listener with broadcaster
      cleanup = addClient((data) => {
        try {
          controller.enqueue(encoder.encode(data));
        } catch {
          // Client stream closed
        }
      });
    },
    cancel() {
      if (cleanup) cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
