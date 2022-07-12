import ffprobe from 'ffprobe';
import ffprobeStatic from 'ffprobe-static';
import path from 'path';
import util from 'util';
import fs from 'fs';

const exec = util.promisify(require('child_process').exec);

interface Subtitle {
  title: string;
  language: string;
  filePath: string;
}

class VideoUtils {
  convertMkvToMp4 = async (mkvFilePath: string) => {
    const mp4FilePath = mkvFilePath.replace('.mkv', '.mp4');
    const videoAlreadyExists = fs.existsSync(mp4FilePath);
    if (!videoAlreadyExists) {
      const ffmpegExecCommand = `ffmpeg -i "${mkvFilePath}" -codec copy "${mp4FilePath}"`;
      const { error } = await exec(ffmpegExecCommand);
      if (error) {
        throw new Error(`Failed to convert ${mkvFilePath} to mp4`);
      }
    }
    return mp4FilePath;
  };

  extractImageCover = async (videoFilePath: string) => {
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

  extractSubtitles = async (videoFilePath: string) => {
    const subtitles = Array<Subtitle>();
    const fileProb = await ffprobe(videoFilePath, {
      path: ffprobeStatic.path,
    });

    const subtitleStreams = fileProb.streams.filter(
      // @ts-ignore
      (stream) => stream.codec_type == 'subtitle'
    );

    if (subtitleStreams.length > 0) {
      const fileExt = path.extname(videoFilePath);
      let ffmpegExecCommand = `ffmpeg -i "${videoFilePath}"`;
      for (const subtitleStream of subtitleStreams) {
        const mapIndex = subtitleStream.index - 2;
        const language = subtitleStream.tags.language;
        const subtitleFilePath = videoFilePath.replace(
          fileExt,
          `-${mapIndex}-${language}-.vtt`
        );

        ffmpegExecCommand += ` -map 0:s:${mapIndex} "${subtitleFilePath}"`;

        const subtitle = <Subtitle>{
          filePath: subtitleFilePath,
          title: subtitleStream.tags.title,
          language: subtitleStream.tags.language,
        };

        subtitles.push(subtitle);
      }

      const { error } = await exec(ffmpegExecCommand);

      if (error) {
        throw new Error(`Error to extract ${videoFilePath} subtitles`);
      }
    }

    return subtitles;
  };
}

export default VideoUtils;
