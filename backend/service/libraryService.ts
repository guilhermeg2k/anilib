import AnimeService from '@backend/service/animeService';
import EpisodeService from '@backend/service/episodeService';
import SubtitleService from '@backend/service/subtitleService';
import DirectoryService from './directoryService';
import SettingsService from './settingsService';

class LibraryService {
  async update() {
    if (SettingsService.getIsToDeleteInvalidData()) {
      await DirectoryService.deleteInvalids();
      await AnimeService.deleteInvalids();
      await EpisodeService.deleteInvalids();
      await SubtitleService.deleteInvalids();
    }

    const directories = DirectoryService.list();
    await AnimeService.createFromDirectories(directories);

    const animes = AnimeService.list();
    const createEpisodesPromises = animes.map(async (anime) => {
      await EpisodeService.createFromAnime(anime);
    });
    await Promise.all(createEpisodesPromises);

    const episodes = EpisodeService.list();
    for (const episode of episodes) {
      await SubtitleService.createFromEpisode(episode);
    }

    if (SettingsService.getIsToDeleteConvertedData()) {
      await EpisodeService.deleteConverted();
    }
  }
}

export default LibraryService;
