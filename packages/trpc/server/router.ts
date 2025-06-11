import { adminRouter } from './admin-router/router';
import { apiTokenRouter } from './api-token-router/router';
import { artistRouter } from './artist-router/router';
import { authRouter } from './auth-router/router';
import { contractsRouter } from './contracts-router/router';
import { distributionRouter } from './distributionStatement-router/router';
import { documentRouter } from './document-router/router';
import { embeddingPresignRouter } from './embedding-router/_router';
import { fieldRouter } from './field-router/router';
import { folderRouter } from './folder-router/router';
import { IsrcSongsRouter } from './isrcsong-router/router';
import { lpmRouter } from './lpm-router/router';
import { profileRouter } from './profile-router/router';
import { recipientRouter } from './recipient-router/router';
import { releaseRouter } from './releases-router/router';
import { shareLinkRouter } from './share-link-router/router';
import { taskRouter } from './task-router/router';
import { teamRouter } from './team-router/router';
import { templateRouter } from './template-router/router';
import { router } from './trpc';
import { tuStreamsRouter } from './tustreams-router/router';
import { webhookRouter } from './webhook-router/router';

export const appRouter = router({
  auth: authRouter,
  profile: profileRouter,
  isrcSongs: IsrcSongsRouter,
  distribution: distributionRouter,
  document: documentRouter,
  field: fieldRouter,
  tuStreams: tuStreamsRouter,
  artist: artistRouter,
  folder: folderRouter,
  recipient: recipientRouter,
  task: taskRouter,
  release: releaseRouter,
  contracts: contractsRouter,
  lpm: lpmRouter,
  admin: adminRouter,
  shareLink: shareLinkRouter,
  apiToken: apiTokenRouter,
  team: teamRouter,
  template: templateRouter,
  webhook: webhookRouter,
  embeddingPresign: embeddingPresignRouter,
});

export type AppRouter = typeof appRouter;
