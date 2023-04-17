import { prisma } from '@backend/database/prisma';
import { isPathRelativeToDir } from '@common/utils/file';
import { Anime, Prisma } from '@prisma/client';
import EpisodeRepository from './episode';

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
    return await prisma.anime.findMany({
      include: ALL_ANIME_RELATIONS_INCLUDE,
    });
  }

  static getById(id: string) {
    return prisma.anime.findUniqueOrThrow({
      where: {
        id,
      },
      include: ALL_ANIME_RELATIONS_INCLUDE,
    });
  }

  static async listByPath(path: string) {
    return await prisma.anime.findFirstOrThrow({
      where: {
        folderPath: path,
      },
    });
  }

  static async create({
    anime,
    titles,
    format,
    status,
    season,
    genres,
    studios,
  }: {
    anime: Omit<Prisma.AnimeCreateInput, 'format' | 'status' | 'season'>;
    titles: Prisma.AnimeTitleCreateInput[];
    format: Prisma.AnimeFormatCreateInput;
    status: Prisma.AnimeStatusCreateInput;
    season: Prisma.SeasonCreateInput;
    genres: Prisma.GenreCreateInput[];
    studios: Prisma.StudioCreateInput[];
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

  static async update(anime: Anime) {
    return await prisma.anime.update({
      where: {
        id: anime.id,
      },
      data: anime,
    });
  }

  static async deleteById(id: string) {
    await EpisodeRepository.deleteByAnimeId(id);
    return await prisma.anime.delete({
      where: {
        id,
      },
    });
  }

  static async deleteByIDS(ids: string[]) {
    return await prisma.anime.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  static async deleteByDirectory(directory: string) {
    const animesToDelete = (await this.list()).filter((anime) =>
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
