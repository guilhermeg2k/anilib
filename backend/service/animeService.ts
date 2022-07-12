import { Anime } from '@backend/database/types';
import client from '@backend/library/graphql';
import AnimeRepository from '@backend/repository/animeRepository';
import fileSystem from 'fs';
import { gql } from 'graphql-request';
import path from 'path';
import { AnilistAnime } from './types';

const animeRepository = new AnimeRepository();
const fs = fileSystem.promises;

class AnimeService {
  list() {
    const animes = animeRepository.list();
    return animes;
  }

  getById(id: string) {
    const anime = animeRepository.listById(id);
    return anime;
  }

  getByPath(path: string) {
    const anime = animeRepository.listByPath(path);
    return anime;
  }

  async createFromDirectories(directories: Array<string>) {
    const createdAnimesPromises = directories.map(async (directory) =>
      this.createFromDirectory(directory)
    );
    const createdAnimes = await Promise.all(createdAnimesPromises);
    return createdAnimes.flat(Infinity);
  }

  private async createFromDirectory(directory: string) {
    const createdAnimes = Array<Anime>();
    const directoryFolders = await fs.readdir(directory);
    for (const folder of directoryFolders) {
      const folderPath = path.join(directory, folder);
      const localAnime = animeRepository.listByPath(folderPath);
      if (!localAnime) {
        const createdAnime = await this.createFromDirectoryBySearchOnAnilist(
          folderPath,
          folder
        );
        createdAnimes.push(createdAnime);
      }
    }
    return createdAnimes;
  }

  private async createFromDirectoryBySearchOnAnilist(
    directory: string,
    searchText: string
  ) {
    const queryResult = await client.request(gql`
      {
        Media(search: "${searchText}", type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
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
    `);
    const anime = queryResult.Media as AnilistAnime;
    const releaseDate = new Date();
    releaseDate.setFullYear(anime.startDate.year);
    releaseDate.setMonth(anime.startDate.month);
    releaseDate.setDate(anime.startDate.day);

    const animeParsed = {
      anilistId: anime.id,
      title: anime.title,
      coverUrl: anime.coverImage.extraLarge,
      description: anime.description,
      episodes: anime.episodes,
      releaseDate: releaseDate,
      status: anime.status,
      genres: anime.genres,
      format: anime.format,
      folderPath: directory,
    };

    const createdAnime = animeRepository.create(animeParsed);

    return createdAnime;
  }

  private async getEpisodeFilesPaths(folder: string) {
    const episodeFileExtensions = ['.mkv', '.mp4'];
    const folderDir = await fs.readdir(folder);

    const episodeFilesPromises = folderDir.map(async (file: string) => {
      const filePath = path.join(folder, file);
      const fileStats = await fs.stat(filePath);
      const isFile = fileStats.isFile();
      const isDir = fileStats.isDirectory();
      if (isFile) {
        const fileExt = path.extname(filePath);
        if (episodeFileExtensions.includes(fileExt)) {
          return filePath;
        }
      } else if (isDir) {
        return this.getEpisodeFilesPaths(filePath);
      }
      return null;
    });

    const episodeFiles = (await Promise.all(episodeFilesPromises)) as Array<
      string | Array<string>
    >;
    const flattedEpisodeFiles = episodeFiles.flat(Infinity) as Array<string>;
    const notNullEpisodeFiles = flattedEpisodeFiles.filter((episodeFile) =>
      Boolean(episodeFile)
    );
    return notNullEpisodeFiles;
  }
}

export default AnimeService;
