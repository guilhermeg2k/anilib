import AnimeService from '@backend/service/animeService';
import EpisodeService from '@backend/service/episodeService';
import SubtitleService from '@backend/service/subtitleService';
import DirectoryService from './directoryService';

const animeService = new AnimeService();
const episodeService = new EpisodeService();
const subtitleService = new SubtitleService();
const directoriesService = new DirectoryService();

class LibraryService {
  async update() {
    const directories = directoriesService.list();
    await animeService.createFromDirectories(directories);

    const animes = animeService.list();
    for (const anime of animes) {
      await episodeService.createFromAnime(anime);
    }

    const episodes = episodeService.list();
    for (const episode of episodes) {
      await subtitleService.createFromEpisode(episode);
    }
  }
}

export default LibraryService;