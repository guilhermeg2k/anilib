import { WebsocketEvent } from '@backend/constants/websocketEvents';
import SocketIO from '@backend/websocket/socketIO';
import AnimeService from 'backend/service/animeService';
import EpisodeService from 'backend/service/episodeService';
import SubtitleService from 'backend/service/subtitleService';
import DirectoryService from './directoryService';
import SettingsService from './settingsService';

enum Status {
  Updated = 'UPDATED',
  Updating = 'UPDATING',
  Failed = 'Failed',
}

class LibraryService {
  static status = Status.Updated;

  async update() {
    try {
      this.updateStatus(Status.Updating);

      if (SettingsService.getIsToDeleteInvalidData()) {
        await DirectoryService.deleteInvalids();
        await AnimeService.deleteInvalids();
        await EpisodeService.deleteInvalids();
        await SubtitleService.deleteInvalids();
      }

      const directories = DirectoryService.list();
      await AnimeService.createFromDirectories(directories);

      const animes = AnimeService.list();
      await EpisodeService.createFromAnimes(animes);

      const episodes = EpisodeService.list();
      await SubtitleService.createFromEpisodes(episodes);

      if (SettingsService.getIsToDeleteConvertedData()) {
        await EpisodeService.deleteConverted();
      }

      this.updateStatus(Status.Updated);
    } catch (error) {
      this.updateStatus(Status.Failed);
      console.log(error);
    }
  }

  updateStatus(status: Status) {
    LibraryService.status = status;
    SocketIO.send(WebsocketEvent.UpdateLibraryStatus, status);
  }
}

export default LibraryService;
