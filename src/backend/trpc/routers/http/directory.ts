import { z } from 'zod';
import { createRouter, procedure } from '../../trpc';
import DirectoryService from '@backend/service/directoryService';

export const directoryRouter = createRouter({
  list: procedure.query(() => {
    return DirectoryService.list();
  }),

  create: procedure
    .input(z.object({ directory: z.string() }))
    .mutation(({ input }) => {
      const { directory } = input;
      return DirectoryService.create(directory);
    }),

  delete: procedure
    .input(z.object({ directory: z.string() }))
    .mutation(({ input }) => {
      const { directory } = input;
      return DirectoryService.delete(directory);
    }),
});
