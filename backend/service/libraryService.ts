import AnimeService from '@backend/service/animeService';
import EpisodeService from '@backend/service/episodeService';
import SubtitleService from '@backend/service/subtitleService';
import DirectoryService from './directoryService';
import SettingsService from './settingsService';

const animeService = new AnimeService();
const episodeService = new EpisodeService();
const subtitleService = new SubtitleService();
const directoriesService = new DirectoryService();
const settingsService = new SettingsService();
class LibraryService {
  async update() {
    if (settingsService.getIsToDeleteInvalidData()) {
      await directoriesService.deleteInvalidDirectories();
      await animeService.deleteInvalidAnimes();
      await episodeService.deleteInvalidEpisodes();
      await subtitleService.deleteInvalidSubtitles();
    }

    const directories = directoriesService.list();
    await animeService.createFromDirectories(directories);

    const animes = animeService.list();
    const createEpisodesPromises = animes.map(async (anime) => {
      await episodeService.createFromAnime(anime);
    });
    await Promise.all(createEpisodesPromises);

    const episodes = episodeService.list();
    for (const episode of episodes) {
      await subtitleService.createFromEpisode(episode);
    }

    if (settingsService.getIsToDeleteConvertedData()) {
      await episodeService.deleteConvertedEpisodes();
    }
  }
}

export default LibraryService;
