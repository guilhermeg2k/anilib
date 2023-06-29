import { useEffect } from 'react';

export const useCueChange = (
  textTrack: TextTrack | null | undefined,
  callback: () => void
) => {
  useEffect(() => {
    if (!textTrack) {
      return;
    }
    textTrack.addEventListener('cuechange', callback);
    return () => {
      textTrack.removeEventListener('cuechange', callback);
    };
  }, [textTrack, callback]);
};
