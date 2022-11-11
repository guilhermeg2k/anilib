import { LibraryStatus } from '@backend/constants/libraryStatus';
import create from 'zustand';

type LibraryStatusState = {
  status: LibraryStatus | null;
  setStatus: (status: LibraryStatus) => void;
};

const useLibraryStatusStore = create<LibraryStatusState>((set) => ({
  status: null,
  setStatus: (status: LibraryStatus) =>
    set(() => ({
      status,
    })),
}));

export default useLibraryStatusStore;
