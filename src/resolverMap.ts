import 'reflect-metadata';

import { GraphQLDateTime } from 'graphql-iso-date';
import { IResolvers } from 'graphql-tools';
import { merge } from 'lodash';

import { michelsonV1ExpressionResolver } from './resolvers/michelson-v1-expression-resolver';
import { operationContentResolver } from './resolvers/operation-content-resolver';
import { blockQueryResolver } from './resolvers/queries/block-resolver';
import { blocksQueryResolver } from './resolvers/queries/blocks-resolver';
import { internalOperationResultEnumResolver } from './resolvers/internal-operation-result-enum-resolver';

const dateTimeResolver: IResolvers = {
  Datetime: GraphQLDateTime
};
const queries = merge(blockQueryResolver, blocksQueryResolver);
const resolvers = merge(queries, dateTimeResolver, operationContentResolver, michelsonV1ExpressionResolver, internalOperationResultEnumResolver);
export default resolvers;
