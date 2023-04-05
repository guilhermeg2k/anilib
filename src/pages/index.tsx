import AnimeCard from '@components/AnimeCard';
import AutoAnimate from '@components/AutoAnimate';
import Navbar from '@components/Navbar';
import Page from '@components/Page';
import {
  getAnimesWithTitleSimilarityToTextAppended,
  getAnimeTitle,
} from '@utils/animeUtils';
import { trpc } from '@utils/trpc';
import { Anime } from 'backend/database/types';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import AnimeService from 'services/animeService';

type AnimeWithSimilarity = Anime & { titleSimilarity: number };

interface HomeProps {
  animes: Array<Anime>;
}

const Home: NextPage<HomeProps> = ({ animes }) => {
  const hello = trpc.hello.useQuery({ text: 'world' });
  console.log('🚀 ~ file: index.tsx:24 ~ hello:', hello);

  const [filteredAndSortedAnimes, setFilteredAndSortedAnimes] =
    useState(animes);
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
      setFilteredAndSortedAnimes(animes);
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

    setFilteredAndSortedAnimes(animesSorted as Array<Anime>);
  };

  useEffect(() => {
    setFilteredAndSortedAnimes(animes);
  }, [animes]);

  return (
    <>
      <Head>
        <title>Anilib</title>
      </Head>
      <Navbar />
      <Page className="lg:py-6">
        <header className="pb-3 lg:pb-6">
          {isLibraryEmpty ? (
            <div className="mt-1 flex w-full flex-col items-center justify-center lg:mt-5">
              <span>Your library its empty</span>
              <span className="text-xs">
                Try to add directories and update your library on settings
              </span>
            </div>
          ) : (
            <div className="">
              <input
                type="text"
                name="search_field"
                id="search_field"
                onChange={onSearchHandler}
                placeholder="Search an anime"
                className="w-full rounded-sm border-2 border-neutral-800 bg-neutral-800 p-2  outline-none focus:border-rose-700  focus:ring-0"
                autoComplete="off"
              />
            </div>
          )}
        </header>
        <main>
          <AutoAnimate
            as="ul"
            className="gap-r grid w-full grid-cols-2 gap-10 gap-y-5 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5"
          >
            {filteredAndSortedAnimes.map((anime) => (
              <AnimeCard
                key={anime.id}
                id={anime.id!}
                coverUrl={anime.coverUrl}
                name={getAnimeTitle(anime)}
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
    getAnimeTitle(animeA) < getAnimeTitle(animeB) ? -1 : 1
  );

  return { props: { animes: animesSortedAlphabeticallyByTitle } };
};

export default Home;
