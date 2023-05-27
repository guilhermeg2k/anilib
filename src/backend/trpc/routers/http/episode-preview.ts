import EpisodePreviewService from '@backend/service/episode-preview';
import { z } from 'zod';
import { createRouter, procedure } from '../../trpc';

export const episodePreviewRouter = createRouter({
  listByEpisodeId: procedure
    .input(z.object({ episodeId: z.string().uuid() }))
    .query(({ input }) => {
      const { episodeId } = input;
      return EpisodePreviewService.listInBase64ByEpisodeId(episodeId);
    }),
});
