import Logo from './Logo';
import { SearchIcon, CogIcon } from '@heroicons/react/solid';

const Navbar: React.FunctionComponent = () => {
  return (
    <nav className="fixed top-0 h-[70px] md:h-[96px] left-0 w-full bg-neutral-800 px-4 md:px-36 lg:px-52 flex items-center justify-between z-50 opacity-95">
      <Logo className="text-[35px] md:text-[50px]" />
      <div className="flex items-center gap-2">
        <SearchIcon className="h-7 text-rose-700" />
        <CogIcon className="h-7 text-rose-700" />
      </div>
    </nav>
  );
};

export default Navbar;
