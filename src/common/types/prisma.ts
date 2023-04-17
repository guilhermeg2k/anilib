import {
  Anime,
  AnimeFormat,
  AnimeStatus,
  AnimeTitle,
  Episode,
  Genre,
  Season,
  Studio,
} from '@prisma/client';

export type AnimeWithAllRelations = Anime & {
  season: Season;
  genres: Genre[];
  studios: Studio[];
  titles: AnimeTitle[];
  episodes: Episode[];
  format: AnimeFormat;
  status: AnimeStatus;
};
