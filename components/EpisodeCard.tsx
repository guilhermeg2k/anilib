import { PlayIcon } from '@heroicons/react/solid';
import Link from 'next/link';
import { FunctionComponent } from 'react';

interface EpisodeCardProps {
  episodeId: string;
  className?: string;
  active?: boolean;
  children: React.ReactNode;
}

const EpisodeCard: FunctionComponent<EpisodeCardProps> = ({
  episodeId,
  className = '',
  active = false,
  children,
}) => {
  const activeClass = active
    ? 'bg-rose-700'
    : 'bg-neutral-800 hover:bg-neutral-700';
  return (
    <Link href={`/episode/watch/${episodeId}`}>
      <a
        className={`${className} ${activeClass} flex items-center gap-1   py-2 px-4  duration-200 ease-in-out justify-between`}
      >
        <span className="text-start text-wrap">{children}</span>
        <div>
          <PlayIcon className="h-7 w-7" />
        </div>
      </a>
    </Link>
  );
};

export default EpisodeCard;
