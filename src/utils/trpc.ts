import { AppRouter } from '@backend/api/routers';
import { WsRouter } from '@backend/websocket/routers';
import {
  createWSClient,
  httpBatchLink,
  loggerLink,
  splitLink,
  wsLink,
} from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import superjson from 'superjson';

const WS_URL = 'ws://localhost:3002';

const queryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
};

const getLoggerLink = () => {
  return loggerLink({
    enabled: (opts) =>
      (process.env.NODE_ENV === 'development' &&
        typeof window !== 'undefined') ||
      (opts.direction === 'down' && opts.result instanceof Error),
  });
};

const getHTTPBatchLink = () => {
  return httpBatchLink({
    url: `${process.env.NEXT_PUBLIC_BASE_API_URL}/trpc`,
  });
};

const getWSLink = () => {
  if (typeof window === 'undefined') {
    return getHTTPBatchLink();
  }

  const client = createWSClient({
    url: WS_URL,
  });

  return wsLink<WsRouter>({
    client,
  });
};

const getSplitLink = () => {
  return splitLink({
    condition: (op) => op.path.startsWith('ws.'),
    true: getWSLink(),
    false: getHTTPBatchLink(),
  });
};

export const trpc = createTRPCNext<AppRouter & WsRouter>({
  config() {
    return {
      transformer: superjson,
      links: [getLoggerLink(), getSplitLink()],
      queryClientConfig,
    };
  },

  ssr: false,
});

// import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
// export type RouterInputs = inferRouterInputs<AppRouter>;
// export type RouterOutputs = inferRouterOutputs<AppRouter>;
