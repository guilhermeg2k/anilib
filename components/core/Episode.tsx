import { PlayIcon } from '@heroicons/react/solid';
import { FunctionComponent } from 'react';

interface EpisodeProps {
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
}

const Episode: FunctionComponent<EpisodeProps> = ({
  className = '',
  onClick,
  children,
}) => {
  return (
    <button
      className={`${className} flex items-center gap-1  bg-neutral-800 py-2 px-4 hover:text-rose-700 duration-200 ease-in-out justify-between`}
      onClick={onClick}
    >
      <span className="text-start text-wrap">{children}</span>
      <PlayIcon className="h-7 w-7" />
    </button>
  );
};

export default Episode;
