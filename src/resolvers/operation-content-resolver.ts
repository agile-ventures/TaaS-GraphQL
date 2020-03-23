export const operationContentResolver = {
    OperationContent: {
        __resolveType(obj: any, context: any, info: any) {
            switch (obj.kind) {
                case "endorsement":
                    return "OperationContentsEndorsement";
                case "seed_nonce_revelation":
                    return "OperationContentsRevelation";
                case "double_endorsement_evidence":
                    return "OperationContentsDoubleEndorsement";
                case "double_baking_evidence":
                    return "OperationContentsDoubleBaking";
                case "activate_account":
                    return "OperationContentsActivateAccount";
                case "proposals":
                    return "OperationContentsProposals";
                case "ballot":
                    return "OperationContentsBallot";
                case "reveal":
                    return "OperationContentsReveal";
                case "transaction":
                    return "OperationContentsTransaction";
                case "delegation":
                    return "OperationContentsDelegation";
                case "origination":
                    return "OperationContentsOrigination";
                default:
                    return null;
            }
        }
    }
}
