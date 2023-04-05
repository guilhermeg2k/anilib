import { AppRouter } from '@backend/api/routers';
import { httpBatchLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import superjson from 'superjson';
// import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      transformer: superjson,
      links: [
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_BASE_API_URL}/trpc`,
          headers() {
            if (!ctx?.req?.headers) {
              return {};
            }
            const {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
              connection: _connection,
              ...headers
            } = ctx.req.headers;
            return headers;
          },
        }),
      ],
    };
  },

  ssr: true,
});

// export type RouterInputs = inferRouterInputs<AppRouter>;
// export type RouterOutputs = inferRouterOutputs<AppRouter>;
