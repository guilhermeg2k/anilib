import { Anime } from '@backend/database/types';
import { gql } from 'graphql-request';
import client from './graphql';

interface AnilistAnime {
  id: number;
  title: {
    romaji: string;
  };
  coverImage: {
    extraLarge: string;
  };
  description: string;
  episodes: number;
  startDate: {
    year: number;
    month: number;
    day: number;
  };
  status: string;
  genres: Array<string>;
  format: string;
}

export const getAnimeBySearch = async (search: string) => {
  const queryResult = await client.request(gql`
      {
        Media(search: "${search}", type: ANIME) {
          id
          title {
            romaji
          }
          coverImage {
            extraLarge
          }
          description
          episodes
          startDate {
            year
            month
            day
          }
          status
          genres
          format
        }
      }
    `);
  const anime = queryResult.Media as AnilistAnime;
  const releaseDate = new Date();
  releaseDate.setFullYear(anime.startDate.year);
  releaseDate.setMonth(anime.startDate.month);
  releaseDate.setDate(anime.startDate.day);

  const animeParsed = <Anime>{
    title: anime.title.romaji,
    coverUrl: anime.coverImage.extraLarge,
    description: anime.description,
    episodes: anime.episodes,
    releaseDate: releaseDate,
    status: anime.status,
    genres: anime.genres,
    format: anime.format,
  };

  return animeParsed;
};

const anilistService = {
  getAnimeBySearch,
};

export default anilistService;
