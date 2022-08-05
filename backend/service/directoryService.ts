import DirectoryRepository from '@backend/repository/directoryRepository';
import fs from 'fs';

class DirectoryService {
  list() {
    const directories = DirectoryRepository.list();
    return directories;
  }

  get(directory: string) {
    const foundDirectory = DirectoryRepository.get(directory);
    return foundDirectory;
  }

  create(directory: string) {
    const newDirectory = DirectoryRepository.create(directory);
    return newDirectory;
  }

  delete(directory: string) {
    DirectoryRepository.delete(directory);
  }

  deleteInvalidDirectories() {
    const invalidDirectories = this.list().filter(
      (directory) => !fs.existsSync(directory)
    );

    invalidDirectories.forEach((invalidDirectory) =>
      DirectoryRepository.delete(invalidDirectory)
    );
  }
}

export default DirectoryService;
