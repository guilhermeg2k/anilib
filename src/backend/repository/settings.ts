import { prisma } from '@backend/database/prisma';
import { SettingName } from '@common/types/prisma';

class SettingsRepository {
  static list() {
    return prisma.updateLibrarySetting.findMany();
  }

  static getByNameOrThrow(name: SettingName) {
    return prisma.updateLibrarySetting.findUniqueOrThrow({
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
