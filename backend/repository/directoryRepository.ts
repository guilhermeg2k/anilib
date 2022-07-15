import database from '@backend/database/';

class DirectoryRepository {
  list() {
    const directories = database.getDirectories();
    return directories;
  }

  get(directory: string) {
    const foundDirectory = database.getDirectory(directory);
    return foundDirectory;
  }

  async create(directory: string) {
    const newDirectory = await database.insertDirectory(directory);
    return newDirectory;
  }

  async delete(directory: string) {
    await database.deleteDirectory(String(directory));
  }

  async deleteInvalidDirectories() {
    await database.deleteInvalidDirectories();
  }
}

export default DirectoryRepository;
