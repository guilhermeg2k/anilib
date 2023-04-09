import { LibraryStatus } from '@common/constants/library-status';
import { atom, useAtom } from 'jotai';

const statusAtom = atom<LibraryStatus>(LibraryStatus.Updated);

export const useLibraryStatusStore = () => {
  const [status, setStatus] = useAtom(statusAtom);
  return {
    status,
    setStatus,
  };
};
