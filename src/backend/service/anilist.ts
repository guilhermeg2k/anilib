import client from '@common/utils/graphql';
import { gql } from 'graphql-request';
import { AnilistAnime, Page } from '../../common/types/anilist';

const ANIME_QUERY = `id
          title {
            romaji
            english
            native
          }
          bannerImage
          coverImage {
            extraLarge
          }
          siteUrl
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
          meanScore
          averageScore
          season
          seasonYear
          studios {
            nodes {
              id
              name
              siteUrl
            }
          }
          trailer {
            id
            site
            thumbnail
          }`;

class AnilistService {
  static async getAnimesBySearch(searchText: string) {
    const query = gql`
    {
      Page(page: 1, perPage: 5) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        media(search: "${searchText}", type: ANIME) {${ANIME_QUERY}}
      }
    }`;
    const queryResult = await client.request(query);
    if (queryResult.Page && queryResult.Page.media) {
      const queryPage = queryResult.Page as Page<AnilistAnime>;
      return queryPage.media;
    }
    return [];
  }

  static async getAnimeById(id: number) {
    const query = gql`{
      Media(id: ${id}) {${ANIME_QUERY}}
    }`;

    const queryResult = await client.request(query);
    return queryResult.Media as AnilistAnime;
  }
}

export default AnilistService;
