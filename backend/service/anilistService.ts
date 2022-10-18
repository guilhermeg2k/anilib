import client from '@backend/library/graphql';
import { gql } from 'graphql-request';
import { Page } from './types';

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
        media(search: "${searchText}", type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          bannerImage
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
    }`;
    const queryResult = await client.request(query);
    if (queryResult.Page && queryResult.Page.media) {
      const queryPage = queryResult.Page as Page;
      return queryPage.media;
    }
    return [];
  }
}

export default AnilistService;
