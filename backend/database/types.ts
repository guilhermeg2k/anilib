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
  title: string;
  filePath: string;
  originalFilePath?: string;
  animeId: string;
  coverImagePath?: string;
}

export interface Subtitle {
  id?: string;
  filePath: string;
  language: string;
  label: string;
  episodeId?: string;
}

export interface Settings {
  isToDeleteConvertedData: boolean;
  isToDeleteInvalidData: boolean;
}

export interface DatabaseData {
  directories: Map<string, string>;
  animes: Map<string, Anime>;
  episodes: Map<string, Episode>;
  subtitles: Map<string, Subtitle>;
  settings: Settings;
}
