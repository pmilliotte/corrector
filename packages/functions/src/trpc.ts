import { initTRPC } from '@trpc/server';
import { CreateAWSLambdaContextOptions } from '@trpc/server/adapters/aws-lambda';
import { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda';

import { getSession } from '@corrector/shared';

const t = initTRPC.create();

export const router = t.router;
export const mergeRouters = t.mergeRouters;

export const createContext = ({
  event,
}: CreateAWSLambdaContextOptions<APIGatewayProxyEventV2WithJWTAuthorizer>): {
  event: APIGatewayProxyEventV2WithJWTAuthorizer;
} => ({
  event,
}); // no context
type Context = Awaited<ReturnType<typeof createContext>>;

const t1 = initTRPC.context<Context>().create();
export const publicProcedure = t1.procedure;

export const authedProcedure = t1.procedure.use(opts =>
  opts.next({
    ctx: {
      session: getSession(opts.ctx.event.requestContext.authorizer.jwt.claims),
    },
  }),
);
