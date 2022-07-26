import { Anime } from '@backend/database/types';
import AnimeCard from '@components/AnimeCard';
import Navbar from '@components/Navbar';
import Page from '@components/Page';
import AnimeService from '@services/animeService';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
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
  const [filteredAndSortedAnimeList, setFilteredAndSortedAnimeList] =
    useState(animesList);
  const searchFieldRef = useRef<HTMLInputElement>(null);
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

  const onSearchHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchText = event.target.value;

    if (searchText.length === 0) {
      setFilteredAndSortedAnimeList(animesList);
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

    setFilteredAndSortedAnimeList(
      animesFilteredAndSortedBySimilarityWithSearch
    );
  };

  const animes = filteredAndSortedAnimeList.map((anime) => (
    <AnimeCard
      key={anime.id}
      id={anime.id!}
      coverUrl={anime.coverUrl}
      name={anime.title.romaji}
    />
  ));

  useEffect(() => {
    if (searchFieldRef.current) {
      searchFieldRef.current.focus();
    }
  }, []);

  return (
    <>
      <Head>
        <title>Anilib</title>
      </Head>
      <header>
        <Navbar />
        <div className="w-full bg-neutral-900 py-10 px-4 md:px-40 lg:px-60 2xl:px-96">
          <input
            type="text"
            ref={searchFieldRef}
            name="search_field"
            id="search_field"
            onChange={onSearchHandler}
            placeholder="Jujutsu Kaisen"
            className="w-full p-2 outline-none focus:ring-0 bg-neutral-900 border-0 border-b-2  text-base lg:text-xl focus:border-b-2 focus:border-rose-700 "
            autoComplete="off"
            autoFocus
          />
        </div>
      </header>

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
