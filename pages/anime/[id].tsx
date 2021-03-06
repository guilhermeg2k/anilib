import { Anime, Episode } from '@backend/database/types';
import Badge from '@components/Badge';
import EpisodeCard from '@components/EpisodeCard';
import Navbar from '@components/Navbar';
import Page from '@components/Page';
import AnimeService from '@services/animeService';
import EpisodeService from '@services/episodeService';
import stringUtils from '@utils/stringUtils';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';

const animeService = new AnimeService();
const episodeService = new EpisodeService();

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  const anime = await animeService.getById(id);
  const animeEpisodes = await episodeService.listByAnimeId(id);

  animeEpisodes.sort((a, b) => (a.title > b.title ? 1 : -1));

  const animeProps: AnimeProps = { anime, episodesList: animeEpisodes };
  return { props: animeProps };
};

interface AnimeProps {
  anime: Anime;
  episodesList: Array<Episode>;
}

const Anime: NextPage<AnimeProps> = ({ anime, episodesList }) => {
  const getCategoryColorClass = (colorSeed: number) => {
    const colorIndex = (colorSeed + 1) % 4;
    switch (colorIndex) {
      case 0:
        return 'bg-purple-500';
      case 1:
        return 'bg-amber-500';
      case 2:
        return 'bg-lime-500';
      case 3:
        return 'bg-blue-500';

      default:
        return '';
    }
  };

  const description = stringUtils.removeHTMLTags(anime.description);

  const imageCover = (
    <Image
      src={anime.coverUrl}
      alt={`${anime.title.native} Cover Image`}
      layout="intrinsic"
      width={415}
      height={588}
    />
  );

  const genres = anime.genres.map((genre, index) => (
    <Badge key={genre} className={`${getCategoryColorClass(index)}`}>
      {genre}
    </Badge>
  ));

  const releaseYear = new Date(anime.releaseDate).getFullYear();
  const releaseMonth = new Date(anime.releaseDate).toLocaleString('default', {
    month: 'long',
  });

  const episodes = episodesList.map((episode) => (
    <EpisodeCard className="w-full" key={episode.id} episodeId={episode.id!}>
      {episode.title}
    </EpisodeCard>
  ));

  return (
    <>
      <Head>
        <title>{anime.title.romaji}</title>
      </Head>
      <Navbar />
      <Page>
        <main className="flex flex-col items-center lg:items-start">
          <section className="flex flex-col items-center lg:items-start lg:justify-center lg:flex-row lg:gap-8">
            <div>
              <figure className="hidden lg:block lg:w-[315px] xl:w-[415px]">
                {imageCover}
              </figure>
            </div>
            <div className="flex flex-col gap-4">
              <header className="flex flex-col items-center lg:items-start  gap-2 lg:gap-0">
                <div className="flex justify-between items-center lg:items-start gap-2 md:w-full ">
                  <h1 className="text-rose-700 text-2xl lg:text-4xl font-bold">
                    {anime.title.romaji}
                  </h1>
                </div>
                <figure className="w-[130px] md:w-[170px] lg:hidden">
                  {imageCover}
                </figure>
                <div className="flex gap-3 mt-4 flex-wrap">{genres}</div>
              </header>
              <div className="flex flex-col gap-1">
                <span className="font-bold">{`${anime.format} - ${anime.episodes} EPISODES`}</span>
                <span className="text-sm font-semibold capitalize">{`${releaseMonth} ${releaseYear} - ${anime.status} `}</span>
              </div>
              <p className="text-sm lg:text-base">{description}</p>

              <div className="flex flex-col gap-2 lg:max-h-[400px]">
                <h2 className="font-bold text-lg text-rose-700">
                  Available Episodes
                </h2>
                <div className="flex flex-col gap-2 overflow-auto max-h-max pr-2">
                  {episodes}
                </div>
              </div>
            </div>
          </section>
        </main>
      </Page>
    </>
  );
};

export default Anime;
