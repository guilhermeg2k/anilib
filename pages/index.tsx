import { Anime } from '@backend/database/types';
import AnimeCard from '@components/core/AnimeCard';
import Navbar from '@components/core/Navbar';
import Page from '@components/core/Page';
import AnimeService from '@services/animeService';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';

const animeService = new AnimeService();

export const getServerSideProps: GetServerSideProps = async (context) => {
  const animesList = await animeService.list();
  const animesSorted = animesList.sort((a, b) =>
    a.title.romaji < b.title.romaji ? -1 : 1
  );
  return { props: { animesList: animesSorted } };
};

interface HomeProps {
  animesList: Array<Anime>;
}

const Home: NextPage<HomeProps> = ({ animesList }) => {
  const animes = animesList.map((anime) => (
    <AnimeCard
      key={anime.id}
      id={anime.id!}
      coverUrl={anime.coverUrl}
      name={anime.title.romaji}
    />
  ));

  return (
    <Page>
      <Head>
        <title>Anilib</title>
      </Head>
      <Navbar />
      <div className="flex flex-col items-center md:items-start">
        <div className="w-full grid gap-10 justify-center grid-cols-fill-267 md:grid-cols-fill-150 lg:grid-cols-fill-200 2xl:grid-cols-fill-260">
          {animes}
        </div>
      </div>
    </Page>
  );
};

export default Home;
