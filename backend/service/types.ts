export interface PageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
}

export interface AnilistAnime {
  id: number;
  title: {
    romaji: string;
    english: string;
    native: string;
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

export interface Page {
  pageInfo: PageInfo;
  media: Array<AnilistAnime>;
}
