import { prisma } from '@backend/database/prisma';
import { EpisodeInput } from '@common/types/database';

class EpisodeRepository {
  static list() {
    return prisma.episode.findMany();
  }

  static listByAnimeId(animeId: string) {
    return prisma.episode.findMany({
      where: {
        animeId,
      },
    });
  }

  static listConverted() {
    return prisma.episode.findMany({
      where: {
        NOT: {
          originalFilePath: null,
        },
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

  static getByIdWithSubtitles(id: string) {
    return prisma.episode.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        subtitles: true,
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

  static async create(episode: EpisodeInput) {
    return prisma.episode.create({
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
        animeId,
      },
    });
  }
}

export default EpisodeRepository;
