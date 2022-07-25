import Logo from '@components/Logo';
import MaterialIcon from '@components/MaterialIcon';
import { Transition } from '@headlessui/react';
import { FunctionComponent, ReactNode, useState } from 'react';
import SettingsModal from './SettingsModal';

interface NavbarButtonProps {
  onClick: () => void;
  className?: string;
  children: ReactNode;
}

const NavbarButton: FunctionComponent<NavbarButtonProps> = ({
  onClick,
  className = '',
  children,
}) => {
  return (
    <button
      className={`${className} text-rose-700 hover:text-rose-500 duration-200 ease-in-out h-[24px]`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

interface NavbarProps {
  onSearchChange?: (text: string) => void;
}

const Navbar: FunctionComponent<NavbarProps> = ({ onSearchChange }) => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const onSearchFieldChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = event.target.value;
    onSearchChange ? onSearchChange(newValue) : null;
  };

  const onSearchTogglerHandler = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const onSettingsModalToggleHandler = () => {
    setIsSettingsModalOpen(!isSettingsModalOpen);
  };

  return (
    <nav className="sticky top-0 z-10 opacity-95 w-full">
      <div className="h-[70px] md:h-[90px] bg-neutral-800 w-full flex items-center justify-between  px-4 md:px-36 lg:px-52">
        <Logo className="text-[35px] md:text-[47px]" />
        <div className="flex items-center gap-4">
          {onSearchChange && (
            <NavbarButton onClick={onSearchTogglerHandler}>
              <MaterialIcon className="md-26">search</MaterialIcon>
            </NavbarButton>
          )}
          <NavbarButton onClick={onSettingsModalToggleHandler}>
            <MaterialIcon>settings</MaterialIcon>
          </NavbarButton>
        </div>
      </div>

      {isSearchOpen && onSearchChange && (
        <div className="w-full bg-neutral-900 py-10 px-96">
          <input
            type="text"
            name="search_field"
            id="search_field"
            onChange={onSearchFieldChangeHandler}
            placeholder="Kimetsu no Yaiba"
            className="w-full p-2 outline-none focus:ring-0 bg-neutral-900 border-0 border-b-2  text-xl focus:border-b-2 focus:border-rose-700"
            autoComplete="off"
            autoFocus
          />
        </div>
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          open={isSettingsModalOpen}
          onClose={onSettingsModalToggleHandler}
        />
      )}
    </nav>
  );
};

export default Navbar;
