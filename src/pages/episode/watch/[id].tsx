import { sortByStringNumbersSum } from '@common/utils/string';
import { toastError } from '@common/utils/toastify';
import EpisodeCard from '@components/episode-card';
import Page from '@components/page';
import Spinner from '@components/spinner';
import { VideoPlayer } from '@components/video-player/video-player';
import { trpc } from 'common/utils/trpc';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id ? String(params?.id) : '';

  return {
    props: {
      id,
    },
  };
};

const Watch = ({ id }: { id: string }) => {
  const router = useRouter();

  const {
    data: episode,
    isLoading: isLoadingEpisode,
    isError: hasEpisodeLoadingFailed,
  } = trpc.episode.getById.useQuery({ id });

  const {
    data: subtitles,
    isLoading: isLoadingSubtitles,
    isError: loadSubtitleError,
  } = trpc.subtitle.listByEpisodeId.useQuery({
    episodeId: id,
  });

  const {
    data: previews,
    isLoading: isLoadingPreviews,
    isError: hasPreviewsLoadingFailed,
  } = trpc.episodePreview.listByEpisodeId.useQuery({
    episodeId: id,
  });

  const {
    data: episodes,
    isLoading: isEpisodesLoading,
    isError: hasEpisodesLoadingFailed,
  } = trpc.episode.listByAnimeId.useQuery(
    { animeId: episode?.animeId ?? '' },
    {
      enabled: !!episode?.animeId,
    }
  );

  if (
    isLoadingEpisode ||
    isLoadingSubtitles ||
    isLoadingPreviews ||
    isEpisodesLoading
  ) {
    return (
      <Page>
        <main className="h-full w-full flex items-center justify-center">
          <Spinner />
        </main>
      </Page>
    );
  }

  if (
    hasEpisodeLoadingFailed ||
    loadSubtitleError ||
    hasEpisodesLoadingFailed ||
    hasPreviewsLoadingFailed
  ) {
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
            videoUrl={`/api/episode-video-stream/${episode.id}`}
            coverImageBase64={episode.coverImage || ''}
            subtitles={subtitles}
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
