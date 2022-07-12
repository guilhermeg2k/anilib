import { Anime } from '@backend/database/types';
import AnimeCard from '@components/core/AnimeCard';
import Navbar from '@components/core/Navbar';
import Page from '@components/core/Page';
import AnimeService from '@services/animeService';
import type { GetServerSideProps, NextPage } from 'next';

const animeService = new AnimeService();

export const getServerSideProps: GetServerSideProps = async (context) => {
  const animesList = await animeService.list();
  return { props: { animesList } };
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
      <Navbar />
      <div className="flex flex-col items-center md:items-start">
        <h1 className="uppercase text-2xl font-semibold mb-5">Library</h1>
        <div className="w-full grid gap-10 justify-center grid-cols-fill-267">
          {animes}
        </div>
      </div>
    </Page>
  );
};

export default Home;
