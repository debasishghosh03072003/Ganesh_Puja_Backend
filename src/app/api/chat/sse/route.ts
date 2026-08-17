import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Message from '@/models/Message';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const customStream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: 'connected' })}\n\n`));

      let lastCheck = new Date(Date.now() - 5000);

      const interval = setInterval(async () => {
        try {
          await connectDB();
          const newMessages = await Message.find({
            createdAt: { $gt: lastCheck },
            deletedAt: { $exists: false },
          })
            .populate('sender', 'name profileImage role')
            .sort({ createdAt: 1 });

          if (newMessages.length > 0) {
            lastCheck = new Date();
            controller.enqueue(
              encoder.encode(`event: message:new\ndata: ${JSON.stringify(newMessages)}\n\n`)
            );
          } else {
            // Heartbeat
            controller.enqueue(encoder.encode(`: heartbeat\n\n`));
          }
        } catch (err) {
          console.error('SSE Error:', err);
        }
      }, 3000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(customStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
