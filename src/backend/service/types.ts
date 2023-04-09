export type PageInfo = {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
};

export type AnilistAnime = {
  id: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  bannerImage: string;
  coverImage: {
    extraLarge: string;
  };
  description: string;
  episodes?: number;
  startDate: {
    year: number;
    month: number;
    day: number;
  };
  status: string;
  genres: Array<string>;
  format: string;
};

export type Page = {
  pageInfo: PageInfo;
  media: Array<AnilistAnime>;
};
