import BigNumber from 'bignumber.js';
import { GraphQLScalarType } from 'graphql';

function isPositiveNumber(value: any) {
    const x = new BigNumber(value);
    return x.isNaN() || x.isNegative() ? null : value;
}

export const mutezResolver = {
    Mutez: new GraphQLScalarType({
        name: 'Mutez',
        description: 'Micro tez. Positive bignumber. 1 tez = 1,000,000 micro tez.',
        parseValue: isPositiveNumber,
        serialize: isPositiveNumber,
        parseLiteral: isPositiveNumber,
    }),
};
