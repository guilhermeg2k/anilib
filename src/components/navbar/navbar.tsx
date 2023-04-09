import Logo from '@components/logo';
import MaterialIcon from '@components/material-icon';
import { ReactNode, useState } from 'react';
import SettingsModal from './settings-modal';

interface NavbarButtonProps {
  onClick: () => void;
  className?: string;
  children: ReactNode;
}

const NavbarButton: React.FC<NavbarButtonProps> = ({
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

const Navbar = () => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const onSettingsModalToggleHandler = () => {
    setIsSettingsModalOpen(!isSettingsModalOpen);
  };

  return (
    <nav className="sticky top-0 z-20 opacity-95 w-full">
      <div className="h-[70px] md:h-[90px] bg-neutral-800 w-full flex items-center justify-between  px-4 md:px-36 lg:px-52">
        <Logo className="text-[35px] md:text-[47px]" />
        <div className="flex items-center gap-4">
          <NavbarButton onClick={onSettingsModalToggleHandler}>
            <MaterialIcon>settings</MaterialIcon>
          </NavbarButton>
        </div>
      </div>

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
