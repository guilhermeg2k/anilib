import fileSystem from 'fs';
import path from 'path';

const fs = fileSystem.promises;

class FileUtils {
  async listFilesInFolderByExtensions(
    folder: string,
    extensions: Array<string>
  ) {
    const folderDir = await fs.readdir(folder);

    const episodeFilesPromises = folderDir.map(async (file: string) => {
      const filePath = path.join(folder, file);
      const fileStats = await fs.stat(filePath);
      const isFile = fileStats.isFile();
      const isDir = fileStats.isDirectory();
      if (isFile) {
        const fileExt = path.extname(filePath);
        if (extensions.includes(fileExt)) {
          return filePath;
        }
      } else if (isDir) {
        return this.listFilesInFolderByExtensions(filePath, extensions);
      }
    });

    const episodeFiles = await Promise.all(episodeFilesPromises);
    const flattedEpisodeFiles = episodeFiles.flat(Infinity) as Array<string>;
    const notNullEpisodeFiles = flattedEpisodeFiles.filter((episode) =>
      Boolean(episode)
    );
    return notNullEpisodeFiles;
  }

  async getBase64(filePath: string) {
    const fileBase64 = await fs.readFile(filePath, { encoding: 'base64' });
    return fileBase64;
  }

  async getVttFilesBySearch(folder: string, search: string) {
    const vttFiles = await this.listFilesInFolderByExtensions(folder, ['.vtt']);
    const matchedVttFiles = vttFiles.filter((vvtFile) =>
      vvtFile.includes(search)
    );
    return matchedVttFiles;
  }
}

export default FileUtils;
