import EpisodePreviewRepository from '@backend/repository/episodePreviewRepository';
import {
  extractJpgImageFromVideo,
  getVideoDurationInSeconds,
} from '@backend/utils/videoUtils';
import { Episode, EpisodePreview } from 'backend/database/types';
import fs from 'fs';
import pLimit from 'p-limit';
import path from 'path';

class EpisodePreviewService {
  private static createFromEpisodePromiseLimiter = pLimit(10);

  static list() {
    const previews = EpisodePreviewRepository.list();
    return previews;
  }

  static listByEpisodeId(episodeId: string) {
    const previews = EpisodePreviewRepository.listByEpisodeId(episodeId);
    return previews;
  }

  static deleteInvalids() {
    const invalidPreviews = this.list().filter(
      (preview) => !fs.existsSync(preview.filePath)
    );

    invalidPreviews.forEach((invalidPreview) =>
      EpisodePreviewRepository.deleteById(invalidPreview.id!)
    );
  }

  private static async create(episodePreview: EpisodePreview) {
    const createdPreview = await EpisodePreviewRepository.create(
      episodePreview
    );
    return createdPreview;
  }

  static async createFromEpisodes(episodes: Array<Episode>) {
    const createFromEpisodePromises = episodes.map((episode) =>
      EpisodePreviewService.createFromEpisodePromiseLimiter(() =>
        EpisodePreviewService.createFromEpisode(episode)
      )
    );
    const createdPreviews = await Promise.all(createFromEpisodePromises);
    return createdPreviews.flat(Infinity);
  }

  private static async createFromEpisode(episode: Episode) {
    const episodePreviews = EpisodePreviewRepository.listByEpisodeId(
      episode.id!
    );
    const episodeHasPreviews = episodePreviews.length > 0;

    if (episodeHasPreviews) {
      return;
    }

    const createdPreviews = Array<EpisodePreview>();
    const episodeFileExt = path.extname(episode.filePath);
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

      const jpgFileName = path
        .basename(episode.filePath)
        .replace(episodeFileExt, `-${currentFrameToExtract}.jpg`);

      const jpgOutputDir = path.join(
        path.dirname(episode.coverImagePath),
        'preview'
      );

      const previewFilePath = await extractJpgImageFromVideo(
        episode.filePath,
        currentFrameToExtract,
        jpgFileName,
        jpgOutputDir
      );

      const createdPreview = await EpisodePreviewService.create({
        episodeId: episode.id!,
        filePath: previewFilePath,
        order: currentPreviewCount,
      });

      createdPreviews.push(createdPreview);
    }

    return createdPreviews;
  }
}

export default EpisodePreviewService;
