import { AnimeTitle } from '@prisma/client';
import { stringSimilarity } from 'string-similarity-js';

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
