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
const SERVER_IP = process.env.NEXT_PUBLIC_SERVER_IP ?? 'localhost';
const SERVER_PORT = process.env.NEXT_PUBLIC_SERVER_PORT ?? 3000;

const HTTP_URL = `http://${SERVER_IP}:${SERVER_PORT}/api/trpc`;
const WS_URL = IS_DEV
  ? 'ws://localhost:3001'
  : `ws://${SERVER_IP}:${SERVER_PORT}`;

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
