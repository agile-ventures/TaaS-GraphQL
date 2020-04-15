import 'reflect-metadata';

import { GraphQLDateTime } from 'graphql-iso-date';
import { IResolvers } from 'graphql-tools';
import GraphQLJSONObject from 'graphql-type-json';
import { merge } from 'lodash';

import { blockResolver } from './resolvers/block-resolver';
import { contractResolver } from './resolvers/contract-resolver';
import { delegateResolver } from './resolvers/delegate-resolver';
import { enumResolver } from './resolvers/enum-resolver';
import { internalOperationResultResolver } from './resolvers/internal-operation-result-resolver';
import { operationContentsResolver } from './resolvers/operation-contents-resolver';
import { operationResolver } from './resolvers/operation-resolver';
import { blockQueryResolver } from './resolvers/queries/blocks/block-query-resolver';
import { blocksQueryResolver } from './resolvers/queries/blocks/blocks-query-resolver';

const dateTimeResolver: IResolvers = {
    DateTime: GraphQLDateTime,
};

const jsonResolver: IResolvers = {
    JSON: GraphQLJSONObject,
};

const queries = merge(blockQueryResolver, blocksQueryResolver);
const typeResolvers = merge(dateTimeResolver, jsonResolver, operationContentsResolver, internalOperationResultResolver, enumResolver);
const schemaResolvers = merge(blockResolver, contractResolver, delegateResolver, operationResolver);
const resolvers = merge(queries, typeResolvers, schemaResolvers);

export default resolvers;
