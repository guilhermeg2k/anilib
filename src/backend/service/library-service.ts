import { LibraryStatus } from '@backend/constants/library-status';
import AnimeService from 'backend/service/anime-service';
import EpisodeService from 'backend/service/episode-service';
import SubtitleService from 'backend/service/subtitle-service';
import DirectoryService from './directory-service';
import EpisodePreviewService from './episode-preview-service';
import SettingsService from './settings-service';
import { libraryEventEmitter } from '@backend/trpc/routers/ws/library';

class LibraryService {
  private static status = LibraryStatus.Updated;

  static async update() {
    try {
      const startTime = Date.now();

      const libraryIsNotUpdating =
        LibraryService.status !== LibraryStatus.Updating;

      if (libraryIsNotUpdating) {
        LibraryService.updateStatus(LibraryStatus.Updating);
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

  static getStatus() {
    return LibraryService.status;
  }

  static updateStatus(status: LibraryStatus) {
    LibraryService.status = status;
    libraryEventEmitter.emit('update', status);
  }
}

export default LibraryService;
