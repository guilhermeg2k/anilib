import database from 'backend/database';
import AnimeRepository from './anime-repository';

class DirectoryRepository {
  static list() {
    const directoriesList = new Array<string>();
    const directories = <Map<string, string>>database.list('directories');
    directories.forEach((directory) => directoriesList.push(directory));
    return directoriesList;
  }

  static get(directory: string) {
    const foundDirectory = <string>database.get('directories', directory);
    return foundDirectory;
  }

  static create(directory: string) {
    const newDirectory = database.insertOrUpdate(
      'directories',
      directory,
      directory
    );
    return newDirectory;
  }

  static delete(directory: string) {
    database.delete('directories', directory);
    AnimeRepository.deleteByDirectory(directory);
  }
}

export default DirectoryRepository;
