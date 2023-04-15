import { HttpRouter } from '@backend/trpc/routers/http';
import { WsRouter } from '@backend/trpc/routers/ws';
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

const IS_DEV = process.env.NODE_ENV !== 'production';

const HTTP_URL = IS_DEV
  ? 'http://localhost:3000/api/trpc'
  : `${process.env.NEXT_PUBLIC_BASE_API_URL}/trpc` ??
    'http://localhost:3000/api/trpc';

const WS_URL = IS_DEV
  ? 'ws://localhost:3001'
  : process.env.NEXT_PUBLIC_WEBSOCKET_CLIENT_ADDRESS ?? 'ws://localhost:3000';

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

export const trpc = createTRPCNext<HttpRouter & WsRouter>({
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
