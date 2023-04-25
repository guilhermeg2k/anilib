import AnimeCard from '@components/anime-card';
import AutoAnimate from '@components/auto-animate';
import Page from '@components/page';
import Spinner from '@components/spinner';
import { AnimeTitle } from '@prisma/client';
import {
  calculateAnimeTitleSimilarity,
  getDisplayTitle,
} from 'common/utils/anime';
import { trpc } from 'common/utils/trpc';
import { useMemo, useState } from 'react';

const sortAndFilterAnimes = <T extends { id: string; titles: AnimeTitle[] }>(
  animes: T[],
  searchText: string
) => {
  const minSimilarityRate = 0.2;
  const shouldFilterBySearchText = searchText.length > 3;

  if (shouldFilterBySearchText) {
    const similaritiesRate = new Map<string, number>();
    animes.forEach((anime) => {
      const titleSimilarity = calculateAnimeTitleSimilarity(
        anime.titles,
        searchText
      );
      similaritiesRate.set(anime.id, titleSimilarity);
    });

    const animesSortedBySimilarity = animes
      .sort((animeA, animeB) => {
        const similarityA = similaritiesRate.get(animeA.id) ?? 0;
        const similarityB = similaritiesRate.get(animeB.id) ?? 0;
        return similarityA > similarityB ? -1 : 1;
      })
      .filter(
        (anime) => (similaritiesRate.get(anime.id) ?? 0) > minSimilarityRate
      );

    return animesSortedBySimilarity;
  }

  const animesSortedAlphabeticallyByTitle = animes.sort((animeA, animeB) =>
    animeA.titles[0].name < animeB.titles[0].name ? -1 : 1
  );

  return animesSortedAlphabeticallyByTitle;
};

const Home = () => {
  const [searchText, setSearchText] = useState('');

  const {
    data: animes,
    isLoading: isLoadingAnimes,
    refetch: refetchAnimes,
  } = trpc.anime.listWithAllRelations.useQuery();

  trpc.ws.library.onUpdate.useSubscription(undefined, {
    onData: () => {
      refetchAnimes();
    },
  });

  const isLibraryEmpty = animes?.length === 0;

  const animesSortedAndFiltered = useMemo(
    () => (animes ? sortAndFilterAnimes(animes, searchText) : []),
    [animes, searchText]
  );

  return (
    <Page title="Anilib" className="lg:py-6 flex flex-col">
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
                imageBase64={anime.coverImage ?? ''}
                name={getDisplayTitle(anime.titles)}
              />
            ))
          )}
        </AutoAnimate>
      </main>
    </Page>
  );
};

export default Home;
