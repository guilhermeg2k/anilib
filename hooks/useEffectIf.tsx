import { useEffect } from 'react';

const useEffectIf = (
  effect: () => void,
  condition: boolean,
  deps: Array<any>
) => {
  useEffect(() => {
    if (condition) {
      effect();
    }
  }, [deps, effect, condition]);
};

export default useEffectIf;
