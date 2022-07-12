interface ReleaseDate {
  year: number;
  month: number;
  day: number;
}

export interface Anime {
  id?: string;
  anilistId: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  coverUrl: string;
  description: string;
  episodes: number;
  releaseDate: Date;
  status: string;
  genres: Array<string>;
  format: string;
  folderPath: string;
}

export interface Episode {
  id?: string;
  filePath: string;
  originalFilePath?: string;
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
