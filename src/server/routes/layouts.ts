import express from 'express';
import * as fs from 'fs';
import * as path from 'path';

const LAYOUTS_DIR = 'diagram-layouts';

/**
 * Setup routes for diagram layout operations.
 *
 * @param app - Express application
 * @param projectRoot - CDK project root directory
 */
export function setupLayoutsRoutes(
  app: express.Application,
  projectRoot: string,
): void {
  const layoutsPath = path.join(projectRoot, LAYOUTS_DIR);

  app.get('/api/layouts', (_req, res) => {
    try {
      const layouts = listLayouts(layoutsPath);
      res.json(layouts);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to list layouts',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.get('/api/layouts/:layoutName', (req, res) => {
    try {
      const layoutName = req.params.layoutName;
      if (!/^[\w-]+$/.test(layoutName)) {
        res.status(400).json({error: 'Invalid layout name'});
        return;
      }
      const layout = loadLayout(layoutsPath, layoutName);
      res.json(layout);
    } catch (error) {
      res.status(404).json({
        error: 'Layout not found',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.post('/api/layouts/:layoutName', (req, res) => {
    try {
      const layoutName = req.params.layoutName;
      if (!/^[\w-]+$/.test(layoutName)) {
        res.status(400).json({error: 'Invalid layout name'});
        return;
      }
      saveLayout(layoutsPath, layoutName, req.body);
      res.json({success: true});
    } catch (error) {
      res.status(500).json({
        error: 'Failed to save layout',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.delete('/api/layouts/:layoutName', (req, res) => {
    try {
      const layoutName = req.params.layoutName;
      if (!/^[\w-]+$/.test(layoutName)) {
        res.status(400).json({error: 'Invalid layout name'});
        return;
      }
      deleteLayout(layoutsPath, layoutName);
      res.json({success: true});
    } catch (error) {
      res.status(500).json({
        error: 'Failed to delete layout',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}

function listLayouts(layoutsPath: string): string[] {
  if (!fs.existsSync(layoutsPath)) {
    return [];
  }
  const files = fs.readdirSync(layoutsPath);
  return files
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.replace('.json', ''));
}

function loadLayout(layoutsPath: string, layoutName: string): unknown {
  const layoutPath = path.join(layoutsPath, `${layoutName}.json`);
  const content = fs.readFileSync(layoutPath, 'utf-8');
  return JSON.parse(content);
}

function saveLayout(
  layoutsPath: string,
  layoutName: string,
  layout: unknown,
): void {
  if (!fs.existsSync(layoutsPath)) {
    fs.mkdirSync(layoutsPath, {recursive: true});
  }
  const layoutPath = path.join(layoutsPath, `${layoutName}.json`);
  fs.writeFileSync(layoutPath, JSON.stringify(layout, null, 2), 'utf-8');
}

function deleteLayout(layoutsPath: string, layoutName: string): void {
  const layoutPath = path.join(layoutsPath, `${layoutName}.json`);
  fs.unlinkSync(layoutPath);
}
