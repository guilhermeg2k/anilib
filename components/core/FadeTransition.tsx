import { Transition } from '@headlessui/react';
import { Fragment, FunctionComponent } from 'react';

interface FadeTransitionProps {
  show: boolean;
  children: React.ReactNode;
}

const FadeTransition: FunctionComponent<FadeTransitionProps> = ({
  show,
  children,
}) => {
  return (
    <Transition appear show={show} as={Fragment}>
      <Transition.Child
        enter="ease-in duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        {children}
      </Transition.Child>
    </Transition>
  );
};

export default FadeTransition;
