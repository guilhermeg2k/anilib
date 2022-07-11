import database from '@backend/database/';

class DirectoryRepository {
  async list() {
    const directories = database.getDirectories();
    return directories;
  }

  async create(directory: string) {
    const newDirectory = await database.insertDirectory(directory);
    return newDirectory;
  }

  async delete(directory: string) {
    await database.deleteDirectory(String(directory));
  }
}

export default DirectoryRepository;
