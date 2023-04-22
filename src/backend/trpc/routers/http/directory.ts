import { z } from 'zod';
import { createRouter, procedure } from '../../trpc';
import DirectoryService from '@backend/service/directory';

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

  deleteByPath: procedure
    .input(z.object({ path: z.string() }))
    .mutation(({ input }) => {
      const { path } = input;
      return DirectoryService.delete(path);
    }),
});
