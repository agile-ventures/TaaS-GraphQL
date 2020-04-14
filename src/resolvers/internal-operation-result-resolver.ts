import { OpKind } from '@taquito/taquito';

export const internalOperationResultResolver = {
    OperationResult: {
        __resolveType(obj: any) {
            switch (obj.kind as OpKind) {
                case OpKind.REVEAL:
                    return 'RevealOperationResult';
                case OpKind.TRANSACTION:
                    return 'TransactionOperationResult';
                case OpKind.ORIGINATION:
                    return 'OriginationOperationResult';
                case OpKind.DELEGATION:
                    return 'DelegationOperationResult';
                default:
                    return null;
            }
        },
    },

    InternalOperationResult: {
        result(obj: any) {
            return {
                ...obj.result,
                kind: obj.kind,
            };
        },
    },
};
