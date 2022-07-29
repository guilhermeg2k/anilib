import fs from 'fs';
import path from 'path';

const fsPromises = fs.promises;

class FileUtils {
  async listFilesInFolderByExtensions(
    folder: string,
    extensions: Array<string>
  ) {
    const folderExists = fs.existsSync(folder);
    if (folderExists) {
      const folderDir = await fsPromises.readdir(folder);

      const episodeFilesPromises = folderDir.map(async (file: string) => {
        const filePath = path.join(folder, file);
        const fileStats = await fsPromises.stat(filePath);
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
    return [];
  }

  async getBase64(filePath: string) {
    const fileExists = fs.existsSync(filePath);
    if (fileExists) {
      const fileBase64 = await fsPromises.readFile(filePath, {
        encoding: 'base64',
      });
      return fileBase64;
    }
    return null;
  }

  async getVttFilesBySearch(folder: string, search: string) {
    const vttFiles = await this.listFilesInFolderByExtensions(folder, ['.vtt']);
    const matchedVttFiles = vttFiles.filter((vvtFile) =>
      vvtFile.includes(search)
    );
    return matchedVttFiles;
  }

  isPathRelativeToDir(dir: string, relativePath: string) {
    const relative = path.relative(dir, relativePath);
    return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
  }
}

export default FileUtils;
