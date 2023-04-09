import LibraryService from '@backend/service/library-service';
import { createRouter, procedure } from '../../trpc';
import { observable } from '@trpc/server/observable';
import EventEmitter from 'events';

export const libraryEventEmitter = new EventEmitter();

export const libraryRouter = createRouter({
  getStatus: procedure.query(() => {
    return LibraryService.getStatus();
  }),

  update: procedure.mutation(() => {
    return LibraryService.update();
  }),

  onUpdate: procedure.subscription(() => {
    return observable((emit) => {
      const onUpdate = (status: string) => {
        emit.next(status);
      };

      libraryEventEmitter.on('update', onUpdate);

      return () => {
        libraryEventEmitter.off('update', onUpdate);
      };
    });
  }),
});
