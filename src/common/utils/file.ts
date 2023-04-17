import fs from 'fs';
import path from 'path';
const fsPromises = fs.promises;
const { pipeline } = require('stream/promises');

export const getFilesInDirectoryByExtensions = async (
  folder: string,
  extensions: Array<string>
) => {
  const folderExists = fs.existsSync(folder);
  if (folderExists) {
    const directoryContents = await fsPromises.readdir(folder);

    const folderFilesPromises = directoryContents.map(async (file: string) => {
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
        return getFilesInDirectoryByExtensions(filePath, extensions);
      }
    });

    const directoryFiles = await Promise.all(folderFilesPromises);
    const flattedDirectoryFiles = directoryFiles.flat(
      Infinity
    ) as Array<string>;
    const notNullDirectoryFiles = flattedDirectoryFiles.filter((episode) =>
      Boolean(episode)
    );

    return notNullDirectoryFiles;
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
  const vttFiles = await getFilesInDirectoryByExtensions(folder, ['.vtt']);
  const matchedVttFiles = vttFiles.filter((vvtFile) =>
    vvtFile.includes(fileNamePrefix)
  );
  return matchedVttFiles;
};

export const isPathRelativeToDir = (dir: string, relativePath: string) => {
  const relative = path.relative(dir, relativePath);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
};

export const downloadFile = async (imageURL: string, destFilePath: string) => {
  const response = await fetch(imageURL);
  if (!response.ok) {
    throw new Error('DOWNLOAD_FILE_ERROR', {
      cause: {
        requestError: {
          status: response.status,
          statusText: response.statusText,
        },
      },
    });
  }
  const fileStream = fs.createWriteStream(destFilePath);
  await pipeline(response.body, fileStream);
  fileStream.close();
};
