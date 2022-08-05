import { Episode, Subtitle } from '@backend/database/types';
import EpisodeCard from '@components/EpisodeCard';
import Navbar from '@components/Navbar';
import Page from '@components/Page';
import VideoPlayer from '@components/VideoPlayer';
import EpisodeService from '@services/episodeService';
import SubtitleService from '@services/subtitleService';

import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  const episode = await EpisodeService.getById(id);
  const episodesList = await EpisodeService.listByAnimeId(episode.animeId);

  episodesList.sort((a, b) => (a.title > b.title ? 1 : -1));

  const subtitlesList = await SubtitleService.listByEpisodeId(id);
  const coverImageBase64 = await EpisodeService.getCoverImageBase64ById(id);
  const watchProps: WatchProps = {
    episode,
    episodesList,
    subtitlesList,
    coverImageBase64,
  };
  return { props: watchProps };
};

interface WatchProps {
  episode: Episode;
  episodesList: Array<Episode>;
  subtitlesList: Array<Subtitle>;
  coverImageBase64: string;
}

const Watch: NextPage<WatchProps> = ({
  episode,
  episodesList,
  subtitlesList,
  coverImageBase64,
}) => {
  const router = useRouter();
  const episodes = episodesList.map((episodeItem) => {
    return (
      <EpisodeCard
        className={`w-full`}
        key={episodeItem.id}
        episodeId={episodeItem.id!}
        active={episode.id === episodeItem.id}
      >
        {episodeItem.title}
      </EpisodeCard>
    );
  });

  const onNextEpisodeHandler = () => {
    const currentEpisodeIndex = episodesList.findIndex(
      (episodeItem) => episodeItem.id === episode.id
    );
    if (episodesList.length > currentEpisodeIndex + 1) {
      const nextEpisode = episodesList[currentEpisodeIndex + 1];
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
        <main className="flex gap-2 2xl:gap-4 flex-col 2xl:flex-row">
          <section className="w-full">
            <VideoPlayer
              episodeTitle={episode.title}
              onNextEpisode={onNextEpisodeHandler}
              videoUrl={`/api/episode/video-stream/${episode.id}`}
              coverImageBase64={coverImageBase64}
              subtitlesList={subtitlesList}
            />
          </section>
          <aside className="flex flex-col gap-2 2xl:w-[40%]">
            <h1 className="font-bold uppercase text-lg text-rose-700">
              Episodes
            </h1>
            <div className="flex flex-col gap-2">{episodes}</div>
          </aside>
        </main>
      </Page>
    </>
  );
};

export default Watch;
