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

export const convertMkvToMp4 = async (
  mkvFilePath: string,
  outputDir: string
) => {
  const mp4FileName = path.basename(mkvFilePath).replace('.mkv', '.mp4');
  const mp4FilePath = path.join(outputDir, mp4FileName);
  const videoAlreadyExists = fs.existsSync(mp4FilePath);
  const notSupportedCodecs = ['hevc'];

  const outputDirDoesNotExists = !fs.existsSync(outputDir);
  if (outputDirDoesNotExists) {
    await fsPromises.mkdir(outputDir);
  }

  if (!videoAlreadyExists) {
    const mkvProb = await ffprobe(mkvFilePath, {
      path: ffprobeStatic.path,
    });

    const isCodecSupported = !notSupportedCodecs.includes(
      mkvProb.streams[0].codec_name!
    );

    let ffmpegExecCommand = '';
    if (isCodecSupported) {
      ffmpegExecCommand = `ffmpeg -i "${mkvFilePath}" -strict experimental -codec copy "${mp4FilePath}"`;
    } else {
      ffmpegExecCommand = `ffmpeg -i "${mkvFilePath}" -strict experimental -vcodec h264 "${mp4FilePath}"`;
    }

    const { error } = await exec(ffmpegExecCommand);

    if (error) {
      throw new Error(`Failed to convert ${mkvFilePath} to mp4`);
    }
  }
  return mp4FilePath;
};

export const extractImageCoverFromVideo = async (
  videoFilePath: string,
  outputDir: string
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
  outputDir: string
) => {
  const subtitles = Array<Subtitle>();
  const notSupportedCodecs = ['hdmv_pgs_subtitle'];
  const fileProb = await ffprobe(videoFilePath, {
    path: ffprobeStatic.path,
  });
  const outputDirDoesNotExists = !fs.existsSync(outputDir);
  if (outputDirDoesNotExists) {
    await fsPromises.mkdir(outputDir);
  }

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
