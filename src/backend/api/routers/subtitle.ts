import SubtitleService from '@backend/service/subtitleService';
import { z } from 'zod';
import { createRouter, procedure } from '../trpc';

export const subtitleRouter = createRouter({
  listByEpisodeId: procedure
    .input(z.object({ episodeId: z.string() }))
    .query(({ input }) => {
      const { episodeId: animeId } = input;
      return SubtitleService.listByEpisodeId(animeId);
    }),
});
