import Logo from './Logo';
import { SearchIcon, CogIcon } from '@heroicons/react/solid';

const Navbar: React.FunctionComponent = () => {
  return (
    <div className="h-[96px] bg-neutral-800 px-52 flex items-center justify-between">
      <Logo className="text-5xl" />
      <div className="flex items-center gap-2">
        <SearchIcon className="h-7 text-rose-700" />
        <CogIcon className="h-7 text-rose-700" />
      </div>
    </div>
  );
};

export default Navbar;
