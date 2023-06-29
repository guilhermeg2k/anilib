import LibraryService from '@backend/service/library';
import { createRouter, procedure } from '../../trpc';
import { observable } from '@trpc/server/observable';
import { TypedEventEmitter } from '@common/utils/typed-event-emitter';
import { LibraryStatus } from '@common/types/library';

type LibraryEvent = {
  UPDATE_STATUS: [status: LibraryStatus];
};

export const libraryEventEmitter = new TypedEventEmitter<LibraryEvent>();

export const libraryRouter = createRouter({
  getStatus: procedure.query(() => {
    return LibraryService.getStatus();
  }),

  update: procedure.mutation(() => {
    return LibraryService.update();
  }),

  onUpdate: procedure.subscription(() => {
    return observable<LibraryStatus>((emit) => {
      const onUpdate = (status: LibraryStatus) => {
        emit.next(status);
      };

      libraryEventEmitter.on('UPDATE_STATUS', onUpdate);

      return () => {
        libraryEventEmitter.off('UPDATE_STATUS', onUpdate);
      };
    });
  }),
});
