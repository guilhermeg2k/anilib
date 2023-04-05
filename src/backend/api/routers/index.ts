import { createRouter } from '../trpc';
import { animeRouter } from './anime';

export const appRouter = createRouter({
  anime: animeRouter,
});

export type AppRouter = typeof appRouter;
