import { AnilistAnimeTitle } from '@common/types/anilist';
import { stringSimilarity } from 'string-similarity-js';

//TODO: Refactor this util
export const getAnimeWithMostSimilarTitleToText = <
  T extends { title: AnilistAnimeTitle }
>(
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

const appendTitleSimilarityToTextToAnimes = <
  T extends { title: AnilistAnimeTitle }
>(
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

const calculateTitleSimilarity = (
  title: AnilistAnimeTitle,
  similarTitle: string
) => {
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
