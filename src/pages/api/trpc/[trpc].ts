import { appRouter } from '@backend/api/routers';
import * as trpcNext from '@trpc/server/adapters/next';

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => ({}),
});
