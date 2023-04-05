import EpisodeService from '@services/episodeService';
import { z } from 'zod';
import { createRouter, procedure } from '../trpc';

export const episodeRouter = createRouter({
  listByAnimeId: procedure
    .input(z.object({ animeId: z.string() }))
    .query(({ input }) => {
      const { animeId } = input;
      return EpisodeService.listByAnimeId(animeId);
    }),
});
