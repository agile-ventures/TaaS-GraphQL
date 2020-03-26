import 'reflect-metadata';

import { GraphQLDateTime } from 'graphql-iso-date';
import { IResolvers } from 'graphql-tools';
import { merge } from 'lodash';

import { internalOperationResultResolver } from './resolvers/internal-operation-result-resolver';
import { internalOperationResultTransactionResolver } from './resolvers/internal-operation-result-info-resolvers';
import { michelsonV1ExpressionResolver } from './resolvers/michelson-v1-expression-resolver';
import { operationContentResolver } from './resolvers/operation-content-resolver';
import { blockQueryResolver } from './resolvers/queries/block-resolver';
import { blocksQueryResolver } from './resolvers/queries/blocks-resolver';

const dateTimeResolver: IResolvers = {
  Datetime: GraphQLDateTime
};
const queries = merge(blockQueryResolver, blocksQueryResolver);
const resolvers = merge(queries, dateTimeResolver, operationContentResolver, michelsonV1ExpressionResolver, internalOperationResultResolver, internalOperationResultTransactionResolver);
export default resolvers;
