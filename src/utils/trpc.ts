import { AppRouter } from '@backend/api/routers';
import { WsRouter } from '@backend/websocket/routers';
import {
  Operation,
  createWSClient,
  httpBatchLink,
  loggerLink,
  splitLink,
  wsLink,
} from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import superjson from 'superjson';

const HTTP_URL =
  `${process.env.NEXT_PUBLIC_BASE_API_URL}/trpc` || 'localhost:3000/api/trpc';

const WS_URL =
  process.env.NEXT_PUBLIC_WEBSOCKET_CLIENT_ADDRESS || 'ws://localhost:3001';

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
    url: HTTP_URL,
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

const shouldUseWSLink = (operation: Operation) =>
  operation.path.startsWith('ws.');

const getSplitLink = () => {
  return splitLink({
    condition: shouldUseWSLink,
    true: getWSLink(),
    false: getHTTPBatchLink(),
  });
};

export const trpc = createTRPCNext<AppRouter & WsRouter>({
  config() {
    return {
      transformer: superjson,
      links: [getLoggerLink(), getSplitLink()],
      queryClientConfig: {
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      },
    };
  },
  ssr: false,
});

// import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
// export type RouterInputs = inferRouterInputs<AppRouter>;
// export type RouterOutputs = inferRouterOutputs<AppRouter>;
