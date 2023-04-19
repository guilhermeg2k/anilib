import { prisma } from '@backend/database/prisma';
import { Subtitle } from '@prisma/client';

class SubtitleRepository {
  static list() {
    return prisma.subtitle.findMany();
  }

  static getById(id: string) {
    return prisma.subtitle.findUnique({
      where: {
        id,
      },
    });
  }

  static listByEpisodeId(episodeID: string) {
    return prisma.subtitle.findMany({
      where: {
        episodeID,
      },
    });
  }

  static create(subtitle: Omit<Subtitle, 'id' | 'createdAt' | 'updatedAt'>) {
    return prisma.subtitle.create({
      data: subtitle,
    });
  }

  static deleteById(id: string) {
    return prisma.subtitle.delete({
      where: { id },
    });
  }

  static deleteByEpisodeId(episodeId: string) {
    return prisma.subtitle.deleteMany({
      where: { episodeID: episodeId },
    });
  }
}

export default SubtitleRepository;
