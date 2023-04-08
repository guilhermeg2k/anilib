import { createRouter } from '@backend/trpc';
import { animeRouter } from './http/anime';
import { directoryRouter } from './http/directory';
import { episodeRouter } from './http/episode';
import { episodePreviewRouter } from './http/episodePreview';
import { settingsRouter } from './http/settings';
import { subtitleRouter } from './http/subtitle';

export const httpRouter = createRouter({
  anime: animeRouter,
  episode: episodeRouter,
  episodePreview: episodePreviewRouter,
  subtitle: subtitleRouter,
  directory: directoryRouter,
  settings: settingsRouter,
});

export type HttpRouter = typeof httpRouter;
