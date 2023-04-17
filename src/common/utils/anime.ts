import { Title } from '@common/types/database';
import { AnimeTitle } from '@prisma/client';
import { stringSimilarity } from 'string-similarity-js';

export const formatTitle = (title: Title) =>
  title.romaji ?? title.english ?? title.native ?? 'Unknown Title';

export const getAnimeWithMostSimilarTitleToText = <T extends { title: Title }>(
  animes: Array<T>,
  text: string
) => {
  const animesSortedByTitleSimilarity = appendTitleSimilarityToTextToAnimes(
    animes,
    text
  ).sort((animeA, animeB) =>
    animeA.titleSimilarity > animeB.titleSimilarity ? -1 : 1
  );

  if (animesSortedByTitleSimilarity.length > 0) {
    return animesSortedByTitleSimilarity[0];
  }

  return null;
};

export const appendTitleSimilarityToTextToAnimes = <T extends { title: Title }>(
  animes: Array<T>,
  text: string
) => {
  const animesWithSimilarity: Array<T & { titleSimilarity: number }> =
    animes.map((anime) => {
      return {
        ...anime,
        titleSimilarity: calculateTitleSimilarity(anime.title, text),
      };
    });

  return animesWithSimilarity;
};

const calculateTitleSimilarity = (title: Title, similarTitle: string) => {
  let romajiSimilarity = 0;
  let englishSimilarity = 0;
  let nativeSimilarity = 0;

  if (title.romaji) {
    romajiSimilarity = stringSimilarity(similarTitle, title.romaji);
  }

  if (title.english) {
    englishSimilarity = stringSimilarity(similarTitle, title.english);
  }

  if (title.native) {
    nativeSimilarity = stringSimilarity(similarTitle, title.native);
  }

  const titleSimilarityRate = Math.max(
    romajiSimilarity,
    englishSimilarity,
    nativeSimilarity
  );

  return titleSimilarityRate;
};

export const calculateAnimeTitleSimilarity = (
  titles: AnimeTitle[],
  similarTitle: string
) => {
  const titleSimilarities = [];
  for (const title of titles) {
    const titleSimilarityRate = stringSimilarity(similarTitle, title.name);
    titleSimilarities.push(titleSimilarityRate);
  }
  return Math.max(...titleSimilarities);
};

export const getDisplayTitle = (titles: AnimeTitle[]) => {
  const romajiTitle = titles.find((title) => title.type === 'romaji');
  if (romajiTitle) {
    return romajiTitle.name;
  }
  const englishTitle = titles.find((title) => title.type === 'english');

  if (englishTitle) {
    return englishTitle.name;
  }
  const nativeTitle = titles.find((title) => title.type === 'native');

  if (nativeTitle) {
    return nativeTitle.name;
  }

  return 'Unknown Title';
};
