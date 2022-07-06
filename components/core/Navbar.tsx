import Logo from './Logo';
import { SearchIcon, CogIcon } from '@heroicons/react/solid';

const Navbar: React.FunctionComponent = () => {
  return (
    <div className="fixed top-0  h-[96px] left-0 w-full bg-neutral-800 px-52 flex items-center justify-between z-50 opacity-95">
      <Logo className="text-[50px]" />
      <div className="flex items-center gap-2">
        <SearchIcon className="h-7 text-rose-700" />
        <CogIcon className="h-7 text-rose-700" />
      </div>
    </div>
  );
};

export default Navbar;
