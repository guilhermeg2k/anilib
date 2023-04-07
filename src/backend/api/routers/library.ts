import LibraryService from '@backend/service/libraryService';
import { createRouter, procedure } from '../trpc';

export const libraryRouter = createRouter({
  getStatus: procedure.query(() => {
    return LibraryService.getStatus();
  }),

  update: procedure.mutation(() => {
    return LibraryService.update();
  }),
});
