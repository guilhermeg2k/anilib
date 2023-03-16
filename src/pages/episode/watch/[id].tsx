import EpisodeCard from '@components/EpisodeCard';
import Navbar from '@components/Navbar';
import Page from '@components/Page';
import { Episode, Subtitle } from 'backend/database/types';
import EpisodeService from 'services/episodeService';
import SubtitleService from 'services/subtitleService';
import EpisodePreviewService from '@services/episodePreviewService';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { VideoPlayer } from '@components/VideoPlayer';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  const [episode, subtitles, coverImageBase64, previews] = await Promise.all([
    EpisodeService.getById(id),
    SubtitleService.listByEpisodeId(id),
    EpisodeService.getCoverImageBase64ById(id),
    EpisodePreviewService.listByEpisodeId(id),
  ]);

  const episodes = await EpisodeService.listByAnimeId(episode.animeId);

  const watchProps: WatchProps = {
    episode,
    episodes,
    subtitles,
    coverImageBase64,
    previews,
  };

  return { props: watchProps };
};

interface WatchProps {
  coverImageBase64: string;
  episode: Episode;
  episodes: Array<Episode>;
  subtitles: Array<Subtitle>;
  previews: Array<string>;
}

const Watch: NextPage<WatchProps> = ({
  coverImageBase64,
  episode,
  episodes,
  subtitles,
  previews,
}) => {
  const router = useRouter();

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
              videoUrl={`/api/episode/video-stream/${episode.id}`}
              coverImageBase64={coverImageBase64}
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
