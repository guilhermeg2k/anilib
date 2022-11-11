import { LibraryStatus } from '@backend/constants/libraryStatus';
import { WebsocketEvent } from '@backend/constants/websocketEvents';
import SocketIO from '@backend/websocket/socketIO';
import AnimeService from 'backend/service/animeService';
import EpisodeService from 'backend/service/episodeService';
import SubtitleService from 'backend/service/subtitleService';
import DirectoryService from './directoryService';
import SettingsService from './settingsService';

class LibraryService {
  static status = LibraryStatus.Updated;

  async update() {
    try {
      const libraryIsNotUpdating =
        LibraryService.status !== LibraryStatus.Updating;

      if (libraryIsNotUpdating) {
        this.updateStatus(LibraryStatus.Updating);
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

        this.updateStatus(LibraryStatus.Updated);
      }
    } catch (error) {
      this.updateStatus(LibraryStatus.Failed);
      console.log(error);
    }
  }

  getStatus() {
    return LibraryService.status;
  }

  updateStatus(status: LibraryStatus) {
    LibraryService.status = status;
    SocketIO.send(WebsocketEvent.UpdateLibraryStatus, status);
  }
}

export default LibraryService;
