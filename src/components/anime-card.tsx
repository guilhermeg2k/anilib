import Image from 'next/image';
import Link from 'next/link';

type AnimeCardProps = {
  id: string;
  name: string;
  coverUrl: string;
};

const AnimeCard: React.FC<AnimeCardProps> = ({ id, name, coverUrl }) => {
  return (
    <Link
      href={{
        pathname: '/anime/[id]',
        query: { id },
      }}
    >
      <a className="flex flex-col gap-2 text-center duration-300 hover:scale-110  focus:scale-110 focus:outline-none">
        <div className="overflow-hidden rounded-md hover:border-[3px] hover:border-white">
          <Image
            src={coverUrl}
            alt={`${name} cover image`}
            layout="responsive"
            width={460}
            height={639}
          />
        </div>
        <h2 className="text-base uppercase md:text-sm lg:text-base 2xl:text-lg">
          {name}
        </h2>
      </a>
    </Link>
  );
};

export default AnimeCard;
