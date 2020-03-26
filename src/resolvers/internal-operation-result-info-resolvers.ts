export const internalOperationResultTransactionResolver = {
    InternalOperationResultTransaction: {
        info(obj: any, args: any, context: any, info: any) {
            return {
                source: obj.source,
                nonce: obj.nonce,
                amount: obj.amount,
                destination: obj.destination,
                parameters: obj.parameters,
                public_key: obj.public_key,
                balance: obj.balance,
                delegate: obj.delegate,
                script: obj.script
            }
        }
    }
} 
