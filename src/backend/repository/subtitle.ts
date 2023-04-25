import { prisma } from '@backend/database/prisma';
import { SubtitleInput } from '@common/types/database';

class SubtitleRepository {
  static list() {
    return prisma.subtitle.findMany();
  }

  static listByEpisodeId(episodeId: string) {
    return prisma.subtitle.findMany({
      where: {
        episodeId,
      },
    });
  }

  static getById(id: string) {
    return prisma.subtitle.findUnique({
      where: {
        id,
      },
    });
  }

  static create(subtitle: SubtitleInput) {
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
      where: { episodeId },
    });
  }
}

export default SubtitleRepository;
