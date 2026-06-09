import express from 'express';
import cors from 'cors';
import * as path from 'path';
import * as fs from 'fs';
import {setupStacksRoutes} from './routes/stacks';
import {setupLayoutsRoutes} from './routes/layouts';
import {
  setupSessionRoutes,
  broadcastShutdown,
  getPendingState,
} from './routes/session';

/**
 * Start the CDK-Canvas web server.
 *
 * @param port - Port number to listen on
 * @param cdkOutPath - Path to CDK output directory
 */
export function startServer(port: number, cdkOutPath: string): void {
  const app = express();
  const sessionPath = path.join(process.cwd(), 'cdk-canvas-session.json');

  app.use(cors());
  // Session state can be large (many nodes + positions)
  app.use(express.json({limit: '10mb'}));

  // assets/ sits next to dist/ at the package root
  const assetsPath = path.join(__dirname, '../../assets');
  app.use('/assets', express.static(assetsPath));

  const frontendPath = path.join(__dirname, '../public');
  app.use(express.static(frontendPath));

  setupStacksRoutes(app, cdkOutPath);
  setupLayoutsRoutes(app, process.cwd());
  setupSessionRoutes(app, sessionPath);

  // On SIGINT/SIGTERM: notify the browser, wait for its final state POST, then save and exit
  const shutdown = () => {
    broadcastShutdown();
    setTimeout(() => {
      const state = getPendingState();
      if (state) {
        try {
          fs.writeFileSync(
            sessionPath,
            JSON.stringify(state, null, 2),
            'utf-8',
          );
          console.log(`\nSession saved to ${sessionPath}`);
        } catch (err) {
          console.error('Failed to save session:', err);
        }
      }
      process.exit(0);
    }, 1500);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  app.listen(port, () => {
    console.log(`\nCDK-Canvas server running at http://localhost:${port}`);
    console.log('Open this URL in your browser to start designing diagrams.\n');
  });
}
