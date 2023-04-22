import { z } from 'zod';
import { createRouter, procedure } from '../../trpc';
import SettingsService from '@backend/service/settings';

//TODO:UPDATE THIS
const zSetting = z.enum([
  'isToDeleteConvertedData',
  'isToDeleteInvalidData',
  'shouldUseNVENC',
]);

export const settingsRouter = createRouter({
  list: procedure.query(() => {
    return SettingsService.list();
  }),

  get: procedure
    .input(
      z.object({
        setting: zSetting,
      })
    )
    .query(({ input }) => {
      const { setting } = input;
      return SettingsService.getByName(setting);
    }),

  update: procedure
    .input(
      z.object({
        id: z.number(),
        value: z.boolean(),
      })
    )
    .mutation(({ input }) => {
      const { id, value } = input;
      return SettingsService.set(id, value);
    }),
});
