import { LibraryStatus } from '@backend/constants/libraryStatus';
import { WebsocketEvent } from '@backend/constants/websocketEvents';
import SocketIO from '@backend/websocket/socketIO';
import AnimeService from 'backend/service/animeService';
import EpisodeService from 'backend/service/episodeService';
import SubtitleService from 'backend/service/subtitleService';
import DirectoryService from './directoryService';
import EpisodePreviewService from './episodePreviewService';
import SettingsService from './settingsService';

class LibraryService {
  static status = LibraryStatus.Updated;

  async update() {
    try {
      const startTime = Date.now();

      const libraryIsNotUpdating =
        LibraryService.status !== LibraryStatus.Updating;

      if (libraryIsNotUpdating) {
        this.updateStatus(LibraryStatus.Updating);
        if (SettingsService.get('isToDeleteInvalidData')) {
          await DirectoryService.deleteInvalids();
          await AnimeService.deleteInvalids();
          await EpisodeService.deleteInvalids();
          await SubtitleService.deleteInvalids();
        }

        const directories = DirectoryService.list();
        await AnimeService.createFromDirectories(directories);
        console.log('Animes updated!');

        const animes = AnimeService.list();
        await EpisodeService.createFromAnimes(animes);
        console.log('Episodes updated!');

        const episodes = EpisodeService.list();
        await SubtitleService.createFromEpisodes(episodes);
        console.log('Subtitles updated!');

        if (SettingsService.get('IsToRemoveSubtitlesComments')) {
          await SubtitleService.removeCommentsFromEpisodes(episodes);
          console.log('Subtitles comments removed!');
        }

        await EpisodePreviewService.createFromEpisodes(episodes);
        console.log('Episode previews updated!');

        if (SettingsService.get('isToDeleteConvertedData')) {
          await EpisodeService.deleteConverted();
          console.log('Converted episodes deleted!');
        }

        this.updateStatus(LibraryStatus.Updated);
      }

      const endTime = Date.now();
      console.log(`Library update elapsed time: ${endTime - startTime} ms`);
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
