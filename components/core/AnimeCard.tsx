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
      <a className="flex flex-col gap-2 text-center focus:scale-110 hover:scale-110 duration-300 max-w-[260px] focus:outline-none">
        <div className="w-[260px]">
          <Image
            src={coverUrl}
            className="rounded-md"
            alt={`${name} cover image`}
            layout="responsive"
            width={267}
            height={373}
          />
        </div>
        <h2 className="uppercase text-lg">{name}</h2>
      </a>
    </Link>
  );
};

export default AnimeCard;
