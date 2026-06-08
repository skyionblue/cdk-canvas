import express from 'express';
import cors from 'cors';
import * as path from 'path';
import {setupStacksRoutes} from './routes/stacks';
import {setupLayoutsRoutes} from './routes/layouts';

/**
 * Start the CDK-Canvas web server.
 *
 * @param port - Port number to listen on
 * @param cdkOutPath - Path to CDK output directory
 */
export function startServer(port: number, cdkOutPath: string): void {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Serve assets (AWS icons, logos) - from package root
  const assetsPath = path.join(__dirname, '../../assets');
  app.use('/assets', express.static(assetsPath));

  // Serve frontend
  const frontendPath = path.join(__dirname, '../');
  app.use(express.static(frontendPath));

  setupStacksRoutes(app, cdkOutPath);
  setupLayoutsRoutes(app, process.cwd());

  app.listen(port, () => {
    console.log(`\nCDK-Canvas server running at http://localhost:${port}`);
    console.log('Open this URL in your browser to start designing diagrams.\n');
  });
}
