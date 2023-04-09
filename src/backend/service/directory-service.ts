import DirectoryRepository from 'backend/repository/directory-repository';
import fs from 'fs';

class DirectoryService {
  static list() {
    const directories = DirectoryRepository.list();
    return directories;
  }

  static get(directory: string) {
    const foundDirectory = DirectoryRepository.get(directory);
    return foundDirectory;
  }

  static create(directory: string) {
    const newDirectory = DirectoryRepository.create(directory);
    return newDirectory;
  }

  static delete(directory: string) {
    DirectoryRepository.delete(directory);
  }

  static deleteInvalids() {
    const invalidDirectories = this.list().filter(
      (directory) => !fs.existsSync(directory)
    );

    invalidDirectories.forEach((invalidDirectory) =>
      DirectoryRepository.delete(invalidDirectory)
    );
  }
}

export default DirectoryService;
