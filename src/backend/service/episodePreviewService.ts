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
    const createdPreviews = Array<EpisodePreview>();

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
    const episodePreviews = EpisodePreviewRepository.listByEpisodeId(
      episode.id!
    );
    const episodeHasPreviews = episodePreviews.length > 0;
    if (episodeHasPreviews) {
      return;
    }

    const createFromFramePromises = Array<Promise<EpisodePreview>>();
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

      const createPreviewFromFramePromise = this.createFromFrame(
        episode,
        currentFrameToExtract,
        currentPreviewCount
      );

      createFromFramePromises.push(
        createFromFramePromisesLimiter(() => createPreviewFromFramePromise)
      );
    }

    const createdPreviews = await Promise.all(createFromFramePromises);
    return createdPreviews;
  }

  private static async createFromFrame(
    episode: Episode,
    frame: number,
    order: number
  ) {
    const episodeFileName = path.parse(episode.filePath).name;
    const jpgFileName = `${episodeFileName}-${frame}.jpg`;

    const jpgOutputDir = path.join(
      path.dirname(episode.coverImagePath),
      'preview'
    );

    const previewFilePath = await extractJpgImageFromVideo(
      episode.filePath,
      frame,
      jpgFileName,
      jpgOutputDir
    );

    const createdPreview = await EpisodePreviewService.create({
      episodeId: episode.id!,
      filePath: previewFilePath,
      order,
    });

    return createdPreview;
  }
}

export default EpisodePreviewService;
