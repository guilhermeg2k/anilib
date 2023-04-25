import SettingsService from '@backend/service/settings';
import { ZSettingName } from '@common/types/prisma';
import { z } from 'zod';
import { createRouter, procedure } from '../../trpc';

export const settingsRouter = createRouter({
  list: procedure.query(() => {
    return SettingsService.list();
  }),

  get: procedure
    .input(
      z.object({
        setting: ZSettingName,
      })
    )
    .query(({ input }) => {
      const { setting } = input;
      return SettingsService.getByNameOrThrow(setting);
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
