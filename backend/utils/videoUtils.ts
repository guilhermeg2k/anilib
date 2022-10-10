import ffprobe from 'ffprobe';
import ffprobeStatic from 'ffprobe-static';
import fs from 'fs';
import path from 'path';
import util from 'util';

const exec = util.promisify(require('child_process').exec);

interface Subtitle {
  title: string;
  language: string;
  filePath: string;
}

export const convertMkvToMp4 = async (mkvFilePath: string) => {
  const mp4FilePath = mkvFilePath.replace('.mkv', '.mp4');
  const videoAlreadyExists = fs.existsSync(mp4FilePath);
  const notSupportedCodecs = ['hevc'];
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

export const extractImageCoverFromVideo = async (videoFilePath: string) => {
  const fileExt = path.extname(videoFilePath);
  const coverImageFilePath = videoFilePath.replace(fileExt, '.jpg');

  const imageAlreadyExists = fs.existsSync(coverImageFilePath);

  if (!imageAlreadyExists) {
    const ffmpegExecCommand = `ffmpeg -ss 00:00:05 -i "${videoFilePath}" -frames:v 1 -q:v 2 "${coverImageFilePath}"`;
    const { error } = await exec(ffmpegExecCommand);
    if (error) {
      throw new Error(`Failed to extract image cover from ${videoFilePath}`);
    }
  }

  return coverImageFilePath;
};

export const extractSubtitlesFromVideo = async (videoFilePath: string) => {
  const subtitles = Array<Subtitle>();
  const notSupportedCodecs = ['hdmv_pgs_subtitle'];
  const fileProb = await ffprobe(videoFilePath, {
    path: ffprobeStatic.path,
  });

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
      const subtitleFilePath = videoFilePath.replace(
        fileExt,
        `-${subtitleIndex}-${language}.vtt`
      );

      ffmpegExecCommand += ` -map 0:${subtitleIndex} "${subtitleFilePath}"`;

      const subtitle = <Subtitle>{
        filePath: subtitleFilePath,
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
