import { prisma } from '@backend/database/prisma';
//TODO: Change setting type
import { Setting } from '@common/types/database';

class SettingsRepository {
  static list() {
    return prisma.updateLibrarySetting.findMany();
  }

  static getByName(name: Setting) {
    return prisma.updateLibrarySetting.findUnique({
      where: {
        name,
      },
    });
  }

  static set(id: number, value: boolean) {
    return prisma.updateLibrarySetting.update({
      where: {
        id,
      },
      data: {
        value,
      },
    });
  }
}

export default SettingsRepository;
