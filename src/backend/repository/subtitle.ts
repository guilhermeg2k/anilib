import { prisma } from '@backend/database/prisma';
import { SubtitleInput, SubtitleLanguageInput } from '@common/types/database';

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

  static listConverted() {
    return prisma.subtitle.findMany({
      where: {
        NOT: {
          originalFilePath: null,
        },
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

  static create(subtitle: SubtitleInput, language: SubtitleLanguageInput) {
    return prisma.subtitle.create({
      data: {
        filePath: subtitle.filePath,
        originalFilePath: subtitle.originalFilePath,
        episode: {
          connect: {
            id: subtitle.episodeId,
          },
        },
        language: {
          connectOrCreate: {
            where: {
              code_name: language,
            },
            create: language,
          },
        },
      },
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
