export interface Anime {
  id?: string;
  title: string;
  coverUrl: string;
  description: string;
  folderPath: string;
  numberOfEpisodes: number;
  status: string;
  categories: Array<string>;
}

export interface Episode {
  id?: string;
  fileName: string;
  path: string;
  animeId: string;
  coverUrl: string;
}

export interface Subtitle {
  id?: string;
  fileName: string;
  lang: string;
  episodeId: string;
}

export interface DatabaseInterface {
  animes: Array<Anime>;
  episodes: Array<Episode>;
  subtitles: Array<Subtitle>;
}
