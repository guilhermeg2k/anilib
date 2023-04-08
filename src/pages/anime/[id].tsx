import Badge from '@components/Badge';
import DropDownMenu from '@components/DropDownMenu';
import EpisodeCard from '@components/EpisodeCard';
import MaterialIcon from '@components/MaterialIcon';
import Navbar from '@components/Navbar';
import Page from '@components/Page';
import { Menu } from '@headlessui/react';
import { formatTitle } from '@utils/animeUtils';
import { removeHTMLTags } from '@utils/stringUtils';
import { trpc } from '@utils/trpc';
import { format } from 'date-fns';
import { toastPromise } from 'library/toastify';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';

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

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id ? String(params?.id) : '';

  return {
    props: {
      id,
    },
  };
};

const Anime = ({ id }: { id: string }) => {
  const {
    data: anime,
    isLoading: isLoadingAnime,
    error: animeLoadError,
    refetch: refetchAnime,
  } = trpc.anime.getById.useQuery({
    id,
  });

  const {
    data: episodes,
    isLoading: isLoadingEpisodes,
    error: episodesLoadError,
  } = trpc.episode.listByAnimeId.useQuery({
    animeId: id,
  });

  const syncDataWithAnilistMutation =
    trpc.anime.syncDataWithAnilistById.useMutation();

  if (isLoadingAnime || isLoadingEpisodes) {
    return <Page>Loading</Page>;
  }

  if (animeLoadError || episodesLoadError) {
    return <Page>Failed to load data</Page>;
  }

  const syncDataWithAnilist = async () => {
    const syncDataWithAnilistPromise = syncDataWithAnilistMutation.mutateAsync({
      id,
    });

    await toastPromise(syncDataWithAnilistPromise, {
      pending: 'Syncing data with anilist',
      success: 'Sync completed',
      error: 'Failed to sync data',
    });

    refetchAnime();
  };

  const imageCover = (
    <Image
      src={String(anime.coverUrl)}
      alt={`${anime.title.native} Cover Image`}
      layout="intrinsic"
      width={415}
      height={588}
    />
  );

  const releaseDate = {
    year: format(new Date(anime.releaseDate), 'yyyy'),
    month: format(new Date(anime.releaseDate), 'MMMM'),
  };

  return (
    <>
      <Head>
        <title>{formatTitle(anime.title)}</title>
      </Head>
      <Navbar />
      <Page>
        <main className="flex flex-col items-center lg:items-start">
          <section className="flex w-full flex-col items-center lg:flex-row lg:items-start lg:justify-center lg:gap-8">
            <div>
              <figure className="hidden lg:block lg:w-[315px] xl:w-[415px]">
                {imageCover}
              </figure>
            </div>
            <div className="flex flex-col gap-4 lg:w-full">
              <header className="flex flex-col items-center gap-2  lg:items-start lg:gap-0">
                <div className="flex items-center justify-between gap-2 md:w-full ">
                  <h1 className="text-2xl font-bold text-rose-700 lg:text-4xl">
                    {formatTitle(anime.title)}
                  </h1>
                  <DropDownMenu
                    items={[
                      <Menu.Item
                        as="button"
                        key="sync_data_from_anilist"
                        className="flex items-center justify-between p-1 px-2 uppercase text-white hover:bg-neutral-700"
                        onClick={() => syncDataWithAnilist()}
                      >
                        Sync data from anilist
                        <MaterialIcon className="md-18">sync</MaterialIcon>
                      </Menu.Item>,
                    ]}
                    className="flex  justify-center"
                  >
                    <MaterialIcon>more_vert</MaterialIcon>
                  </DropDownMenu>
                </div>
                <figure className="w-[130px] md:w-[170px] lg:hidden">
                  {imageCover}
                </figure>
                <div className="mt-4 flex flex-wrap gap-3">
                  {anime.genres.map((genre, index) => (
                    <Badge
                      key={genre}
                      className={`${getCategoryColorClass(index)}`}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </header>
              <div className="flex flex-col gap-1">
                <span className="font-bold uppercase">
                  {`${anime.format}`}
                  {anime.episodes && ` - ${anime.episodes} Episodes`}
                </span>
                <span className="text-sm font-semibold capitalize">{`${releaseDate.month} ${releaseDate.year} - ${anime.status} `}</span>
              </div>
              <p className="text-sm lg:text-base">
                {removeHTMLTags(anime.description)}
              </p>

              <div className="flex flex-col gap-2 lg:max-h-[400px]">
                <h2 className="text-lg font-bold text-rose-700">
                  Available Episodes
                </h2>
                <div className="flex max-h-max flex-col gap-2 overflow-auto pr-2">
                  {episodes.map((episode) => (
                    <EpisodeCard
                      className="w-full"
                      key={episode.id}
                      episodeId={episode.id!}
                    >
                      {episode.title}
                    </EpisodeCard>
                  ))}
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
