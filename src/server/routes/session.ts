import express from 'express';
import * as fs from 'fs';

interface SseClient {
  res: express.Response;
}

let pendingState: unknown = null;
const sseClients: SseClient[] = [];

/**
 * Setup routes for session persistence.
 *
 * @param app - Express application
 * @param sessionPath - Path to write the session file on shutdown
 */
export function setupSessionRoutes(
  app: express.Application,
  sessionPath: string,
): void {
  // SSE endpoint — browser connects here to receive the shutdown signal
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    res.write('data: {"type":"connected"}\n\n');

    const client: SseClient = {res};
    sseClients.push(client);

    req.on('close', () => {
      const idx = sseClients.indexOf(client);
      if (idx !== -1) sseClients.splice(idx, 1);
    });
  });

  // Browser posts state here periodically and immediately before shutdown
  app.post('/api/session', (req, res) => {
    pendingState = req.body;
    res.json({ok: true});
  });

  // Browser reads this on startup to check for a saved session
  app.get('/api/session', (_req, res) => {
    if (fs.existsSync(sessionPath)) {
      try {
        const content = fs.readFileSync(sessionPath, 'utf-8');
        res.json(JSON.parse(content));
        return;
      } catch {
        // Fall through to null if the file is corrupt
      }
    }
    res.json(null);
  });

  // Clear the saved session (called after user dismisses the restore banner)
  app.delete('/api/session', (_req, res) => {
    try {
      if (fs.existsSync(sessionPath)) {
        fs.unlinkSync(sessionPath);
      }
      pendingState = null;
    } catch {
      // Ignore cleanup errors
    }
    res.json({ok: true});
  });
}

/**
 * Notify all connected browsers that the server is shutting down.
 */
export function broadcastShutdown(): void {
  for (const client of sseClients) {
    try {
      client.res.write('data: {"type":"shutdown"}\n\n');
    } catch {
      // Client already disconnected
    }
  }
}

/**
 * Return the most recently received session state payload.
 */
export function getPendingState(): unknown {
  return pendingState;
}
