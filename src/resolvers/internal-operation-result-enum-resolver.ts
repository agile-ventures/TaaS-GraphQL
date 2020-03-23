import { OpKind } from '@taquito/taquito';

export const internalOperationResultEnumResolver = {
    InternalOperationResultEnum: {
        __resolveType(obj: any, context: any, info: any) {
            // TODO this doesn't work as info.rootValue is undefined
            debugger;
            switch (info.rootValue.kind as OpKind) {
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
