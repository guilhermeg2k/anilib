import DirectoryRepository from '@backend/repository/directoryRepository';
import fs from 'fs';

const directoryRepository = new DirectoryRepository();

class DirectoryService {
  list() {
    const directories = directoryRepository.list();
    return directories;
  }

  get(directory: string) {
    const foundDirectory = directoryRepository.get(directory);
    return foundDirectory;
  }

  create(directory: string) {
    const newDirectory = directoryRepository.create(directory);
    return newDirectory;
  }

  delete(directory: string) {
    directoryRepository.delete(directory);
  }

  deleteInvalidDirectories() {
    const invalidDirectories = this.list().filter(
      (directory) => !fs.existsSync(directory)
    );

    invalidDirectories.forEach((invalidDirectory) =>
      directoryRepository.delete(invalidDirectory)
    );
  }
}

export default DirectoryService;
