import { Anime } from '@backend/database/types';
import AnimeCard from '@components/AnimeCard';
import AutoAnimate from '@components/AutoAnimate';
import Navbar from '@components/Navbar';
import Page from '@components/Page';
import AnimeService from '@services/animeService';
import { getAnimesWithTitleSimilarityToTextAppended } from '@utils/animeUtils';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';

type AnimeWithSimilarity = Anime & { titleSimilarity: number };

interface HomeProps {
  animes: Array<Anime>;
}

const Home: NextPage<HomeProps> = ({ animes }) => {
  const [filteredAndSortedAnimeList, setFilteredAndSortedAnimeList] =
    useState(animes);
  const searchFieldRef = useRef<HTMLInputElement>(null);
  const isLibraryEmpty = animes.length === 0;

  const getAnimesFilteredByTitleSimilarity = (
    animes: Array<AnimeWithSimilarity>
  ) => {
    const titleSimilarityMinRate = 0.2;
    const animesFilteredBySimilarity = animes.filter(
      (anime) => anime.titleSimilarity >= titleSimilarityMinRate
    );

    return animesFilteredBySimilarity;
  };

  const getAnimesSortedByByTitleSimilarity = (
    animes: Array<AnimeWithSimilarity>
  ) => {
    const animesSortedBySimilarity = animes.sort((animeA, animeB) =>
      animeA.titleSimilarity > animeB.titleSimilarity ? -1 : 1
    );
    return animesSortedBySimilarity;
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

    const animesWithTitleSimilarityToText =
      getAnimesWithTitleSimilarityToTextAppended(animes, searchText);

    const animesFilteredBySimilarity = getAnimesFilteredByTitleSimilarity(
      animesWithTitleSimilarityToText as Array<AnimeWithSimilarity>
    );

    const animesSorted = getAnimesSortedByByTitleSimilarity(
      animesFilteredBySimilarity
    );

    setFilteredAndSortedAnimeList(animesSorted as Array<Anime>);
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
  const animes = await AnimeService.list();
  const animesSortedAlphabeticallyByTitle = animes.sort((animeA, animeB) =>
    animeA.title.romaji < animeB.title.romaji ? -1 : 1
  );

  return { props: { animes: animesSortedAlphabeticallyByTitle } };
};

export default Home;
