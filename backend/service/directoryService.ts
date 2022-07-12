import DirectoryRepository from '@backend/repository/directoryRepository';

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

  async create(directory: string) {
    const newDirectory = await directoryRepository.create(directory);
    return newDirectory;
  }

  async delete(directory: string) {
    await directoryRepository.delete(directory);
  }
}

export default DirectoryService;
