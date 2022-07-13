import { CogIcon, SearchIcon } from '@heroicons/react/solid';
import { FunctionComponent, ReactNode, useState } from 'react';
import Logo from '../Logo';
import SettingsModal from './SettingsModal';

interface NavbarButtonProps {
  onClick: () => void;
  children: ReactNode;
}

const NavbarButton: FunctionComponent<NavbarButtonProps> = ({
  onClick,
  children,
}) => {
  return (
    <button
      className="text-rose-700 hover:text-rose-500 duration-200 ease-in-out "
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const Navbar: FunctionComponent = () => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const onSettingsModalToggleHandler = () => {
    setIsSettingsModalOpen(!isSettingsModalOpen);
  };

  return (
    <nav className="fixed top-0 h-[70px] md:h-[96px] left-0 w-full bg-neutral-800 px-4 md:px-36 lg:px-52 flex items-center justify-between z-50 opacity-95">
      <Logo className="text-[35px] md:text-[50px]" />
      <div className="flex items-center gap-2">
        <SearchIcon className="h-7 text-rose-700" />
        <NavbarButton onClick={onSettingsModalToggleHandler}>
          <CogIcon className="h-7 " />
        </NavbarButton>
      </div>
      <SettingsModal
        open={isSettingsModalOpen}
        onClose={onSettingsModalToggleHandler}
      />
    </nav>
  );
};

export default Navbar;
