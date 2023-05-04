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

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const IS_DEV = NODE_ENV !== 'production';

const IP = process.env.NEXT_PUBLIC_IP ?? 'localhost';
const PORT = process.env.NEXT_PUBLIC_PORT
  ? parseInt(process.env.NEXT_PUBLIC_PORT, 10)
  : 3000;

const WS_DEV_PORT = process.env.NEXT_PUBLIC_WS_DEV_PORT
  ? parseInt(process.env.NEXT_PUBLIC_WS_DEV_PORT, 10)
  : 3001;

const HTTP_URL = `http://${IP}:${PORT}/api/trpc`;
const WS_URL = IS_DEV ? `ws://${IP}:${WS_DEV_PORT}` : `ws://${IP}:${PORT}`;

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
