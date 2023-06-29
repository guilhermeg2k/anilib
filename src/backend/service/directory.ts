import DirectoryRepository from 'backend/repository/directory';
import fs from 'fs';

class DirectoryService {
  static list() {
    return DirectoryRepository.list();
  }

  static create(path: string) {
    return DirectoryRepository.create(path);
  }

  static deleteByPath(path: string) {
    return DirectoryRepository.deleteByPath(path);
  }

  static async deleteInvalids() {
    const invalidDirectories = (await this.list()).filter(
      (directory) => !fs.existsSync(directory.path)
    );

    for await (const invalidDirectory of invalidDirectories) {
      await DirectoryRepository.deleteByPath(invalidDirectory.path);
    }
  }
}

export default DirectoryService;
