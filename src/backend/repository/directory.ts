import { prisma } from '@backend/database/prisma';
import AnimeRepository from './anime';

class DirectoryRepository {
  static list() {
    return prisma.directory.findMany();
  }

  static create(path: string) {
    return prisma.directory.create({
      data: {
        path,
      },
    });
  }

  static async deleteByPath(path: string) {
    await prisma.directory.delete({
      where: {
        path,
      },
    });
    return AnimeRepository.deleteByDirectory(path);
  }
}

export default DirectoryRepository;
