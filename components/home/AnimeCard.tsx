import Image from 'next/image';

interface AnimeCardProps {
  name: string;
  coverUrl: string;
}

const AnimeCard: React.FunctionComponent<AnimeCardProps> = ({
  name,
  coverUrl,
}) => {
  return (
    <button className="flex flex-col gap-2 text-center hover:scale-110 duration-300 max-w-[250px]">
      <div className="w-[250px]">
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
    </button>
  );
};

export default AnimeCard;
