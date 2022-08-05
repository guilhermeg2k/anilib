import { Anime } from '@backend/database/types';
import AutoAnimate from '@components/AutoAnimate';
import AnimeCard from '@components/AnimeCard';
import Navbar from '@components/Navbar';
import Page from '@components/Page';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import AnimeService from '@services/animeService';
import animeUtils from '@utils/animeUtils';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';

interface HomeProps {
  animes: Array<Anime>;
}

const Home: NextPage<HomeProps> = ({ animes }) => {
  const [filteredAndSortedAnimeList, setFilteredAndSortedAnimeList] =
    useState(animes);
  const searchFieldRef = useRef<HTMLInputElement>(null);
  const isLibraryEmpty = animes.length === 0;

  const filterAnimesByTitle = (title: string) => {
    const titleSimilarityMinRate = 0.2;
    const animesWithTitleSimilarity = animeUtils.appendTitleSimilarityRate(
      animes,
      title
    );

    const animesFilteredBySimilarity = animesWithTitleSimilarity.filter(
      (anime) => anime.titleSimilarityRate >= titleSimilarityMinRate
    );

    const animesSortedBySimilarity = animesFilteredBySimilarity.sort(
      (animeA, animeB) =>
        animeA.titleSimilarityRate > animeB.titleSimilarityRate ? -1 : 1
    );

    setFilteredAndSortedAnimeList(animesSortedBySimilarity as Array<Anime>);
  };

  const onSearchHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchText = event.target.value;

    if (searchText.length === 0) {
      setFilteredAndSortedAnimeList(animes);
      return;
    }

    if (searchText.length < 3) {
      return;
    }

    filterAnimesByTitle(searchText);
  };

  useEffect(() => {
    if (searchFieldRef.current) {
      searchFieldRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setFilteredAndSortedAnimeList(animes);
  }, [animes]);

  return (
    <>
      <Head>
        <title>Anilib</title>
      </Head>

      <header>
        <Navbar />
        {isLibraryEmpty ? (
          <div className="flex flex-col justify-center w-full items-center mt-1 lg:mt-5">
            <span>Your library its empty</span>
            <span className="text-xs">
              Try to add directories and update your library on settings
            </span>
          </div>
        ) : (
          <div className="w-full bg-neutral-900 mt-1 lg:mt-5 px-4 md:px-40 lg:px-60 2xl:px-96">
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
        )}
      </header>

      <Page>
        <main className="flex flex-col items-center md:items-start">
          <AutoAnimate
            as="ul"
            className="w-full grid gap-10 justify-center grid-cols-fill-260 md:grid-cols-fill-150 lg:grid-cols-fill-200 2xl:grid-cols-fill-260"
          >
            {filteredAndSortedAnimeList.map((anime) => (
              <AnimeCard
                key={anime.id}
                id={anime.id!}
                coverUrl={anime.coverUrl}
                name={anime.title.romaji}
              />
            ))}
          </AutoAnimate>
        </main>
      </Page>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const animeService = new AnimeService();
  const animes = await animeService.list();
  const animesSortedAlphabeticallyByTitle = animes.sort((animeA, animeB) =>
    animeA.title.romaji < animeB.title.romaji ? -1 : 1
  );

  return { props: { animes: animesSortedAlphabeticallyByTitle } };
};

export default Home;
