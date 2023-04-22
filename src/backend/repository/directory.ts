import { prisma } from '@backend/database/prisma';
import AnimeRepository from './anime';

class DirectoryRepository {
  static list() {
    return prisma.directory.findMany();
  }

  static create(directory: string) {
    return prisma.directory.create({
      data: {
        path: directory,
      },
    });
  }

  static async deleteByPath(path: string) {
    console.log(path);
    await prisma.directory.delete({
      where: {
        path,
      },
    });
    await AnimeRepository.deleteByDirectory(path);
  }
}

export default DirectoryRepository;
