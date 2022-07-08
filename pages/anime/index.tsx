import Badge from '@components/core/Badge';
import Button from '@components/core/Button';
import Episode from '@components/core/Episode';
import Navbar from '@components/core/Navbar';
import Page from '@components/core/Page';
import type { NextPage } from 'next';
import Image from 'next/image';

const animeCategories = [
  { id: 1, name: 'action' },
  { id: 2, name: 'drama' },
  { id: 3, name: 'fantasy' },
  { id: 4, name: 'mistery' },
];

const animeEpisodes = [
  { id: 1, name: '[Shingeki no Kyojin Final Season] Episode 83 - Pride' },
  { id: 2, name: '[Shingeki no Kyojin Final Season] Episode 83 - Pride' },
  { id: 3, name: '[Shingeki no Kyojin Final Season] Episode 83 - Pride' },
  { id: 5, name: '[Shingeki no Kyojin Final Season] Episode 83 - Pride' },
  { id: 6, name: '[Shingeki no Kyojin Final Season] Episode 83 - Pride' },
  { id: 7, name: '[Shingeki no Kyojin Final Season] Episode 83 - Pride' },
  { id: 8, name: '[Shingeki no Kyojin Final Season] Episode 83 - Pride' },
];

const Anime: NextPage = () => {
  const getCategoryColorClass = (colorSeed: number) => {
    const colorIndex = (colorSeed + 1) % 4;
    switch (colorIndex) {
      case 0:
        return 'bg-purple-400 text-400';
      case 1:
        return 'bg-amber-300 text-white';
      case 2:
        return 'bg-lime-300 text-white';
      case 3:
        return 'bg-blue-300 text-white';

      default:
        return '';
    }
  };

  const imageCover = (
    <Image
      src="https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx110277-qDRIhu50PXzz.jpg"
      alt="Anime Cover Image"
      layout="intrinsic"
      width={415}
      height={588}
    />
  );

  const categories = animeCategories.map((category, index) => (
    <Badge key={category.id} className={`${getCategoryColorClass(index)}`}>
      {category.name}
    </Badge>
  ));

  const episodes = animeEpisodes.map((episode) => (
    <Episode className="w-full" key={episode.id}>
      {episode.name}
    </Episode>
  ));

  return (
    <Page>
      <Navbar />
      <main className="flex flex-col items-center lg:items-start lg:pt-16">
        <section className="flex flex-col items-center lg:items-start lg:justify-center lg:flex-row gap-8">
          <div>
            <figure className="hidden lg:block lg:w-[315px] xl:w-[415px]">
              {imageCover}
            </figure>
          </div>
          <div className="flex flex-col gap-4">
            <header className="flex flex-col items-center lg:items-start  gap-2 lg:gap-0">
              <div className="flex justify-between items-center lg:items-start gap-2 md:w-full ">
                <h1 className="text-rose-700 text-2xl lg:text-4xl font-bold">
                  Shingeki no Kyojin: The Final Season
                </h1>
                <Button>edit</Button>
              </div>
              <figure className="w-[130px] md:w-[170px] lg:hidden">
                {imageCover}
              </figure>
              <div className="flex gap-3 mt-4 flex-wrap">{categories}</div>
            </header>
            <p className="text-sm lg:text-xl">
              It’s been four years since the Scout Regiment reached the
              shoreline, and the world looks different now. Things are heating
              up as the fate of the Scout Regiment—and the people of Paradis—are
              determined at last. However, Eren is missing. Will he reappear
              before age-old tensions between Marleyans and Eldians result in
              the war of all wars?
            </p>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold">TV 16 EPISODES</span>
              <span className="text-xs">FINISHED</span>
            </div>
            <div className="flex flex-col gap-2 lg:h-[400px]">
              <h2 className="font-bold text-lg text-rose-700">
                AVAILABLE EPISODES
              </h2>
              <div className="flex flex-col gap-2 overflow-auto max-h-max pr-2">
                {episodes}
              </div>
            </div>
          </div>
        </section>
      </main>
    </Page>
  );
};

export default Anime;
