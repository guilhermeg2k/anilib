export type LibraryStatus = 'UPDATED' | 'UPDATING' | 'FAILED';

export type LibraryEvent = {
  UPDATE_STATUS: [status: LibraryStatus];
};
