import EpisodePreviewService from '@backend/service/episodePreviewService';
import { z } from 'zod';
import { createRouter, procedure } from '../trpc';

export const episodePreviewRouter = createRouter({
  listByEpisodeId: procedure
    .input(z.object({ episodeId: z.string() }))
    .query(({ input }) => {
      const { episodeId } = input;
      return EpisodePreviewService.listInBase64ByEpisodeId(episodeId);
    }),
});
