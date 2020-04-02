import express from 'express';
import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import depthLimit from 'graphql-depth-limit';
import { createServer } from 'http';
import compression from 'compression';
import cors from 'cors';
import schema from './schema';
import dotenv from 'dotenv';
import 'reflect-metadata';

dotenv.config();
// TODO Check here that we have all mandatory configs in place from ENV

const app = express();
const config: ApolloServerExpressConfig = {
  schema,
  validationRules: [depthLimit(7)],
}

if (process.env.GRAPHQL_ENABLE_PLAYGROUND === 'true') { 
  config.playground = true;
}

if (process.env.GRAPHQL_ENABLE_INTROSPECTION === 'true') { 
  config.introspection = true;
}

const server = new ApolloServer(config);
app.use('*', cors());
app.use(compression());
server.applyMiddleware({ app, path: '/graphql' });
const httpServer = createServer(app);
httpServer.listen(
  { host: process.env.HOST, port: process.env.PORT },
  (): void => console.log(`\n🚀      GraphQL is now running on http://${process.env.HOST}:${process.env.PORT}/graphql`));