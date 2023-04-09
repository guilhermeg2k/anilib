import { Menu, Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';

type MenuDropdownProps = {
  items: Array<React.ReactNode>;
  buttonClassName?: string;
  menuClassName?: string;
  children: ReactNode;
};

const MenuDropdown: React.FC<MenuDropdownProps> = ({
  items,
  buttonClassName = '',
  menuClassName = '',
  children,
}) => {
  return (
    <Menu as="div" className={`relative inline-block text-left`}>
      <Menu.Button className={buttonClassName} as="div">
        {children}
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={`${menuClassName} absolute right-[-60px] z-50 flex w-min-[140px] origin-top-left flex-col rounded-sm text-sm uppercase shadow-md`}
        >
          {items}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default MenuDropdown;
