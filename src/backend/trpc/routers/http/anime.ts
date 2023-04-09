import AnimeService from '@backend/service/anime-service';
import { z } from 'zod';
import { createRouter, procedure } from '../../trpc';

export const animeRouter = createRouter({
  list: procedure.query(() => {
    return AnimeService.list();
  }),

  getById: procedure.input(z.object({ id: z.string() })).query(({ input }) => {
    const { id } = input;
    return AnimeService.getById(id);
  }),

  syncDataWithAnilistById: procedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const { id } = input;
      return AnimeService.syncDataWithAnilistById(id);
    }),
});
