import { Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';

type FadeTransitionProps = {
  show: boolean;
  children: ReactNode;
};

const FadeTransition: React.FC<FadeTransitionProps> = ({ show, children }) => {
  return (
    <Transition appear show={show} as={Fragment}>
      <Transition.Child
        enter="ease-in duration-100"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        {children}
      </Transition.Child>
    </Transition>
  );
};

export default FadeTransition;
