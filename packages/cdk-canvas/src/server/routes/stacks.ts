import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import {parseStack} from '../../lib/stack-parser';
import {CloudFormationTemplate} from '../../lib/types';

/**
 * Setup routes for CDK stack operations.
 *
 * @param app - Express application
 * @param cdkOutPath - Path to CDK output directory
 */
export function setupStacksRoutes(
  app: express.Application,
  cdkOutPath: string,
): void {
  app.get('/api/stacks', (_req, res) => {
    try {
      const stacks = listStacks(cdkOutPath);
      res.json(stacks);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to list stacks',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.get('/api/stacks/:stackName', (req, res) => {
    try {
      const stackName = req.params.stackName;
      const template = loadStackTemplate(cdkOutPath, stackName);
      const parsedStack = parseStack(stackName, template);
      res.json(parsedStack);
    } catch (error) {
      res.status(404).json({
        error: 'Stack not found',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}

function listStacks(cdkOutPath: string): string[] {
  const files = fs.readdirSync(cdkOutPath);
  return files
    .filter((file) => file.endsWith('.template.json'))
    .map((file) => file.replace('.template.json', ''));
}

function loadStackTemplate(
  cdkOutPath: string,
  stackName: string,
): CloudFormationTemplate {
  const templatePath = path.join(cdkOutPath, `${stackName}.template.json`);
  const content = fs.readFileSync(templatePath, 'utf-8');
  return JSON.parse(content) as CloudFormationTemplate;
}
