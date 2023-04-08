import { createRouter } from '@backend/api/trpc';
import { libraryRouter } from './library';

export const wsRouter = createRouter({
  ws: createRouter({
    library: libraryRouter,
  }),
});

export type WsRouter = typeof wsRouter;
