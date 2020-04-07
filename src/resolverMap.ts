import 'reflect-metadata';

import { GraphQLDateTime } from 'graphql-iso-date';
import { IResolvers } from 'graphql-tools';
import GraphQLJSONObject from 'graphql-type-json';
import { merge } from 'lodash';

import { blockResolver } from './resolvers/block-resolver';
import { contractResolver } from './resolvers/contract-resolver';
import { enumResolver } from './resolvers/enum-resolver';
import { internalOperationResultTransactionResolver } from './resolvers/internal-operation-result-info-resolvers';
import { internalOperationResultResolver } from './resolvers/internal-operation-result-resolver';
import { michelsonV1ExpressionResolver } from './resolvers/michelson-v1-expression-resolver';
import { operationContentResolver } from './resolvers/operation-content-resolver';
import { blockQueryResolver } from './resolvers/queries/blocks/block-query-resolver';
import { blocksQueryResolver } from './resolvers/queries/blocks/blocks-query-resolver';
import { operationResolver } from './resolvers/operation-resolver';

const dateTimeResolver: IResolvers = {
    DateTime: GraphQLDateTime,
};

const jsonResolver: IResolvers = {
    JSON: GraphQLJSONObject,
};

const queries = merge(blockQueryResolver, blocksQueryResolver);
const typeResolvers = merge(dateTimeResolver, jsonResolver, operationContentResolver, michelsonV1ExpressionResolver, internalOperationResultResolver, enumResolver);
const schemaResolvers = merge(internalOperationResultTransactionResolver, blockResolver, contractResolver, operationResolver);
const resolvers = merge(queries, typeResolvers, schemaResolvers);

export default resolvers;
