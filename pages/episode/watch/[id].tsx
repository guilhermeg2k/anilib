import { Episode, Subtitle } from '@backend/database/types';
import EpisodeCard from '@components/core/EpisodeCard';
import Navbar from '@components/core/Navbar';
import Page from '@components/core/Page';
import VideoPlayer from '@components/core/VideoPlayer';
import EpisodeService from '@services/episodeService';
import SubtitleService from '@services/subtitleService';

import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';

const episodeService = new EpisodeService();
const subtitleService = new SubtitleService();

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  const episode = await episodeService.getById(id);
  const episodesList = await episodeService.listByAnimeId(episode.animeId);
  const subtitlesList = await subtitleService.listByEpisodeId(id);
  const coverImageBase64 = await episodeService.getCoverImageBase64ById(id);
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
  const episodes = episodesList.map((episode) => (
    <EpisodeCard className="w-full" key={episode.id} episodeId={episode.id!}>
      {episode.title}
    </EpisodeCard>
  ));

  return (
    <Page>
      <Head>
        <title>{episode.title}</title>
      </Head>
      <Navbar />
      <main className="flex gap-2 2xl:gap-4 flex-col 2xl:flex-row">
        <section className="w-full">
          <VideoPlayer
            videoUrl={`/api/episode/video-stream/${episode.id}`}
            subtitlesList={subtitlesList}
            coverImageBase64={coverImageBase64}
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
  );
};

export default Watch;
