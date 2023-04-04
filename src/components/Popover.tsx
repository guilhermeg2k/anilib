import { Popover as HeadlessUIPopover, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export const Popover = ({
  className = '',
  button,
  children,
}: {
  className?: string;
  button: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <HeadlessUIPopover className={className}>
      <HeadlessUIPopover.Button>{button}</HeadlessUIPopover.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <HeadlessUIPopover.Panel className="absolute bottom-8 z-50 w-[250px] origin-top-left flex-col rounded-sm bg-neutral-900 p-2 text-sm opacity-90 shadow-md">
          {children}
        </HeadlessUIPopover.Panel>
      </Transition>
    </HeadlessUIPopover>
  );
};
