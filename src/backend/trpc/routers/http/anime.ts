import AnimeService from '@backend/service/anime';
import { z } from 'zod';
import { createRouter, procedure } from '../../trpc';

export const animeRouter = createRouter({
  listWithAllRelations: procedure.query(() => {
    return AnimeService.listWithAllRelations();
  }),

  getWithAllRelationsById: procedure
    .input(z.object({ id: z.string().uuid() }))
    .query(({ input }) => {
      const { id } = input;
      return AnimeService.getWithAllRelationsById(id);
    }),

  syncDataWithAnilistById: procedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ input }) => {
      const { id } = input;
      return AnimeService.syncDataWithAnilistById(id);
    }),
});
