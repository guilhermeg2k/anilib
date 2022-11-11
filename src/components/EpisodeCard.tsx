import Link from 'next/link';
import { ReactNode } from 'react';
import MaterialIcon from './MaterialIcon';

interface EpisodeCardProps {
  episodeId: string;
  className?: string;
  active?: boolean;
  children: ReactNode;
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({
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
        <MaterialIcon>play_circle</MaterialIcon>
      </a>
    </Link>
  );
};

export default EpisodeCard;
