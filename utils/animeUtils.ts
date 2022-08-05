import { Anime } from '@backend/database/types';
import { AnilistAnime } from '@backend/service/types';
import { stringSimilarity } from 'string-similarity-js';

const calculateSimilarity = (
  anime: AnilistAnime | Anime,
  similarTitle: string
) => {
  let romajiSimilarity = 0;
  let englishSimilarity = 0;
  let nativeSimilarity = 0;

  if (anime.title.romaji) {
    romajiSimilarity = stringSimilarity(similarTitle, anime.title.romaji);
  }

  if (anime.title.english) {
    englishSimilarity = stringSimilarity(similarTitle, anime.title.english);
  }

  if (anime.title.native) {
    nativeSimilarity = stringSimilarity(similarTitle, anime.title.native);
  }

  const titleSimilarityRate = Math.max(
    romajiSimilarity,
    englishSimilarity,
    nativeSimilarity
  );

  return titleSimilarityRate;
};

export const getAnimesWithTitleSimilarityRateAppended = (
  animes: Array<AnilistAnime | Anime>,
  similarTitle: string
) => {
  const animesWithSimilarity = animes.map((anime) => {
    return {
      ...anime,
      titleSimilarityRate: calculateSimilarity(anime, similarTitle),
    };
  });

  return animesWithSimilarity;
};

export const getAnimeWithMostSimilarTitle = (
  animes: Array<AnilistAnime | Anime>,
  title: string
) => {
  const animesSortedByTitleSimilarity =
    getAnimesWithTitleSimilarityRateAppended(animes, title).sort(
      (animeA, animeB) =>
        animeA.titleSimilarityRate > animeB.titleSimilarityRate ? -1 : 1
    );

  if (animesSortedByTitleSimilarity.length > 0) {
    return animesSortedByTitleSimilarity[0];
  }
  return null;
};
