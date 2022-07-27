import database from '@backend/database/';

class DirectoryRepository {
  list() {
    const directoriesList = new Array<string>();
    const directories = <Map<string, string>>database.list('directories');
    directories.forEach((directory) => directoriesList.push(directory));
    return directoriesList;
  }

  get(directory: string) {
    const foundDirectory = <string>database.get('directories', directory);
    return foundDirectory;
  }

  create(directory: string) {
    const newDirectory = database.insertOrUpdate(
      'directories',
      directory,
      directory
    );
    return newDirectory;
  }

  delete(directory: string) {
    database.delete('directories', directory);
  }
}

export default DirectoryRepository;
