import {
  getFileInBase64,
  getFilesInDirectoryByExtensions,
} from '@common/utils/file-utils';
import {
  extractJpgImageFromVideo,
  getVideoDurationInSeconds,
} from '@common/utils/video-utils';
import { sortByStringNumbersSum } from 'common/utils/string-utils';
import { Episode } from 'backend/database/types';
import pLimit from 'p-limit';
import path from 'path';
import EpisodeService from './episode-service';

const PREVIEW_EXTENSIONS = ['.jpg'];

class EpisodePreviewService {
  static async listByEpisodeId(episodeId: string) {
    const episode = await EpisodeService.getById(episodeId);
    const episodeImageCoverDir = path.dirname(episode.coverImagePath);
    const previewFolder = path.join(episodeImageCoverDir, 'preview');

    const previewFiles = await getFilesInDirectoryByExtensions(
      previewFolder,
      PREVIEW_EXTENSIONS
    );

    return previewFiles;
  }

  static async listInBase64ByEpisodeId(episodeId: string) {
    const previews = await this.listByEpisodeId(episodeId);
    const previewsInBase64Promises = previews
      .sort((previewFilePathA: string, previewFilePathB: string) => {
        const previewFileNameA = path.basename(previewFilePathA);
        const previewFileNameB = path.basename(previewFilePathB);
        return sortByStringNumbersSum(previewFileNameA, previewFileNameB);
      })
      .map(async (preview) => await getFileInBase64(preview));

    const previewsInBase64 = await Promise.all(previewsInBase64Promises);

    return previewsInBase64.flat(Infinity);
  }

  static async createFromEpisodes(episodes: Array<Episode>) {
    const createdPreviews = Array<string>();

    for (const episode of episodes) {
      const episodePreviews = await EpisodePreviewService.createFromEpisode(
        episode
      );
      if (episodePreviews) {
        createdPreviews.push(...episodePreviews);
      }
    }

    return createdPreviews.flat(Infinity);
  }

  private static async createFromEpisode(episode: Episode) {
    const episodePreviews = await this.listByEpisodeId(episode.id!);

    const episodeHasPreviews = episodePreviews.length > 0;

    if (episodeHasPreviews) {
      return;
    }

    const createFromFramePromises = Array<Promise<string>>();
    const createFromFramePromisesLimiter = pLimit(6);
    const episodeDurationInSeconds = await getVideoDurationInSeconds(
      episode.filePath
    );
    const previewIntervalInSeconds = 10;
    const numberOfPreviewsToGenerate = Math.floor(
      episodeDurationInSeconds / previewIntervalInSeconds
    );

    for (
      let currentPreviewCount = 0;
      currentPreviewCount <= numberOfPreviewsToGenerate;
      currentPreviewCount++
    ) {
      let currentFrameToExtract =
        currentPreviewCount * previewIntervalInSeconds;

      if (currentPreviewCount == numberOfPreviewsToGenerate) {
        currentFrameToExtract = episodeDurationInSeconds;
      }

      createFromFramePromises.push(
        createFromFramePromisesLimiter(() =>
          this.createFromFrame(episode, currentFrameToExtract)
        )
      );
    }
    const createdPreviews = await Promise.all(createFromFramePromises);
    return createdPreviews;
  }

  private static async createFromFrame(episode: Episode, frame: number) {
    const previewOutputDir = path.join(
      path.dirname(episode.coverImagePath),
      'preview'
    );

    const previewFilePath = await extractJpgImageFromVideo({
      videoFilePath: episode.filePath,
      outputDir: previewOutputDir,
      outputFileName: String(frame),
      secondToExtract: frame,
    });

    return previewFilePath;
  }
}

export default EpisodePreviewService;
