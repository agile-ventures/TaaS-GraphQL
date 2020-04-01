import { OpKind } from "@taquito/rpc";

import { Block, OperationContents, OperationContentsTransaction, OperationEntry } from "../types/types";
import { flatten } from "lodash";

export const blockResolver = {
    Block: {
        activations: (root: Block, args: { hash: string }) => filterOperations(root.operations[2], OpKind.ACTIVATION, args.hash),
        ballots: (root: Block, args: { hash: string }) => filterOperations(root.operations[1], OpKind.BALLOT, args.hash),
        delegations: (root: Block, args: { hash: string }) => filterOperations(root.operations[3], OpKind.DELEGATION, args.hash),
        double_baking_evidence: (root: Block, args: { hash: string }) => filterOperations(root.operations[2], OpKind.DOUBLE_BAKING_EVIDENCE, args.hash),
        double_endorsement_evidence: (root: Block, args: { hash: string }) => filterOperations(root.operations[2], OpKind.DOUBLE_ENDORSEMENT_EVIDENCE, args.hash),
        endorsements: (root: Block, args: { hash: string }) => filterOperations(root.operations[0], OpKind.ENDORSEMENT, args.hash),
        originations: (root: Block, args: { hash: string }) => filterOperations(root.operations[3], OpKind.ORIGINATION, args.hash),
        proposals: (root: Block, args: { hash: string }) => filterOperations(root.operations[1], OpKind.PROPOSALS, args.hash),
        reveals: (root: Block, args: { hash: string }) => filterOperations(root.operations[3], OpKind.REVEAL, args.hash),
        seed_nonce_revelations: (root: Block, args: { hash: string }) => filterOperations(root.operations[1], OpKind.SEED_NONCE_REVELATION, args.hash),
        transactions: (root: Block, args: { hash: string; source: string; destination: string }) => {
            let filtered = filterOperations(root.operations[3], OpKind.TRANSACTION, args.hash);
            if (args && args.source) {
                filtered = filtered.filter(o => (<OperationContentsTransaction>o).source == args.source);
            }
            if (args && args.destination) {
                filtered = filtered.filter(o => (<OperationContentsTransaction>o).destination == args.destination);
            }
            return filtered;
        },
        operations: (root: Block, args: { hash: string }) => {
            if (args && args.hash) {
                return root.operations.map(opsArray => opsArray.filter(o => o.hash == args.hash).map(extendOperation));
            }
            return root.operations.map(opsArray => opsArray.map(extendOperation));
        }
    }
};

function extendOperation(op: OperationEntry): OperationEntry {
    op.contents.forEach(c => (c.operation = op));
    return op;
}

function filterOperations(operations: OperationEntry[], opKind: OpKind, hash: string): OperationContents[] {
    operations = operations.map(extendOperation);
    const ops = flatten(operations.map(o => o.contents));
    return ops.filter(c => c.kind == opKind && (!hash || c.operation.hash == hash));
}
