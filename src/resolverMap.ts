import 'reflect-metadata';

import { GraphQLDateTime } from 'graphql-iso-date';
import { IResolvers } from 'graphql-tools';
import { merge } from 'lodash';

import { internalOperationResultResolver } from './resolvers/internal-operation-result-resolver';
import { internalOperationResultTransactionResolver } from './resolvers/internal-operation-result-info-resolvers';
import { michelsonV1ExpressionResolver } from './resolvers/michelson-v1-expression-resolver';
import { operationContentResolver } from './resolvers/operation-content-resolver';
import { blockQueryResolver } from './resolvers/queries/block-query-resolver';
import { blocksQueryResolver } from './resolvers/queries/blocks-query-resolver';
import { blockResolver } from './resolvers/block-resolver';

const dateTimeResolver: IResolvers = {
  Datetime: GraphQLDateTime
};
const queries = merge(blockQueryResolver, blocksQueryResolver);
const typeResolvers = merge(dateTimeResolver, operationContentResolver, michelsonV1ExpressionResolver, internalOperationResultResolver);
const schemaResolvers = merge(internalOperationResultTransactionResolver, blockResolver);
const resolvers = merge(queries, typeResolvers, schemaResolvers);
export default resolvers;
