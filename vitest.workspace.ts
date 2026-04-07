import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/core/vitest.config.ts',
  'packages/common/vitest.config.ts',
  'packages/compiler/vitest.config.ts',
  'packages/platform-terminal/vitest.config.ts',
  'packages/cli/vitest.config.ts',
]);
