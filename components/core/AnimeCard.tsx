import Image from 'next/image';
import Link from 'next/link';

interface AnimeCardProps {
  id: string;
  name: string;
  coverUrl: string;
}

const AnimeCard: React.FunctionComponent<AnimeCardProps> = ({
  id,
  name,
  coverUrl,
}) => {
  return (
    <Link href={`/anime/${id}`}>
      <a className="flex flex-col gap-2 text-center focus:scale-110 hover:scale-110 duration-300   focus:outline-none">
        <div className="w-full">
          <Image
            src={coverUrl}
            className="rounded-md"
            alt={`${name} cover image`}
            layout="responsive"
            width={460}
            height={639}
          />
        </div>
        <h2 className="uppercase text-base md:text-sm lg:text-base 2xl:text-lg">
          {name}
        </h2>
      </a>
    </Link>
  );
};

export default AnimeCard;
