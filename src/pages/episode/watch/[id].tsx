import { httpRouter } from '@backend/trpc/routers/http';
import { sortByStringNumbersSum } from '@common/utils/string';
import { toastError } from '@common/utils/toastify';
import EpisodeCard from '@components/episode-card';
import Page from '@components/page';
import { VideoPlayer } from '@components/video-player/video-player';
import { trpc } from 'common/utils/trpc';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import SuperJSON from 'superjson';
import { createServerSideHelpers } from '@trpc/react-query/server';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id ? String(params?.id) : '';

  const helpers = createServerSideHelpers({
    router: httpRouter,
    ctx: {},
    transformer: SuperJSON,
  });

  await helpers.episode.getByIdWithSubtitles.prefetch({ id });

  return {
    props: {
      id,
      trpcState: helpers.dehydrate(),
    },
  };
};

const Watch = ({
  id,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const { data: episode } = trpc.episode.getByIdWithSubtitles.useQuery({ id });

  const { data: previews } = trpc.episodePreview.listByEpisodeId.useQuery(
    {
      episodeId: id,
    },
    {
      initialData: [],
    }
  );

  const { data: episodes } = trpc.episode.listByAnimeId.useQuery(
    { animeId: episode?.animeId ?? '' },
    {
      enabled: Boolean(episode?.animeId),
      initialData: [],
    }
  );

  if (!episode) {
    router.push('/');
    toastError('Failed to load episode');
    return null;
  }

  const onNextEpisodeHandler = () => {
    const currentEpisodeIndex = episodes.findIndex(
      (episodeItem) => episodeItem.id === episode.id
    );

    if (episodes.length > currentEpisodeIndex + 1) {
      const nextEpisode = episodes[currentEpisodeIndex + 1];
      router.push(`/episode/watch/${nextEpisode.id}`);
    }
  };

  return (
    <Page title={episode.title}>
      <main className="flex flex-col gap-2 2xl:flex-row 2xl:gap-4">
        <section className="w-full">
          <VideoPlayer
            episodeTitle={episode.title}
            videoUrl={`/api/episode/video-stream/${episode.id}`}
            coverImageBase64={`/api/episode/cover-image/${episode.id}`}
            subtitles={episode.subtitles}
            previews={previews}
            onNextEpisode={onNextEpisodeHandler}
          />
        </section>
        <aside className="flex flex-col gap-2 2xl:w-[40%]">
          <h1 className="text-lg font-bold uppercase text-rose-700">
            Episodes
          </h1>
          <div className="flex flex-col gap-2">
            {episodes
              .sort((a, b) => sortByStringNumbersSum(a.title, b.title))
              .map((episodeItem) => (
                <EpisodeCard
                  className={`w-full`}
                  key={episodeItem.id}
                  episodeId={episodeItem.id!}
                  active={episode.id === episodeItem.id}
                >
                  {episodeItem.title}
                </EpisodeCard>
              ))}
          </div>
        </aside>
      </main>
    </Page>
  );
};

export default Watch;
