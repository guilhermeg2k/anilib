import { prisma } from '../prisma';
import { SettingName } from '@common/types/prisma';

type Setting = {
  name: SettingName;
  defaultValue: boolean;
};

export const AVAILABLE_SETTINGS: Setting[] = [
  {
    name: 'DELETE_INVALID_DATA',
    defaultValue: true,
  },
  {
    name: 'DELETE_CONVERTED_DATA',
    defaultValue: false,
  },
  {
    name: 'USE_NVENC',
    defaultValue: false,
  },
];

const seed = async () => {
  for await (const setting of AVAILABLE_SETTINGS) {
    await prisma.updateLibrarySetting.create({
      data: {
        name: setting.name,
        value: setting.defaultValue,
      },
    });
  }
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
