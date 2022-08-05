import fs from 'fs';
import path from 'path';

const fsPromises = fs.promises;

export const getFilesInFolderByExtensions = async (
  folder: string,
  extensions: Array<string>
) => {
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
        return getFilesInFolderByExtensions(filePath, extensions);
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
};

export const getFileInBase64 = async (filePath: string) => {
  const fileExists = fs.existsSync(filePath);
  if (fileExists) {
    const fileBase64 = await fsPromises.readFile(filePath, {
      encoding: 'base64',
    });
    return fileBase64;
  }
  return null;
};

export const getFolderVttFilesByFileNamePrefix = async (
  folder: string,
  fileNamePrefix: string
) => {
  const vttFiles = await getFilesInFolderByExtensions(folder, ['.vtt']);
  const matchedVttFiles = vttFiles.filter((vvtFile) =>
    vvtFile.includes(fileNamePrefix)
  );
  return matchedVttFiles;
};

export const isPathRelativeToDir = (dir: string, relativePath: string) => {
  const relative = path.relative(dir, relativePath);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
};
