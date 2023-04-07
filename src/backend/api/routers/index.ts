import { createRouter } from '../trpc';
import { animeRouter } from './anime';
import { directoryRouter } from './directory';
import { episodeRouter } from './episode';
import { episodePreviewRouter } from './episodePreview';
import { libraryRouter } from './library';
import { settingsRouter } from './settings';
import { subtitleRouter } from './subtitle';

export const appRouter = createRouter({
  library: libraryRouter,
  anime: animeRouter,
  episode: episodeRouter,
  episodePreview: episodePreviewRouter,
  subtitle: subtitleRouter,
  directory: directoryRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
