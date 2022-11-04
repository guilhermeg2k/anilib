import { Anime } from 'backend/database/types';
import { AnilistAnime } from 'backend/service/types';
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

export const getAnimesWithTitleSimilarityToTextAppended = (
  animes: Array<AnilistAnime | Anime>,
  text: string
) => {
  const animesWithSimilarity = animes.map((anime) => {
    return {
      ...anime,
      titleSimilarity: calculateSimilarity(anime, text),
    };
  });

  return animesWithSimilarity;
};

export const getAnimeWithMostSimilarTitleToText = (
  animes: Array<AnilistAnime | Anime>,
  text: string
) => {
  const animesSortedByTitleSimilarity =
    getAnimesWithTitleSimilarityToTextAppended(animes, text).sort(
      (animeA, animeB) =>
        animeA.titleSimilarity > animeB.titleSimilarity ? -1 : 1
    );

  if (animesSortedByTitleSimilarity.length > 0) {
    return animesSortedByTitleSimilarity[0];
  }
  return null;
};
