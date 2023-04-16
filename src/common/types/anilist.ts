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
  siteUrl: string;
  description: string;
  episodes: number;
  startDate: {
    year: number;
    month: number;
    day: number;
  };
  status: string;
  genres: string[];
  format: string;
  meanScore: number;
  averageScore: number;
  season: string;
  seasonYear: number;
  studios: {
    nodes: {
      id: number;
      name: string;
      siteUrl: string;
    }[];
  };
  trailer: {
    id: string;
    site: string;
    thumbnail: string;
  };
};

export type PageInfo = {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
};

export type Page<T> = {
  pageInfo: PageInfo;
  media: Array<T>;
};
