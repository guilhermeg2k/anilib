import { prisma } from '@backend/database/prisma';
import { Episode } from '@prisma/client';

class EpisodeRepository {
  static list() {
    return prisma.episode.findMany();
  }

  static listByAnimeId(animeID: string) {
    return prisma.episode.findMany({
      where: {
        animeID,
      },
    });
  }

  static listConvertedEpisodes() {
    return prisma.episode.findMany({
      where: {
        wasConverted: true,
      },
    });
  }

  static getById(id: string) {
    return prisma.episode.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  static getByFilePath(path: string) {
    return prisma.episode.findUnique({
      where: {
        filePath: path,
      },
    });
  }

  static getByOriginalFilePath(path: string) {
    return prisma.episode.findUnique({
      where: {
        originalFilePath: path,
      },
    });
  }

  static async create(
    episode: Omit<Episode, 'id' | 'createdAt' | 'updatedAt'>
  ) {
    await prisma.episode.create({
      data: episode,
    });
  }

  static deleteById(id: string) {
    return prisma.episode.delete({
      where: {
        id,
      },
    });
  }

  static deleteByAnimeId(animeId: string) {
    return prisma.episode.deleteMany({
      where: {
        animeID: animeId,
      },
    });
  }
}

export default EpisodeRepository;
