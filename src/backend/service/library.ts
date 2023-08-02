import AnimeService from 'backend/service/anime';
import EpisodeService from 'backend/service/episode';
import SubtitleService from 'backend/service/subtitle';
import DirectoryService from './directory';
import EpisodePreviewService from './episode-preview';
import SettingsService from './settings';
import { libraryEventEmitter } from '@backend/trpc/routers/ws/library';
import { LibraryStatus } from '@common/types/library';

class LibraryService {
  private static status: LibraryStatus = 'UPDATED';

  static async update() {
    try {
      const startTime = Date.now();

      const libraryIsNotUpdating = LibraryService.status !== 'UPDATING';

      if (libraryIsNotUpdating) {
        LibraryService.updateStatus('UPDATING');

        const shouldDeleteInvalidData = (
          await SettingsService.getByNameOrThrow('DELETE_INVALID_DATA')
        ).value;

        if (shouldDeleteInvalidData) {
          await DirectoryService.deleteInvalids();
          await AnimeService.deleteInvalids();
          await EpisodeService.deleteInvalids();
          await SubtitleService.deleteInvalids();
        }

        const directories = await DirectoryService.list();

        await AnimeService.createFromDirectories(directories);
        console.log('Animes updated!');

        const animes = await AnimeService.list();
        await EpisodeService.createFromAnimes(animes);
        console.log('Episodes updated!');

        const episodes = await EpisodeService.list();
        await SubtitleService.createFromEpisodes(episodes);
        console.log('Subtitles updated!');

        await EpisodePreviewService.createFromEpisodes(episodes);
        console.log('Episode previews updated!');

        const shouldDeleteConvertedData = await (
          await SettingsService.getByNameOrThrow('DELETE_CONVERTED_DATA')
        ).value;

        if (shouldDeleteConvertedData) {
          await EpisodeService.deleteConverted();
          await SubtitleService.deleteConverted();
          console.log('Converted episodes deleted!');
        }

        this.updateStatus('UPDATED');
      }

      const endTime = Date.now();
      console.log(`Library update elapsed time: ${endTime - startTime} ms`);
    } catch (error) {
      this.updateStatus('FAILED');
      console.log(error);
    }
  }

  static getStatus() {
    return LibraryService.status;
  }

  static updateStatus(status: LibraryStatus) {
    LibraryService.status = status;
    libraryEventEmitter.emit('UPDATE_STATUS', status);
  }
}

export default LibraryService;
