import { toastError, toastPromise } from '@common/utils/toastify';
import Badge from '@components/badge';
import DropDownMenu from '@components/drop-down-menu';
import EpisodeCard from '@components/episode-card';
import MaterialIcon from '@components/material-icon';
import Page from '@components/page';
import Spinner from '@components/spinner';
import { Menu } from '@headlessui/react';
import { getDisplayTitle } from 'common/utils/anime';
import { removeHTMLTags, sortByStringNumbersSum } from 'common/utils/string';
import { trpc } from 'common/utils/trpc';
import { format } from 'date-fns';
import { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';

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
  } = trpc.anime.getWithAllRelationsById.useQuery({
    id,
  });

  const syncDataWithAnilistMutation =
    trpc.anime.syncDataWithAnilistById.useMutation();

  const router = useRouter();

  if (isLoadingAnime) {
    return (
      <Page title="Loading">
        <div className="h-full flex items-center justify-center">
          <Spinner />
        </div>
      </Page>
    );
  }

  if (animeLoadError) {
    toastError('Failed to load anime');
    router.push('/');
    return null;
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
      src={`data:image/png;base64,${anime.coverImage}`}
      alt={`${getDisplayTitle(anime.titles)} Cover Image`}
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
    <Page title={getDisplayTitle(anime.titles)}>
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
                  {getDisplayTitle(anime.titles)}
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
                    key={genre.id}
                    className={`${getCategoryColorClass(index)}`}
                  >
                    {genre.name}
                  </Badge>
                ))}
              </div>
            </header>
            <div className="flex flex-col gap-1">
              <span className="font-bold uppercase">
                {`${anime.format.name}`}
                {anime.numberOfEpisodes &&
                  ` - ${anime.numberOfEpisodes} Episodes`}
              </span>
              <span className="text-sm font-semibold capitalize">{`${releaseDate.month} ${releaseDate.year} - ${anime.status.name} `}</span>
            </div>
            <p className="text-sm lg:text-base">
              {removeHTMLTags(anime.description)}
            </p>

            <div className="flex flex-col gap-2 lg:max-h-[400px]">
              <h2 className="text-lg font-bold text-rose-700">
                Available Episodes
              </h2>
              <div className="flex max-h-max flex-col gap-2 overflow-auto pr-2">
                {anime.episodes
                  .sort((a, b) => sortByStringNumbersSum(a.title, b.title))
                  .map((episode) => (
                    <EpisodeCard
                      className="w-full"
                      key={episode.id}
                      episodeId={episode.id}
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
  );
};

export default Anime;
