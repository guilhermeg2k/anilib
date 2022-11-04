import ffprobe from 'ffprobe';
import ffprobeStatic from 'ffprobe-static';
import fs from 'fs';
import path from 'path';
import util from 'util';

const exec = util.promisify(require('child_process').exec);
const fsPromises = fs.promises;
const VIDEO_SUPPORTED_EXTENSIONS = ['.mp4', '.webm'];
const VIDEO_SUPPORTED_CODECS = ['h264', 'vp8', 'vp9', 'av1'];
const UNSUPPORTED_SUBTITLE_CODECS = ['hdmv_pgs_subtitle'];

interface Subtitle {
  title: string;
  language: string;
  filePath: string;
}

export const isVideoCodecSupported = async (videoFilePath: string) => {
  const mkvFileProb = await ffprobe(videoFilePath, {
    path: ffprobeStatic.path,
  });

  const isVideoCodecSupported = VIDEO_SUPPORTED_CODECS.includes(
    mkvFileProb.streams[0].codec_name!
  );

  return isVideoCodecSupported;
};

export const isVideoContainerSupported = (videoFilePath: string) => {
  const videoExt = path.extname(videoFilePath);

  const isVideoContainerSupported =
    VIDEO_SUPPORTED_EXTENSIONS.includes(videoExt);

  return isVideoContainerSupported;
};

const getDefaultOutputDir = (filePath: string) => {
  const fileExt = path.extname(filePath);
  const fileCurrentDir = path.dirname(filePath);
  const fileName = path.basename(filePath).replace(fileExt, '');
  const fileOutputDir = path.join(fileCurrentDir, fileName);

  return fileOutputDir;
};

export const convertVideoToMp4 = async (
  videoFilePath: string,
  shouldUseNVENC = false,
  outputDir = getDefaultOutputDir(videoFilePath)
) => {
  const outputDirDoesNotExists = !fs.existsSync(outputDir);
  if (outputDirDoesNotExists) {
    await fsPromises.mkdir(outputDir);
  }

  const videoFileExt = path.extname(videoFilePath);
  const mp4FileName = path
    .basename(videoFilePath)
    .replace(videoFileExt, '.mp4');
  const mp4FilePath = path.join(outputDir, mp4FileName);
  const videoDoesNotExists = !fs.existsSync(mp4FilePath);

  if (videoDoesNotExists) {
    if (await isVideoCodecSupported(videoFilePath)) {
      await convertToMp4CopyingEncoder(videoFilePath, mp4FilePath);
    } else {
      if (shouldUseNVENC) {
        await convertToMp4ReencodingWithH264NVENC(videoFilePath, mp4FilePath);
      } else {
        await convertToMp4ReencodingWithH264(videoFilePath, mp4FilePath);
      }
    }
  }

  return mp4FilePath;
};

const convertToMp4CopyingEncoder = async (input: string, output: string) => {
  const ffmpegExecCommand = `ffmpeg -y -i "${input}" -strict experimental -codec copy "${output}"`;
  const { error } = await exec(ffmpegExecCommand);

  if (error) {
    throw new Error(`Failed to convert ${input} to mp4`, { cause: error });
  }
};

const convertToMp4ReencodingWithH264 = async (
  input: string,
  output: string
) => {
  const ffmpegExecCommand = `ffmpeg -y -i "${input}" -strict experimental -vcodec h264 "${output}"`;
  const { error } = await exec(ffmpegExecCommand);

  if (error) {
    throw new Error(`Failed to convert ${input} to mp4 using h264`, {
      cause: error,
    });
  }
};

const convertToMp4ReencodingWithH264NVENC = async (
  input: string,
  output: string
) => {
  const ffmpegExecCommand = `ffmpeg -y -i "${input}" -strict experimental -c:v h264_nvenc -pix_fmt yuv420p "${output}"`;
  const { error } = await exec(ffmpegExecCommand);

  if (error) {
    throw new Error(`Failed to convert ${input} to mp4 using h264_nvenc`, {
      cause: error,
    });
  }
};

export const extractImageCoverFromVideo = async (
  videoFilePath: string,
  outputDir = getDefaultOutputDir(videoFilePath)
) => {
  const outputDirDoesNotExists = !fs.existsSync(outputDir);
  if (outputDirDoesNotExists) {
    await fsPromises.mkdir(outputDir);
  }

  const fileExt = path.extname(videoFilePath);
  const jpgFileName = path.basename(videoFilePath).replace(fileExt, '.jpg');
  const jpgFilePath = path.join(outputDir, jpgFileName);

  const imageDoesNotExists = !fs.existsSync(jpgFilePath);

  if (imageDoesNotExists) {
    const ffmpegExecCommand = `ffmpeg -y -ss 00:00:05 -i "${videoFilePath}" -frames:v 1 -q:v 2 "${jpgFilePath}"`;
    const { error } = await exec(ffmpegExecCommand);
    if (error) {
      throw new Error(`Failed to extract image cover from ${videoFilePath}`);
    }
  }

  return jpgFilePath;
};

export const extractSubtitlesFromVideo = async (
  videoFilePath: string,
  outputDir = getDefaultOutputDir(videoFilePath)
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
    const fileExt = path.extname(videoFilePath);
    let ffmpegExecCommand = `ffmpeg -y -i "${videoFilePath}"`;
    for (const subtitleStream of subtitleStreams) {
      const subtitleIndex = subtitleStream.index;
      const language =
        subtitleStream.tags?.language || `Language ${subtitlesCount}`;

      const vttFileName = path
        .basename(videoFilePath)
        .replace(fileExt, `-${subtitleIndex}-${language}.vtt`);
      const vttFilePath = path.join(outputDir, vttFileName);

      ffmpegExecCommand += ` -map 0:${subtitleIndex} "${vttFilePath}"`;

      const subtitle = <Subtitle>{
        filePath: vttFilePath,
        title: subtitleStream.tags?.title || language,
        language,
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
