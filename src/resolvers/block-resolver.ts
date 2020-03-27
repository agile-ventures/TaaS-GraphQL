import { BlockResponse, OpKind, OperationEntry } from "@taquito/rpc";
import { cloneDeep, flatten } from "lodash";

var async = require("async");

var filterOperations = (operations: OperationEntry[], opKind: OpKind) => {
    let filteredOperations = cloneDeep(operations.filter(r => r.contents.some(op => op.kind == opKind)));
    filteredOperations = filteredOperations.map(o => {
        o.contents = o.contents.filter(c => c.kind == opKind)
        return o;
    });
    return filteredOperations;
}

export const blockResolver = {
    Block: {
        activations(root: BlockResponse) {
            return filterOperations(root.operations[2], OpKind.ACTIVATION)
        },
        ballots(root: BlockResponse) {
            return filterOperations(root.operations[1], OpKind.BALLOT)
        },
        delegations(root: BlockResponse) {
            return filterOperations(root.operations[3], OpKind.DELEGATION)
        },
        double_baking_evidence(root: BlockResponse) {
            return filterOperations(root.operations[2], OpKind.DOUBLE_BAKING_EVIDENCE)
        },
        double_endorsement_evidence(root: BlockResponse) {
            return filterOperations(root.operations[2], OpKind.DOUBLE_ENDORSEMENT_EVIDENCE)
        },
        endorsements(root: BlockResponse) {
            return filterOperations(root.operations[0], OpKind.ENDORSEMENT)
        },
        originations(root: BlockResponse) {
            return filterOperations(root.operations[3], OpKind.ORIGINATION)
        },
        proposals(root: BlockResponse) {
            return filterOperations(root.operations[1], OpKind.PROPOSALS)
        },
        reveals(root: BlockResponse) {
            return filterOperations(root.operations[3], OpKind.REVEAL);
        },
        seed_nonce_revelations(root: BlockResponse) {
            return filterOperations(root.operations[1], OpKind.SEED_NONCE_REVELATION)
        },
        transactions(root: BlockResponse) {
            return filterOperations(root.operations[3], OpKind.TRANSACTION)
        },
        async operations(root: BlockResponse, args: { kind: OpKind }) {
            if (args && args.kind) {
                let filtered = root.operations.map(ops => filterOperations(ops, args.kind));
                return filtered;
            }
            return root.operations;
        }
    }
} 
