export type Title = {
  romaji: string;
  english: string;
  native: string;
};
export interface Anime {
  id?: string;
  anilistId: number;
  title: Title;
  coverUrl: string;
  description: string;
  episodes?: number;
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
  originalFilePath: string;
  coverImagePath: string;
  wasConverted: boolean;
  animeId: string;
}

export interface Subtitle {
  id?: string;
  filePath: string;
  language: string;
  label: string;
  episodeId?: string;
  wasCommentsRemoved: boolean;
}
export interface DatabaseData {
  directories: Map<string, string>;
  animes: Map<string, Anime>;
  episodes: Map<string, Episode>;
  subtitles: Map<string, Subtitle>;
  settings: Map<string, Boolean>;
}

export type Setting =
  | 'isToDeleteConvertedData'
  | 'isToDeleteInvalidData'
  | 'shouldUseNVENC';
