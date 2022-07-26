import { Anime } from '@backend/database/types';
import AnimeCard from '@components/AnimeCard';
import Navbar from '@components/Navbar';
import Page from '@components/Page';
import AnimeService from '@services/animeService';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { stringSimilarity } from 'string-similarity-js';

const animeService = new AnimeService();

export const getServerSideProps: GetServerSideProps = async () => {
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
  const [filteredAnimeList, setFilteredAnimeList] = useState(animesList);

  const appendSimilarityRate = (animes: Array<Anime>, similarText: string) => {
    const animesWithSimilarity = animes.map((anime) => {
      const romajiSimilarity = stringSimilarity(
        similarText,
        anime.title.romaji
      );
      const englishSimilarity = stringSimilarity(
        similarText,
        anime.title.english
      );
      const nativeSimilarity = stringSimilarity(
        similarText,
        anime.title.native
      );

      const similarityWithSearch = Math.max(
        romajiSimilarity,
        englishSimilarity,
        nativeSimilarity
      );

      return { ...anime, similarityWithSearch };
    });

    return animesWithSimilarity;
  };

  const onSearchHandler = (searchText: string) => {
    if (searchText.length === 0) {
      setFilteredAnimeList(animesList);
      return;
    }

    const animesFilteredAndSortedBySimilarityWithSearch = appendSimilarityRate(
      animesList,
      searchText
    )
      .filter((anime) => anime.similarityWithSearch > 0.2)
      .sort((animeA, animeB) =>
        animeA.similarityWithSearch > animeB.similarityWithSearch ? -1 : 1
      );

    setFilteredAnimeList(animesFilteredAndSortedBySimilarityWithSearch);
  };

  const animes = filteredAnimeList.map((anime) => (
    <AnimeCard
      key={anime.id}
      id={anime.id!}
      coverUrl={anime.coverUrl}
      name={anime.title.romaji}
    />
  ));

  return (
    <>
      <Head>
        <title>Anilib</title>
      </Head>
      <Navbar onSearchChange={onSearchHandler} />
      <Page>
        <div className="flex flex-col items-center md:items-start">
          <div className="w-full grid gap-10 justify-center grid-cols-fill-267 md:grid-cols-fill-150 lg:grid-cols-fill-200 2xl:grid-cols-fill-260">
            {animes}
          </div>
        </div>
      </Page>
    </>
  );
};

export default Home;
