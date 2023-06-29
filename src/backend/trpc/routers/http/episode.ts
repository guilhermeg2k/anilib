import { z } from 'zod';
import { createRouter, procedure } from '../../trpc';
import EpisodeService from '@backend/service/episode';

export const episodeRouter = createRouter({
  listByAnimeId: procedure
    .input(z.object({ animeId: z.string().uuid() }))
    .query(({ input }) => {
      const { animeId } = input;
      return EpisodeService.listByAnimeId(animeId);
    }),

  getByIdWithSubtitles: procedure
    .input(z.object({ id: z.string().uuid() }))
    .query(({ input }) => {
      const { id } = input;
      return EpisodeService.getByIdWithSubtitles(id);
    }),
});
