import { BlockResponse, OpKind, OperationEntry } from "@taquito/rpc";
import { cloneDeep } from "lodash";

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
        activations(obj: BlockResponse, args: any, context: any, info: any) {
            return filterOperations(obj.operations[2], OpKind.ACTIVATION)
        },
        ballots(obj: BlockResponse, args: any, context: any, info: any) {
            return filterOperations(obj.operations[1], OpKind.BALLOT)
        },
        delegations(obj: BlockResponse, args: any, context: any, info: any) {
            return filterOperations(obj.operations[3], OpKind.DELEGATION)
        },
        double_baking_evidence(obj: BlockResponse, args: any, context: any, info: any) {
            return filterOperations(obj.operations[2], OpKind.DOUBLE_BAKING_EVIDENCE)
        },
        double_endorsement_evidence(obj: BlockResponse, args: any, context: any, info: any) {
            return filterOperations(obj.operations[2], OpKind.DOUBLE_ENDORSEMENT_EVIDENCE)
        },
        endorsements(obj: BlockResponse, args: any, context: any, info: any) {
            return filterOperations(obj.operations[0], OpKind.ENDORSEMENT)
        },
        originations(obj: BlockResponse, args: any, context: any, info: any) {
            return filterOperations(obj.operations[3], OpKind.ORIGINATION)
        },
        proposals(obj: BlockResponse, args: any, context: any, info: any) {
            return filterOperations(obj.operations[1], OpKind.PROPOSALS)
        },
        reveals(obj: BlockResponse, args: any, context: any, info: any) {
            return filterOperations(obj.operations[3], OpKind.REVEAL);
        },
        seed_nonce_revelations(obj: BlockResponse, args: any, context: any, info: any) {
            return filterOperations(obj.operations[1], OpKind.SEED_NONCE_REVELATION)
        },
        transactions(obj: BlockResponse, args: any, context: any, info: any) {
            return filterOperations(obj.operations[3], OpKind.TRANSACTION)
        }
    }
} 
