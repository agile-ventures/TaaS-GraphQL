import { BlockResponse, OperationEntry, OpKind } from '@taquito/rpc';
import { cloneDeep } from 'lodash';

export const blockResolver = {
    Block: {
        activations: async (root: BlockResponse) => filterOperations(root.operations[2], OpKind.ACTIVATION),
        ballots: async (root: BlockResponse) => filterOperations(root.operations[1], OpKind.BALLOT),
        delegations: async (root: BlockResponse) => filterOperations(root.operations[3], OpKind.DELEGATION),
        double_baking_evidence: async (root: BlockResponse) => filterOperations(root.operations[2], OpKind.DOUBLE_BAKING_EVIDENCE),
        double_endorsement_evidence: async (root: BlockResponse) => filterOperations(root.operations[2], OpKind.DOUBLE_ENDORSEMENT_EVIDENCE),
        endorsements: async (root: BlockResponse) => filterOperations(root.operations[0], OpKind.ENDORSEMENT),
        originations: async (root: BlockResponse) => filterOperations(root.operations[3], OpKind.ORIGINATION),
        proposals: async (root: BlockResponse) => filterOperations(root.operations[1], OpKind.PROPOSALS),
        reveals: async (root: BlockResponse) => filterOperations(root.operations[3], OpKind.REVEAL),
        seed_nonce_revelations: async (root: BlockResponse) => filterOperations(root.operations[1], OpKind.SEED_NONCE_REVELATION),
        transactions: async (root: BlockResponse) => filterOperations(root.operations[3], OpKind.TRANSACTION),
        operations: async (root: BlockResponse, args: { kind: OpKind }) => {
            if (args && args.kind) {
                let filtered = root.operations.map(ops => filterOperations(ops, args.kind));
                return filtered;
            }
            return root.operations;
        }
    }
} 

async function filterOperations(operations: OperationEntry[], opKind: OpKind) {
    let filteredOperations = cloneDeep(operations.filter(r => r.contents.some(op => op.kind == opKind)));
    filteredOperations = filteredOperations.map(o => {
        o.contents = o.contents.filter(c => c.kind == opKind)
        return o;
    });
    return filteredOperations;
}