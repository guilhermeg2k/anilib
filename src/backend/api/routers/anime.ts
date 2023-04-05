import AnimeService from '@backend/service/animeService';
import { createRouter, procedure } from '../trpc';

export const animeRouter = createRouter({
  list: procedure.query(() => {
    return AnimeService.list();
  }),
});
