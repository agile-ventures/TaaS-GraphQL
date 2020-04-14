import express from 'express';
import { ApolloServer, ApolloServerExpressConfig, AuthenticationError } from 'apollo-server-express';
import depthLimit from 'graphql-depth-limit';
import { createServer } from 'http';
import compression from 'compression';
import cors from 'cors';

import dotenv from 'dotenv';
import 'reflect-metadata';
import { ExpressContext, ServerRegistration } from 'apollo-server-express/dist/ApolloServer';

dotenv.config();
// TODO Check here that we have all mandatory configs in place from ENV

// NOTE: this is here for a purpose (we need to call dotenv first)
import schema from './schema';
import { container } from 'tsyringe';
import { TezosService } from './services/tezos-service';

const app = express();
const config: ApolloServerExpressConfig = {
    schema,
    validationRules: [depthLimit(7)],
};

if (process.env.GRAPHQL_ENABLE_PLAYGROUND === 'true') {
    config.playground = true;
}

if (process.env.GRAPHQL_ENABLE_INTROSPECTION === 'true') {
    config.introspection = true;
}

if (process.env.ENABLE_API_KEY === 'true' && process.env.API_KEY) {
    config.context = (ctx: ExpressContext) => {
        if (ctx.req.header('X-TaaS-Key') !== process.env.API_KEY) {
            throw new AuthenticationError('Provided X-TaaS-Key header value is wrong or empty!');
        }
    };
}

const middlewareConfig = { app, path: '/graphql' } as ServerRegistration;
if (process.env.ENABLE_TEZOS_NODE_HEALTHCHECK === 'true') {
    const tezosService = container.resolve(TezosService) as TezosService;
    middlewareConfig.onHealthCheck = () => {
        return tezosService.client.getConstants();
    };
}

const server = new ApolloServer(config);
app.use('*', cors());
app.use(compression());
server.applyMiddleware(middlewareConfig);

const httpServer = createServer(app);
httpServer.listen({ host: process.env.HOST, port: process.env.PORT }, (): void =>
    console.log(`\n🚀      GraphQL is now running on http://${process.env.HOST}:${process.env.PORT}/graphql`)
);
