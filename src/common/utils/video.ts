import ffprobe from 'ffprobe';
import ffprobeStatic from 'ffprobe-static';
import fs from 'fs';
import path from 'path';
import util from 'util';
import { parseFileName } from './file';

const exec = util.promisify(require('child_process').exec);
const fsPromises = fs.promises;
const VIDEO_SUPPORTED_EXTENSIONS = ['.mp4', '.webm'];
const VIDEO_SUPPORTED_CODECS = ['h264', 'vp8', 'vp9', 'av1'];
const H264_SUPPORTED_PROFILES = ['baseline', 'main', 'high'];
const AUDIO_SUPPORTED_CODECS = ['aac', 'flac'];
const UNSUPPORTED_SUBTITLE_CODECS = ['hdmv_pgs_subtitle'];

type Subtitle = {
  code: string;
  name: string;
  filePath: string;
};

const getDefaultOutputDir = (filePath: string) => {
  const fileCurrentDir = path.dirname(filePath);
  const fileName = path.basename(filePath, path.extname(filePath));

  const fileOutputDir = path.join(fileCurrentDir, fileName);
  return fileOutputDir;
};

export const convertVideoToMp4 = async ({
  videoFilePath,
  shouldUseNVENC = false,
  outputDir = getDefaultOutputDir(videoFilePath),
  outputFileName = path.basename(videoFilePath, path.extname(videoFilePath)),
}: {
  videoFilePath: string;
  shouldUseNVENC: boolean;
  outputDir?: string;
  outputFileName?: string;
}) => {
  const outputDirDoesNotExists = !fs.existsSync(outputDir);
  if (outputDirDoesNotExists) {
    await fsPromises.mkdir(outputDir);
  }

  const mp4FilePath = path.join(outputDir, outputFileName + '.mp4');
  const videoDoesNotExists = !fs.existsSync(mp4FilePath);

  if (videoDoesNotExists) {
    const ffmpegCommand = await buildMP4ConvertCommand(
      videoFilePath,
      mp4FilePath,
      shouldUseNVENC
    );

    const { error } = await exec(ffmpegCommand);
    if (error) {
      throw new Error(`Failed to convert ${videoFilePath} to mp4`, {
        cause: error,
      });
    }
  }

  return mp4FilePath;
};

const buildMP4ConvertCommand = async (
  videoFilePath: string,
  mp4FilePath: string,
  shouldUseNVENC: boolean
) => {
  let command = `ffmpeg -y -i "${videoFilePath}" -strict experimental`;
  command = await appendVideoEncoder(command, videoFilePath, shouldUseNVENC);
  command = await appendAudioEncoder(command, videoFilePath);
  command = `${command} "${mp4FilePath}"`;
  return command;
};

const appendVideoEncoder = async (
  command: string,
  videoFilePath: string,
  shouldUseNVENC: boolean
) => {
  if (await isVideoCodecSupported(videoFilePath)) {
    return `${command} -c:v copy`;
  } else if (shouldUseNVENC) {
    return `${command} -cq 17 -c:v h264_nvenc -pix_fmt yuv420p -rc vbr -b:v 6M -maxrate:v 10M -bufsize:v 14M -profile:v high`;
  } else {
    return `${command} -crf 17 -c:v h264 -pix_fmt yuv420p -profile:v high`;
  }
};

const appendAudioEncoder = async (command: string, videoFilePath: string) => {
  if (await isAudioCodecSupported(videoFilePath)) {
    return `${command} -c:a copy`;
  } else {
    return `${command} -c:a aac`;
  }
};

export const isAudioCodecSupported = async (videoFilePath: string) => {
  const fileProb = await ffprobe(videoFilePath, {
    path: ffprobeStatic.path,
  });
  const isAudioCodecSupported = AUDIO_SUPPORTED_CODECS.includes(
    fileProb.streams[1].codec_name?.toLowerCase() ?? ''
  );
  return isAudioCodecSupported;
};

export const isVideoCodecSupported = async (videoFilePath: string) => {
  const fileProb = await ffprobe(videoFilePath, {
    path: ffprobeStatic.path,
  });
  const codec = fileProb.streams[0].codec_name;
  if (codec) {
    const isVideoCodecSupported = VIDEO_SUPPORTED_CODECS.includes(
      fileProb.streams[0].codec_name!
    );

    if (codec === 'h264') {
      const isVideoProfileSupported = H264_SUPPORTED_PROFILES.includes(
        fileProb.streams[0].profile?.toLocaleLowerCase() ?? ''
      );
      return isVideoProfileSupported;
    }
    return isVideoCodecSupported;
  }
  return false;
};

export const isVideoContainerSupported = (videoFilePath: string) => {
  const videoExt = path.extname(videoFilePath);

  const isVideoContainerSupported =
    VIDEO_SUPPORTED_EXTENSIONS.includes(videoExt);

  return isVideoContainerSupported;
};

export const extractJpgImageFromVideo = async ({
  videoFilePath,
  outputDir = getDefaultOutputDir(videoFilePath),
  outputFileName,
  scaleWidth = 500,
  secondToExtract,
}: {
  videoFilePath: string;
  outputDir?: string;
  outputFileName: string;
  secondToExtract: number;
  scaleWidth?: number;
}) => {
  const outputDirDoesNotExists = !fs.existsSync(outputDir);

  if (outputDirDoesNotExists) {
    try {
      await fsPromises.mkdir(outputDir);
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  const jpgFilePath = path.join(outputDir, `${outputFileName}.jpg`);
  const imageDoesNotExists = !fs.existsSync(jpgFilePath);

  if (imageDoesNotExists) {
    const ffmpegExecCommand = `ffmpeg -y -ss ${secondToExtract} -i "${videoFilePath}" -vf scale='${scaleWidth}':-1 -frames:v 1 -q:v 2 "${jpgFilePath}"`;
    const { error } = await exec(ffmpegExecCommand);
    if (error) {
      throw new Error(`Failed to extract jpg from ${videoFilePath}`, {
        cause: error,
      });
    }
  }

  return jpgFilePath;
};

//Todo: Refactor
export const extractSubtitlesFromVideo = async (
  videoFilePath: string,
  outputDir = path.join(getDefaultOutputDir(videoFilePath), 'subtitles')
) => {
  const outputDirDoesNotExists = !fs.existsSync(outputDir);
  if (outputDirDoesNotExists) {
    await fsPromises.mkdir(outputDir);
  }

  const subtitles = Array<Subtitle>();

  const fileProb = await ffprobe(videoFilePath, {
    path: ffprobeStatic.path,
  });

  const subtitleStreams = fileProb.streams.filter(
    (stream) =>
      // @ts-ignore
      stream.codec_type == 'subtitle' &&
      !UNSUPPORTED_SUBTITLE_CODECS.includes(stream.codec_name!)
  );

  if (subtitleStreams.length > 0) {
    let subtitlesCount = 1;
    let ffmpegExecCommand = `ffmpeg -y -i "${videoFilePath}" -f ass`;
    for (const subtitleStream of subtitleStreams) {
      const subtitleIndex = subtitleStream.index;

      const code = (
        subtitleStream.tags?.language?.toUpperCase() || `Lang ${subtitlesCount}`
      ).replaceAll('-', '');

      const name = subtitleStream.tags?.title?.replaceAll('-', '');

      const subFileName = parseFileName(
        name
          ? `${subtitlesCount}-${code} ${name}.ass`
          : `${subtitlesCount}-${code}.ass`
      );

      const subFilePath = path.join(outputDir, subFileName);

      ffmpegExecCommand += ` -map 0:${subtitleIndex} "${subFilePath}"`;

      const subtitle: Subtitle = {
        filePath: subFilePath,
        code,
        name: name ?? code,
      };

      subtitles.push(subtitle);
      subtitlesCount += 1;
    }

    const { error } = await exec(ffmpegExecCommand);

    if (error) {
      throw new Error(`Error to extract ${videoFilePath} subtitles`);
    }
  }

  return subtitles;
};

export const getVideoDurationInSeconds = async (videoPath: string) => {
  const fileProb = await ffprobe(videoPath, {
    path: ffprobeStatic.path,
  });

  const streamHasDuration =
    (fileProb.streams[0] && fileProb.streams[0].duration) !== null;

  if (streamHasDuration) {
    const durationInSeconds = Math.floor(fileProb.streams[0].duration!);
    return durationInSeconds;
  }

  throw new Error(`Duration not found on stream[0] of the video ${videoPath}`);
};

export const convertSubtitleToAss = async (
  subtitleFilePath: string,
  episodeFilePath: string
) => {
  const outputDir = path.join(
    getDefaultOutputDir(episodeFilePath),
    'subtitles'
  );

  const outputDirDoesNotExists = !fs.existsSync(outputDir);
  if (outputDirDoesNotExists) {
    await fsPromises.mkdir(outputDir);
  }

  const assFileName = path.basename(
    subtitleFilePath,
    path.extname(subtitleFilePath)
  );
  const outputFilePath = path.join(outputDir, assFileName);

  const ffmpegCommand = `ffmpeg -y -i "${subtitleFilePath}" "${outputFilePath}.ass"`;
  const { error } = await exec(ffmpegCommand);

  if (error) {
    throw new Error(`Error to convert ${subtitleFilePath} to ass`);
  }

  return outputFilePath;
};
