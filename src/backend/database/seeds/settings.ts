import { prisma } from '../prisma';

//TODO: Move this from here
export type Setting = typeof SETTINGS[number]['name'];

const SETTINGS = [
  {
    name: 'DELETE_INVALID_DATA',
    value: true,
  },
  {
    name: 'DELETE_CONVERTED_DATA',
    value: false,
  },
  {
    name: 'USE_NVENC',
    value: false,
  },
] as const;

const seed = async () => {
  for await (const setting of SETTINGS) {
    await prisma.updateLibrarySetting.create({
      data: setting,
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
