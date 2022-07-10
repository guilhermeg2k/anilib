interface ReleaseDate {
  year: number;
  month: number;
  day: number;
}

export interface Anime {
  id?: string;
  anilistId: number;
  number: string;
  title: string;
  coverUrl: string;
  description: string;
  folderPath: string;
  episodes: number;
  releaseDate: Date;
  status: string;
  genres: Array<string>;
  format: string;
}

export interface Episode {
  id?: string;
  filePath: string;
  animeId: string;
  coverUrl?: string;
}

export interface Subtitle {
  id?: string;
  filePath: string;
  language: string;
  label: string;
  episodeId?: string;
}

export interface DatabaseData {
  directories: Array<string>;
  animes: Array<Anime>;
  episodes: Array<Episode>;
  subtitles: Array<Subtitle>;
}
