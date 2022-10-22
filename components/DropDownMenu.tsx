import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface DropDownMenuProps {
  items: Array<React.ReactNode>;
  className?: string;
  children: React.ReactNode;
}

const DropDownMenu = ({
  items,
  className = '',
  children,
}: DropDownMenuProps) => {
  return (
    <Menu as="div" className={`${className} relative inline-block text-left`}>
      <Menu.Button>{children}</Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 flex w-[250px] origin-top-left flex-col  bg-white text-sm uppercase shadow-md text-black rounded-sm">
          {items}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default DropDownMenu;
