import EpisodeCard from '@components/episode-card';
import Navbar from '@components/navbar';
import Page from '@components/page';
import { VideoPlayer } from '@components/video-player/video-player';
import { trpc } from '@utils/trpc';
import Head from 'next/head';
import { useRouter } from 'next/router';

const Watch = () => {
  const router = useRouter();
  const id = String(router.query.id);
  const {
    data: episode,
    isLoading: isLoadingEpisode,
    isError: hasEpisodeLoadingFailed,
  } = trpc.episode.getById.useQuery({ id });

  const {
    data: subtitles,
    isLoading: isLoadingSubtitle,
    isError: hasSubtitleLoadingFailed,
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
    data: coverImageBase64,
    isLoading: isLoadingCoverImage64,
    isError: hasCoverImageLoadingFailed,
  } = trpc.episode.getCoverImageBase64ById.useQuery({ id });

  const {
    data: episodes,
    isLoading: isEpisodesLoading,
    isError: hasEpisodesLoadingFailed,
  } = trpc.episode.listByAnimeId.useQuery(
    { animeId: String(episode?.animeId) },
    {
      enabled: Boolean(episode?.animeId),
    }
  );

  if (
    isLoadingEpisode ||
    isLoadingSubtitle ||
    isLoadingCoverImage64 ||
    isLoadingPreviews ||
    isEpisodesLoading
  ) {
    return <div>Loading...</div>;
  }

  if (
    hasEpisodeLoadingFailed ||
    hasSubtitleLoadingFailed ||
    hasCoverImageLoadingFailed ||
    hasEpisodesLoadingFailed ||
    hasPreviewsLoadingFailed
  ) {
    return <div>Failed to load episode</div>;
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
    <>
      <Head>
        <title>{episode.title}</title>
      </Head>
      <Navbar />
      <Page>
        <main className="flex flex-col gap-2 2xl:flex-row 2xl:gap-4">
          <section className="w-full">
            <VideoPlayer
              episodeTitle={episode.title}
              videoUrl={`/api/episode-video-stream/${episode.id}`}
              coverImageBase64={coverImageBase64 || ''}
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
              {episodes.map((episodeItem) => (
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
    </>
  );
};

export default Watch;
