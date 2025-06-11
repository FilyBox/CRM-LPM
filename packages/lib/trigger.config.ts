import { syncEnvVars } from '@trigger.dev/build/extensions/core';
import { prismaExtension } from '@trigger.dev/build/extensions/prisma';
import { defineConfig } from '@trigger.dev/sdk/v3';

export default defineConfig({
  project: 'proj_ybnmrcchantwjppvcnoi',
  runtime: 'node',
  logLevel: 'log',
  // The max compute seconds a task is allowed to run. If the task run exceeds this duration, it will be stopped.
  // You can override this on an individual task.
  // See https://trigger.dev/docs/runs/max-duration
  maxDuration: 3600,
  build: {
    extensions: [
      prismaExtension({
        schema: '../prisma/schema.prisma',
        // migrate: true,
        clientGenerator: 'client',
        directUrlEnvVarName: 'NEXT_PRIVATE_DIRECT_DATABASE_URL', // optional - the name of the environment variable that contains the direct database URL if you are using a direct database URL
      }),
    ],
    // external: ['prisma-kysely'],
  },
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ['trigger'],
});
