import { ApolloError } from 'apollo-server-express';
import { GraphQLScalarType, Kind, ValueNode } from 'graphql';

var bs58check = require('bs58check');

export const base58Resolvers = {
    Address: new GraphQLScalarType({
        name: 'Address',
        description: 'Address identifier (Base58Check-encoded) prefixed with tz1 (ed25519), tz2 (secp256k1), tz3 (p256) or KT1.',
        parseValue: validateAddress,
        serialize: validateAddress,
        parseLiteral: (ast: any) => validateAddress(ast.value),
    }),
    BlockHash: new GraphQLScalarType({
        name: 'BlockHash',
        description: 'Block identifier (Base58Check-encoded) prefixed with B.',
        parseValue: validateBlockHash,
        serialize: validateBlockHash,
        parseLiteral: validateBlockHash,
    }),
    ContextHash: new GraphQLScalarType({
        name: 'ContextHash',
        description: 'ContextHash identifier (Base58Check-encoded) prefixed with Co.',
        parseValue: validateContextHash,
        serialize: validateContextHash,
        parseLiteral: validateContextHash,
    }),
    ChainId: new GraphQLScalarType({
        name: 'ChainId',
        description: 'Chain identifier (Base58Check-encoded) prefixed with Net.',
        parseValue: validateChainId,
        serialize: validateChainId,
        parseLiteral: validateChainId,
    }),
    NonceHash: new GraphQLScalarType({
        name: 'NonceHash',
        description: 'Nonce hash (Base58Check-encoded).',
        parseValue: validatenonceHash,
        serialize: validatenonceHash,
        parseLiteral: validatenonceHash,
    }),
    OperationHash: new GraphQLScalarType({
        name: 'OperationHash',
        description: 'Operation identifier (Base58Check-encoded) prefixed with o.',
        parseValue: validateOperationHash,
        serialize: validateOperationHash,
        parseLiteral: validateOperationHash,
    }),
    OperationsHash: new GraphQLScalarType({
        name: 'OperationsHash',
        description: 'OperationsHash identifier (Base58Check-encoded) prefixed with LLo.',
        parseValue: validateOperationsHash,
        serialize: validateOperationsHash,
        parseLiteral: validateOperationsHash,
    }),
    ProtocolHash: new GraphQLScalarType({
        name: 'ProtocolHash',
        description: 'Protocol identifier (Base58Check-encoded) prefixed with P.',
        parseValue: validateProtocolHash,
        serialize: validateProtocolHash,
        parseLiteral: validateProtocolHash,
    }),
    PublicKey: new GraphQLScalarType({
        name: 'PublicKey',
        description: 'Public key (Base58Check-encoded) prefixed with edpk, sppk or p2pk.',
        parseValue: validatePublicKey,
        serialize: validatePublicKey,
        parseLiteral: validatePublicKey,
    }),
    Signature: new GraphQLScalarType({
        name: 'Signature',
        description: 'Generic signature (Base58Check-encoded) prefixed with sig.',
        parseValue: validateSignature,
        serialize: validateSignature,
        parseLiteral: validateSignature,
    }),
    BlockIdentifier: new GraphQLScalarType({
        name: 'BlockIdentifier',
        description: 'BlockIdentifier',
        parseValue: val => val,
        serialize: validateProtocolHash,
        parseLiteral: validateBlockIdentifier,
    }),
};

function validate58Hash(hash: string) {
    try {
        bs58check.decode(hash);
    } catch {
        throw new ApolloError(`Invalid base58 hash: ${hash}`);
    }
}

function hasPrefixAndLength(value: any, prefix: string, length: number) {
    return value.startsWith(prefix) && value.length === length;
}

function validateAddress(value: any) {
    //  Order of the prefixes is based on their relative quantity in the Tezos network (tz1 are most widely used)
    const isValid =
        hasPrefixAndLength(value, 'tz1', 36) ||
        hasPrefixAndLength(value, 'KT1', 36) ||
        hasPrefixAndLength(value, 'tz3', 36) ||
        hasPrefixAndLength(value, 'tz2', 36);
    validate58Hash(value);
    if (!isValid) throw new ApolloError('Wrong Address');
    return value;
}

function validateContextHash(value: any) {
    if (!hasPrefixAndLength(value, 'Co', 52)) throw new ApolloError('Wrong ContextHash');
    validate58Hash(value);
    return value;
}

function validateChainId(value: any) {
    if (!hasPrefixAndLength(value, 'Net', 15)) throw new ApolloError('Wrong ChainId');
    validate58Hash(value);
    return value;
}

function validateBlockHash(value: any) {
    if (!hasPrefixAndLength(value, 'B', 51)) throw new ApolloError('Wrong BlockHash');
    validate58Hash(value);
    return value;
}

function validatenonceHash(value: any) {
    validate58Hash(value);
    return value;
}

function validateOperationHash(value: any) {
    if (!hasPrefixAndLength(value, 'o', 51)) throw new ApolloError('Wrong OperationHash');
    validate58Hash(value);
    return value;
}

function validateOperationsHash(value: any) {
    if (!hasPrefixAndLength(value, 'LLo', 53)) throw new ApolloError('Wrong OperationsHash');
    validate58Hash(value);
    return value;
}

function validateProtocolHash(value: any) {
    if (!hasPrefixAndLength(value, 'P', 51)) throw new ApolloError('Wrong ProtocolHash');
    validate58Hash(value);
    return value;
}

function validatePublicKey(value: any) {
    //  Order of the prefixes is based on their relative quantity in the Tezos network (ed25519 is the most used)
    const isValid = hasPrefixAndLength(value, 'edpk', 54) || hasPrefixAndLength(value, 'p2pk', 55) || hasPrefixAndLength(value, 'sppk', 55);
    validate58Hash(value);
    if (!isValid) throw new ApolloError('Wrong Public Key');
    return value;
}

function validateSignature(value: any) {
    if (!hasPrefixAndLength(value, 'sig', 96)) throw new ApolloError('Wrong Signature');
    validate58Hash(value);
    return value;
}

function isBlockRelativeIdentifier(value: any) {
    return /^head(?:~\d+)?$/.test(value);
}

function validateBlockIdentifier(ast: ValueNode) {
    switch (ast.kind) {
        case Kind.INT:
            const level = parseInt(ast.value);
            return isNaN(level) || level < 0 ? null : level;
        case Kind.STRING:
            if (hasPrefixAndLength(ast.value, 'B', 51)) {
                validate58Hash(ast.value);
            } else if (!isBlockRelativeIdentifier(ast.value)) {
                throw new ApolloError('Wrong BlockIdentifier');
            }
            return ast.value;
        default:
            return null;
    }
}
