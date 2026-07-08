import { workspaceRoot } from '@nx/devkit';

export const fixturePath = (fileName: string): string => `${workspaceRoot}/apps/brainiacs-e2e/fixtures/${fileName}`;
