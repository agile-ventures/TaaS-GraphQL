import { OpKind } from '@taquito/taquito';

export const internalOperationResultResolver = {
    InternalOperationResult: {
        __resolveType(obj: any, context: any, info: any) {
            switch (obj.kind as OpKind) {
                case OpKind.REVEAL:
                    return "InternalOperationResultReveal";
                case OpKind.TRANSACTION:
                    return "InternalOperationResultTransaction";
                case OpKind.ORIGINATION:
                    return "InternalOperationResultOrigination";
                case OpKind.DELEGATION:
                    return "InternalOperationResultDelegation";
                default:
                    return null;
            }
        }
    },

    OperationResult: {
        __resolveType(obj: any, parent: any) {
            switch (parent.kind as OpKind) {
                case OpKind.REVEAL:
                    return "OperationResultReveal";
                case OpKind.TRANSACTION:
                    return "OperationResultTransaction";
                case OpKind.ORIGINATION:
                    return "OperationResultOrigination";
                case OpKind.DELEGATION:
                    return "OperationResultDelegation";
                default:
                    return null;
            }
        }
    }
}
