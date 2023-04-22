import DirectoryRepository from 'backend/repository/directory';
import fs from 'fs';

class DirectoryService {
  static list() {
    return DirectoryRepository.list();
  }

  static create(directory: string) {
    return DirectoryRepository.create(directory);
  }

  static delete(path: string) {
    return DirectoryRepository.deleteByPath(path);
  }

  static async deleteInvalids() {
    const invalidDirectories = (await this.list()).filter(
      (directory) => !fs.existsSync(directory.path)
    );

    invalidDirectories.forEach((invalidDirectory) =>
      DirectoryRepository.deleteByPath(invalidDirectory.path)
    );
  }
}

export default DirectoryService;
