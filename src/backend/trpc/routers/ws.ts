import { createRouter } from '@backend/trpc/trpc';
import { libraryRouter } from './ws/library';

export const wsRouter = createRouter({
  ws: createRouter({
    library: libraryRouter,
  }),
});

export type WsRouter = typeof wsRouter;
