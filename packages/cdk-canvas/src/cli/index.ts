import * as path from 'path';
import * as fs from 'fs';
import {startServer} from '../server/server';

/**
 * CLI entry point for CDK-Canvas.
 */
export function main(): void {
  const args = process.argv.slice(2);
  const port = parsePort(args) ?? 3000;
  const cdkOutPath =
    parseCdkOutPath(args) ?? path.join(process.cwd(), 'cdk.out');

  if (!fs.existsSync(cdkOutPath)) {
    console.error(`Error: CDK output directory not found at ${cdkOutPath}`);
    console.error(
      'Run "cdk synth" first to generate CloudFormation templates.',
    );
    process.exit(1);
  }

  console.log('Starting CDK-Canvas...');
  console.log(`CDK output: ${cdkOutPath}`);
  console.log(`Server port: ${port}`);

  startServer(port, cdkOutPath);
}

function parsePort(args: string[]): number | undefined {
  const portIndex = args.indexOf('--port');
  if (portIndex !== -1 && args[portIndex + 1]) {
    const port = parseInt(args[portIndex + 1], 10);
    if (!isNaN(port) && port > 0 && port < 65536) {
      return port;
    }
  }
  return undefined;
}

function parseCdkOutPath(args: string[]): string | undefined {
  const pathIndex = args.indexOf('--cdk-out');
  if (pathIndex !== -1 && args[pathIndex + 1]) {
    return path.resolve(args[pathIndex + 1]);
  }
  return undefined;
}

main();
