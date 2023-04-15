import { Anime } from '@common/types/database';
import AnimeCard from '@components/anime-card';
import AutoAnimate from '@components/auto-animate';
import Navbar from '@components/navbar';
import Page from '@components/page';
import Spinner from '@components/spinner';
import {
  appendTitleSimilarityToTextToAnimes,
  formatTitle,
} from 'common/utils/anime';
import { trpc } from 'common/utils/trpc';
import Head from 'next/head';
import { useMemo, useState } from 'react';

const filterAnimesByTextSimilarity = <T extends { titleSimilarity: number }>(
  animes: T[]
) => {
  const titleSimilarityMinRate = 0.2;
  const animesFilteredBySimilarity = animes.filter(
    (anime) => anime.titleSimilarity >= titleSimilarityMinRate
  );
  return animesFilteredBySimilarity;
};

const sortAndFilterAnimes = (animes: Anime[], searchText: string) => {
  const shouldFilterBySearchText = searchText.length > 3;
  if (shouldFilterBySearchText) {
    const animesWithTitleSimilarityToText = appendTitleSimilarityToTextToAnimes(
      animes,
      searchText
    );
    const animesFilteredBySimilarity = filterAnimesByTextSimilarity(
      animesWithTitleSimilarityToText
    );
    const animesSortedBySimilarity = animesFilteredBySimilarity.sort(
      (animeA, animeB) =>
        animeA.titleSimilarity > animeB.titleSimilarity ? -1 : 1
    );
    return animesSortedBySimilarity;
  }

  const animesSortedAlphabeticallyByTitle = animes.sort((animeA, animeB) =>
    formatTitle(animeA.title) < formatTitle(animeB.title) ? -1 : 1
  );

  return animesSortedAlphabeticallyByTitle;
};

const Home = () => {
  const { data: animes, isLoading: isLoadingAnimes } =
    trpc.anime.list.useQuery();
  const [searchText, setSearchText] = useState('');
  const isLibraryEmpty = animes?.length === 0;

  const animesSortedAndFiltered = useMemo(
    () => (animes ? sortAndFilterAnimes(animes, searchText) : []),
    [animes, searchText]
  );

  return (
    <>
      <Head>
        <title>Anilib</title>
      </Head>
      <Navbar />
      <Page className="lg:py-6 flex flex-col">
        <header className="pb-3 lg:pb-6">
          {isLibraryEmpty ? (
            <div className="mt-1 flex w-full flex-col items-center justify-center lg:mt-5">
              <span>Your library its empty</span>
              <span className="text-xs">
                Try to add directories and update your library on settings
              </span>
            </div>
          ) : (
            <div className="h-full ">
              <input
                type="text"
                name="search_field"
                id="search_field"
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search an anime"
                className="w-full rounded-full border-2 border-neutral-800 bg-neutral-800 px-4 py-2  outline-none focus:border-rose-700  focus:ring-0"
                autoComplete="off"
              />
            </div>
          )}
        </header>
        <main className="h-full">
          <AutoAnimate
            as="ul"
            className={
              isLoadingAnimes
                ? 'w-full flex items-center justify-center h-full'
                : 'gap-r grid w-full grid-cols-2 gap-10 gap-y-5 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5'
            }
          >
            {isLoadingAnimes ? (
              <Spinner />
            ) : (
              animesSortedAndFiltered?.map((anime) => (
                <AnimeCard
                  key={anime.id}
                  id={anime.id!}
                  coverUrl={anime.coverUrl}
                  name={formatTitle(anime.title)}
                />
              ))
            )}
          </AutoAnimate>
        </main>
      </Page>
    </>
  );
};

export default Home;
