import Database from '@backend/database';
import { Anime, Episode, Subtitle } from '@backend/database/types';
import ffprobe from 'ffprobe';
import ffprobeStatic from 'ffprobe-static';
import fileSystem from 'fs';
import path from 'path';
import anilistService from 'service/anilist';
import util from 'util';

const fs = fileSystem.promises;
const exec = util.promisify(require('child_process').exec);

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
  const episodeCover = await extractEpisodeImageCover(episodeFilePath);
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
  const localEpisodeSubtitles = await Database.getSubtitlesByEpisodeId(
    episode.id!
  );
  if (localEpisodeSubtitles.length === 0) {
    const episodeSubtitles = await extractFileSubtitles(episode.filePath);
    for (const subtitle of episodeSubtitles) {
      const newEpisode = <Subtitle>{
        label: subtitle.label,
        language: subtitle.language,
        filePath: subtitle.filePath,
        episodeId: episode.id,
      };
      await Database.insertSubtitle(newEpisode);
    }
  }
};

const extractFileSubtitles = async (filePath: string) => {
  const subtitles = Array<Subtitle>();
  const episodeFileProb = await ffprobe(filePath, {
    path: ffprobeStatic.path,
  });

  const subtitleStreams = episodeFileProb.streams.filter(
    (stream) => stream.codec_type == 'subtitle'
  );

  if (subtitleStreams.length > 0) {
    const fileExt = path.extname(filePath);
    let ffmpegExecCommand = `ffmpeg -i "${filePath}"`;
    for (const subtitleStream of subtitleStreams) {
      const mapIndex = subtitleStream.index - 2;
      const language = subtitleStream.tags.language;
      const subtitleFilePath = filePath.replace(
        fileExt,
        `-${mapIndex}-${language}-.vtt`
      );
      ffmpegExecCommand += ` -map 0:s:${mapIndex} "${subtitleFilePath}"`;

      const subtitle = {
        filePath: subtitleFilePath,
        label: subtitleStream.tags.title,
        language: subtitleStream.tags.language,
      } as Subtitle;

      subtitles.push(subtitle);
    }

    const { error } = await exec(ffmpegExecCommand);

    if (error) {
      throw new Error(`Error to extract ${filePath} subtitles`);
    }
  }

  return subtitles;
};

const convertMkvToMp4 = async (mkvFilePath: string) => {
  const mp4FilePath = mkvFilePath.replace('.mkv', '.mp4');
  const ffmpegExecCommand = `ffmpeg -i "${mkvFilePath}" -codec copy "${mp4FilePath}"`;
  const { error } = await exec(ffmpegExecCommand);
  if (error) {
    throw new Error(`Failed to convert ${mkvFilePath} to mp4`);
  }
  return mp4FilePath;
};

const extractEpisodeImageCover = async (episodeFilePath: string) => {
  const fileExt = path.extname(episodeFilePath);
  const coverImageFilePath = episodeFilePath.replace(fileExt, '.jpg');
  const ffmpegExecCommand = `ffmpeg -ss 00:00:05 -i "${episodeFilePath}" -frames:v 1 -q:v 2 "${coverImageFilePath}"`;
  const { error } = await exec(ffmpegExecCommand);
  if (error) {
    throw new Error(`Failed to extract image cover from ${episodeFilePath}`);
  }
  return coverImageFilePath;
};

export const syncAnimes = async (directories: Array<string>) => {
  try {
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
            const localAnime = await Database.insertAnime(anime);
            processAnimeEpisodes(localAnime, episodeFilesPaths);
          }
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
};
