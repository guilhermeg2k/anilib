import LibraryService from '@backend/service/library';
import { createRouter, procedure } from '../../trpc';
import { observable } from '@trpc/server/observable';
import { TypedEventEmitter } from '@common/utils/typed-event-emitter';
import { LibraryEvent } from '@common/types/library';

export const libraryEventEmitter = new TypedEventEmitter<LibraryEvent>();

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

      libraryEventEmitter.on('UPDATE_STATUS', onUpdate);

      return () => {
        libraryEventEmitter.off('UPDATE_STATUS', onUpdate);
      };
    });
  }),
});
