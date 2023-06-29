import { LibraryStatus } from '@common/types/library';
import { atom, useAtom } from 'jotai';

const statusAtom = atom<LibraryStatus>('UPDATED');

export const useLibraryStatusStore = () => {
  const [status, setStatus] = useAtom(statusAtom);

  return {
    status,
    setStatus,
  };
};
