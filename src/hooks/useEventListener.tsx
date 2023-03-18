import { useEffect } from 'react';

export const useEventListener = <K extends keyof DocumentEventMap>(
  type: K,
  handler: (event: DocumentEventMap[K]) => void
) => {
  useEffect(() => {
    document.addEventListener(type, handler);
    return () => {
      document.removeEventListener(type, handler);
    };
  }, [type, handler]);
};
