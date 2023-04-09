import { httpRouter } from '@backend/trpc/routers/http';
import * as trpcNext from '@trpc/server/adapters/next';

export default trpcNext.createNextApiHandler({
  router: httpRouter,
  createContext: () => ({}),
});
