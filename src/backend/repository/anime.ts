import { prisma } from '@backend/database/prisma';
import {
  AnimeCreateInputWithoutRelations,
  AnimeFormatInput,
  AnimeStatusInput,
  AnimeTitleInput,
  AnimeUpdateInputWithoutRelations,
  GenreInput,
  SeasonInput,
  StudioInput,
} from '@common/types/prisma';
import { isPathRelativeToDir } from '@common/utils/file';

const ALL_ANIME_RELATIONS_INCLUDE = {
  season: true,
  genres: true,
  studios: true,
  titles: true,
  format: true,
  status: true,
  episodes: true,
};

class AnimeRepository {
  static async list() {
    return await prisma.anime.findMany();
  }

  static async listWithAllRelations() {
    return await prisma.anime.findMany({
      include: ALL_ANIME_RELATIONS_INCLUDE,
    });
  }

  static async listByPath(path: string) {
    return await prisma.anime.findFirst({
      where: {
        folderPath: path,
      },
    });
  }

  static getWithAllRelationsById(id: string) {
    return prisma.anime.findUniqueOrThrow({
      where: {
        id,
      },
      include: ALL_ANIME_RELATIONS_INCLUDE,
    });
  }

  static async createWithAllRelations({
    anime,
    titles,
    format,
    status,
    season,
    genres,
    studios,
  }: {
    anime: AnimeCreateInputWithoutRelations;
    titles: AnimeTitleInput[];
    format: AnimeFormatInput;
    status: AnimeStatusInput;
    season: SeasonInput;
    genres: GenreInput[];
    studios: StudioInput[];
  }) {
    return await prisma.anime.create({
      data: {
        ...anime,
        titles: {
          create: titles,
        },
        format: {
          connectOrCreate: {
            where: {
              name: format.name,
            },
            create: format,
          },
        },
        status: {
          connectOrCreate: {
            where: {
              name: status.name,
            },
            create: status,
          },
        },
        season: {
          connectOrCreate: {
            where: {
              name_year: season,
            },
            create: season,
          },
        },
        genres: {
          connectOrCreate: genres.map((genre) => ({
            where: {
              name: genre.name,
            },
            create: genre,
          })),
        },
        studios: {
          connectOrCreate: studios.map((studio) => ({
            where: {
              anilistID: studio.anilistID,
            },
            create: studio,
          })),
        },
      },
    });
  }

  static async updateWithAllRelations({
    anime,
    format,
    status,
    season,
    genres,
    studios,
  }: {
    anime: AnimeUpdateInputWithoutRelations;
    format: AnimeFormatInput;
    status: AnimeStatusInput;
    season: SeasonInput;
    genres: GenreInput[];
    studios: StudioInput[];
  }) {
    return await prisma.anime.update({
      where: {
        id: anime.id,
      },
      data: {
        ...anime,
        format: {
          connectOrCreate: {
            where: {
              name: format.name,
            },
            create: format,
          },
        },
        status: {
          connectOrCreate: {
            where: {
              name: status.name,
            },
            create: status,
          },
        },
        season: {
          connectOrCreate: {
            where: {
              name_year: season,
            },
            create: season,
          },
        },
        genres: {
          connectOrCreate: genres.map((genre) => ({
            where: {
              name: genre.name,
            },
            create: genre,
          })),
        },
        studios: {
          connectOrCreate: studios.map((studio) => ({
            where: {
              anilistID: studio.anilistID,
            },
            create: studio,
          })),
        },
      },
    });
  }

  static async deleteById(id: string) {
    return await prisma.anime.delete({
      where: {
        id,
      },
    });
  }

  static async deleteByIds(ids: string[]) {
    return await prisma.anime.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  static async deleteByDirectory(directory: string) {
    const animesToDelete = (await this.listWithAllRelations()).filter((anime) =>
      isPathRelativeToDir(directory, anime.folderPath)
    );

    return await prisma.anime.deleteMany({
      where: {
        id: {
          in: animesToDelete.map((anime) => anime.id),
        },
      },
    });
  }
}

export default AnimeRepository;
