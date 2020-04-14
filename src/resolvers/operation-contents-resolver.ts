export const operationContentsResolver = {
    OperationContents: {
        __resolveType(obj: any, context: any, info: any) {
            switch (obj.kind) {
                case 'endorsement':
                    return 'Endorsement';
                case 'seed_nonce_revelation':
                    return 'SeedNonceRevelation';
                case 'double_endorsement_evidence':
                    return 'DoubleEndorsementEvidence';
                case 'double_baking_evidence':
                    return 'DoubleBakingEvidence';
                case 'activate_account':
                    return 'ActivateAccount';
                case 'proposals':
                    return 'Proposals';
                case 'ballot':
                    return 'Ballot';
                case 'reveal':
                    return 'Reveal';
                case 'transaction':
                    return 'Transaction';
                case 'delegation':
                    return 'Delegation';
                case 'origination':
                    return 'Origination';
                default:
                    return null;
            }
        },
    },
};
