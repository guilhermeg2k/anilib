import { prisma } from '@backend/database/prisma';
import {
  AnimeCreateInput,
  AnimeTitleCreateInput,
  GenreCreateInput,
  SeasonCreteInput,
  StudioCreateInput,
} from '@common/types/database';
import { isPathRelativeToDir } from '@common/utils/file';
import { Anime } from '@prisma/client';
import EpisodeRepository from './episode';

class AnimeRepository {
  static async list() {
    return await prisma.anime.findMany({
      include: {
        season: true,
        genres: true,
        studios: true,
        titles: true,
      },
    });
  }

  static getById(id: string) {
    return prisma.anime.findUnique({
      where: {
        id,
      },
      include: {
        season: true,
        genres: true,
        studios: true,
        titles: true,
      },
    });
  }

  static async listByPath(path: string) {
    return await prisma.anime.findFirst({
      where: {
        folderPath: path,
      },
    });
  }

  static async create(
    anime: AnimeCreateInput,
    titles: AnimeTitleCreateInput[],
    studios: StudioCreateInput[],
    genres: GenreCreateInput[],
    season: SeasonCreteInput
  ) {
    return await prisma.anime.create({
      data: {
        ...anime,
        titles: {
          create: titles,
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
