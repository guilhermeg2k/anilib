import { z } from 'zod';
import { createRouter, procedure } from '../trpc';
import SettingsService from '@backend/service/settingsService';

const zSetting = z.enum([
  'isToDeleteConvertedData',
  'isToDeleteInvalidData',
  'shouldUseNVENC',
]);

export const settingsRouter = createRouter({
  get: procedure
    .input(
      z.object({
        setting: zSetting,
      })
    )
    .query(({ input }) => {
      const { setting } = input;
      return SettingsService.get(setting);
    }),

  update: procedure
    .input(
      z.object({
        setting: zSetting,
        value: z.boolean(),
      })
    )
    .mutation(({ input }) => {
      const { setting, value } = input;
      return SettingsService.set(setting, value);
    }),
});
