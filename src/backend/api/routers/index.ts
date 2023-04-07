import { createRouter } from '../trpc';
import { animeRouter } from './anime';
import { directoryRouter } from './directory';
import { episodeRouter } from './episode';
import { episodePreviewRouter } from './episodePreview';
import { settingsRouter } from './settings';
import { subtitleRouter } from './subtitle';

export const appRouter = createRouter({
  anime: animeRouter,
  episode: episodeRouter,
  episodePreview: episodePreviewRouter,
  subtitle: subtitleRouter,
  directory: directoryRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
