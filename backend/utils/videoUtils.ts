import ffprobe from 'ffprobe';
import ffprobeStatic from 'ffprobe-static';
import fs from 'fs';
import path from 'path';
import util from 'util';

const exec = util.promisify(require('child_process').exec);
const fsPromises = fs.promises;

interface Subtitle {
  title: string;
  language: string;
  filePath: string;
}

const getDefaultOutputDir = (filePath: string) => {
  const fileExt = path.extname(filePath);
  const fileCurrentDir = path.dirname(filePath);
  const fileName = path.basename(filePath).replace(fileExt, '');
  const fileOutputDir = path.join(fileCurrentDir, fileName);

  return fileOutputDir;
};

export const convertMkvToMp4 = async (
  mkvFilePath: string,
  shouldUseNVENC = false,
  outputDir = getDefaultOutputDir(mkvFilePath)
) => {
  const outputDirDoesNotExists = !fs.existsSync(outputDir);
  if (outputDirDoesNotExists) {
    await fsPromises.mkdir(outputDir);
  }

  const mp4FileName = path.basename(mkvFilePath).replace('.mkv', '.mp4');
  const mp4FilePath = path.join(outputDir, mp4FileName);
  const videoDoesNotExists = !fs.existsSync(mp4FilePath);

  if (videoDoesNotExists) {
    const mkvProb = await ffprobe(mkvFilePath, {
      path: ffprobeStatic.path,
    });

    const notSupportedCodecs = ['hevc'];
    const isCodecSupported = !notSupportedCodecs.includes(
      mkvProb.streams[0].codec_name!
    );

    if (isCodecSupported) {
      await convertToMp4CopyingEncoder(mkvFilePath, mp4FilePath);
    } else {
      if (shouldUseNVENC) {
        await convertToMp4ReencodingWithH264NVENC(mkvFilePath, mp4FilePath);
      } else {
        await convertToMp4ReencodingWithH264(mkvFilePath, mp4FilePath);
      }
    }
  }

  return mp4FilePath;
};

const convertToMp4CopyingEncoder = async (input: string, output: string) => {
  const ffmpegExecCommand = `ffmpeg -i "${input}" -strict experimental -codec copy "${output}"`;
  const { error } = await exec(ffmpegExecCommand);

  if (error) {
    throw new Error(`Failed to convert ${input} to mp4`, { cause: error });
  }
};

const convertToMp4ReencodingWithH264 = async (
  input: string,
  output: string
) => {
  const ffmpegExecCommand = `ffmpeg -i "${input}" -strict experimental -vcodec h264 "${output}"`;
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
  const ffmpegExecCommand = `ffmpeg -i "${input}" -strict experimental -c:v h264_nvenc -pix_fmt yuv420p "${output}"`;
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
    const ffmpegExecCommand = `ffmpeg -ss 00:00:05 -i "${videoFilePath}" -frames:v 1 -q:v 2 "${jpgFilePath}"`;
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

  const notSupportedCodecs = ['hdmv_pgs_subtitle'];
  const subtitleStreams = fileProb.streams.filter(
    (stream) =>
      // @ts-ignore
      stream.codec_type == 'subtitle' &&
      !notSupportedCodecs.includes(stream.codec_name!)
  );

  if (subtitleStreams.length > 0) {
    let subtitlesCount = 1;
    const fileExt = path.extname(videoFilePath);
    let ffmpegExecCommand = `ffmpeg -i "${videoFilePath}"`;
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
