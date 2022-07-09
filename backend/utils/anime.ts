import Database from '@backend/database';
import { Anime } from '@backend/database/types';
import { exec } from 'child_process';
import ffprobe from 'ffprobe';
import ffprobeStatic from 'ffprobe-static';

import fileSystem from 'fs';
import path from 'path';
import anilistService from 'service/anilist';
import { flatten } from './array';

const fs = fileSystem.promises;

export const syncAnimes = async (directories: Array<string>) => {
  try {
    directories.forEach(async (directory) => {
      const directoryFolders = await fs.readdir(directory);
      for (const folder of directoryFolders) {
        const folderPath = path.join(directory, folder);
        const episodes = await getEpisodeFiles(folderPath);
        if (episodes.length > 0) {
          const localAnime = Database.getAnimes().find(
            (anime) => anime.folderPath === folderPath
          );

          if (localAnime) {
            episodes.forEach((episode) => processEpisode(localAnime, episode));
          } else {
            const anime = await anilistService.getAnimeBySearch(folder);
            const localAnime = await Database.insertAnime(anime);
            episodes.forEach((episode) => processEpisode(localAnime, episode));
          }
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const getEpisodeFiles = async (folder: string) => {
  const folderDir = await fs.readdir(folder);
  const episodesPromises = folderDir.map(async (file: string) => {
    const filePath = path.join(folder, file);
    const fileStats = await fs.stat(filePath);
    const isFile = fileStats.isFile();
    const isDir = fileStats.isDirectory();
    if (isFile) {
      const fileExt = path.extname(filePath);
      if (fileExt === '.mkv') {
        return filePath;
      }
    } else if (isDir) {
      return getEpisodeFiles(filePath);
    }
    return null;
  });
  const episodes = (await Promise.all(episodesPromises)) as Array<
    string | Array<string>
  >;
  const flattedEpisodes = flatten(episodes) as Array<string>;
  const notNullEpisodes = flattedEpisodes.filter((episode) => Boolean(episode));
  return notNullEpisodes;
};

const processEpisode = async (anime: Anime, episodePath: string) => {
  const episodeMetaData = await ffprobe(episodePath, {
    path: ffprobeStatic.path,
  });
  const newFilePath = episodePath.replace('.mkv', '.mp4');
  const ffmpegExecCommand = `ffmpeg -i "${episodePath}" -codec copy "${newFilePath}"`;
  exec(ffmpegExecCommand, processEpisodeCb);
};

const processEpisodeCb = (
  error: ExecException | null,
  stdout: string,
  stderr: string
) => {
  if (error) {
    console.log('deu bo', error);
  } else {
    console.log('não deu bo');
  }
};
