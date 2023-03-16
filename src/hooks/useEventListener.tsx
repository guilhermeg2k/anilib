import { useEffect } from 'react';

export const useEventListener = <T extends Event>(
  callback: (event: T) => void,
  type: keyof DocumentEventMap
) => {
  useEffect(() => {
    document.addEventListener(type, callback);
    return () => {
      document.removeEventListener(type, callback);
    };
  }, [type, callback]);
};
