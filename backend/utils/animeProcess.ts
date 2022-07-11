import Database from '@backend/database';
import { Anime, Episode, Subtitle } from '@backend/database/types';
import fileSystem from 'fs';
import path from 'path';
import anilistService from 'service/anilist';
import {
  convertMkvToMp4,
  extractVideoImageCover,
  extractVideoSubtitles,
} from './ffmpeg';

const fs = fileSystem.promises;

const getEpisodeFilesPaths = async (folder: string) => {
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
      return getEpisodeFilesPaths(filePath);
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
};

const processAnimeEpisodes = (
  anime: Anime,
  episodeFilesPaths: Array<string>
) => {
  episodeFilesPaths.forEach((episodeFilePath) => {
    const episode = Database.getEpisodeByPath(episodeFilePath);
    if (!episode) {
      processEpisode(anime, episodeFilePath);
    }
  });
};

const processEpisode = async (anime: Anime, episodeFilePath: string) => {
  const episodeFileExt = path.extname(episodeFilePath);
  const episodeCover = await extractVideoImageCover(episodeFilePath);
  const episode = {
    animeId: anime.id,
    filePath: episodeFilePath,
    coverUrl: episodeCover,
  } as Episode;

  if (episodeFileExt === '.mkv') {
    const episodeFileMp4 = await convertMkvToMp4(episodeFilePath);
    episode.filePath = episodeFileMp4;
  }

  const insertedEpisode = await Database.insertEpisode(episode);
  await processEpisodeSubtitles(insertedEpisode);
};

const processEpisodeSubtitles = async (episode: Episode) => {
  const localEpisodeSubtitles = Database.getSubtitlesByEpisodeId(episode.id!);
  if (localEpisodeSubtitles.length === 0) {
    const episodeSubtitles = await extractVideoSubtitles(episode.filePath);
    for (const subtitle of episodeSubtitles) {
      const newEpisode = <Subtitle>{
        label: subtitle.title,
        language: subtitle.language,
        filePath: subtitle.filePath,
        episodeId: episode.id,
      };
      await Database.insertSubtitle(newEpisode);
    }
  }
};

export const processAnimes = async (directories: Array<string>) => {
  directories.forEach(async (directory) => {
    const directoryFolders = await fs.readdir(directory);
    for (const folder of directoryFolders) {
      const folderPath = path.join(directory, folder);
      const episodeFilesPaths = await getEpisodeFilesPaths(folderPath);
      if (episodeFilesPaths.length > 0) {
        const localAnime = Database.getAnimeByPath(folderPath);
        if (localAnime) {
          processAnimeEpisodes(localAnime, episodeFilesPaths);
        } else {
          const anime = await anilistService.getAnimeBySearch(folder);
          const newAnime = { ...anime, folderPath };
          const localAnime = await Database.insertAnime(newAnime);
          processAnimeEpisodes(localAnime, episodeFilesPaths);
        }
      }
    }
  });
};
