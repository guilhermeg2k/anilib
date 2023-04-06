import { createRouter } from '../trpc';
import { animeRouter } from './anime';
import { episodeRouter } from './episode';
import { episodePreviewRouter } from './episodePreview';
import { subtitleRouter } from './subtitle';

export const appRouter = createRouter({
  anime: animeRouter,
  episode: episodeRouter,
  episodePreview: episodePreviewRouter,
  subtitle: subtitleRouter,
});

export type AppRouter = typeof appRouter;
