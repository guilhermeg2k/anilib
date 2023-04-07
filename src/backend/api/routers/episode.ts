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

  getById: procedure.input(z.object({ id: z.string() })).query(({ input }) => {
    const { id } = input;
    return EpisodeService.getById(id);
  }),

  getCoverImageBase64ById: procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const { id } = input;
      return EpisodeService.getCoverImageBase64ById(id);
    }),
});