import { httpRouter } from '@backend/trpc/routers/httpRouter';
import * as trpcNext from '@trpc/server/adapters/next';

export default trpcNext.createNextApiHandler({
  router: httpRouter,
  createContext: () => ({}),
});
