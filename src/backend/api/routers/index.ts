import { createRouter } from '../trpc';
import { animeRouter } from './anime';
import { episodeRouter } from './episode';

export const appRouter = createRouter({
  anime: animeRouter,
  episode: episodeRouter,
});

export type AppRouter = typeof appRouter;
