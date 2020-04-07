import { OperationResultStatusEnum, OpKind } from '@taquito/rpc';
import { flatten } from 'lodash';
import { container } from 'tsyringe';

import { TezosRpcService } from '../services/tezos-rpc-service';
import {
    BalanceUpdateKind,
    Ballot,
    Block,
    OperationContents,
    OperationContentsActivateAccount,
    OperationContentsBallot,
    OperationContentsDelegation,
    OperationContentsDoubleBaking,
    OperationContentsDoubleEndorsement,
    OperationContentsEndorsement,
    OperationContentsOrigination,
    OperationContentsProposals,
    OperationContentsReveal,
    OperationContentsTransaction,
    OperationEntry,
    ContractResponse,
    DelegatesResponse,
} from '../types/types';

interface OperationArguments {
    address?: string;
    ballot?: Ballot;
    delegate?: string;
    destination?: string;
    hash?: string;
    originated_contract?: string;
    proposal?: string;
    source?: string;
    status?: OperationResultStatusEnum;
}

const tezosRpcService = container.resolve(TezosRpcService);

export const blockResolver = {
    Block: {
        activations: (root: Block, args: OperationArguments) => filterActivations(root.operations[2], OpKind.ACTIVATION, args),
        ballots: (root: Block, args: OperationArguments) => filterBallots(root.operations[1], OpKind.BALLOT, args),
        delegations: (root: Block, args: OperationArguments) => filterDelegations(root.operations[3], OpKind.DELEGATION, args),
        double_baking_evidence: (root: Block, args: OperationArguments) => filterDoubleBakings(root.operations[2], OpKind.DOUBLE_BAKING_EVIDENCE, args),
        double_endorsement_evidence: (root: Block, args: OperationArguments) => filterDoubleEndorsements(root.operations[2], OpKind.DOUBLE_ENDORSEMENT_EVIDENCE, args),
        endorsements: (root: Block, args: OperationArguments) => filterEndorsements(root.operations[0], OpKind.ENDORSEMENT, args),
        originations: (root: Block, args: OperationArguments) => filterOriginations(root.operations[3], OpKind.ORIGINATION, args),
        proposals: (root: Block, args: OperationArguments) => filterProposals(root.operations[1], OpKind.PROPOSALS, args),
        reveals: (root: Block, args: OperationArguments) => filterReveals(root.operations[3], OpKind.REVEAL, args),
        seed_nonce_revelations: (root: Block, args: OperationArguments) => filterOperations(root.operations[1], OpKind.SEED_NONCE_REVELATION, args),
        transactions: (root: Block, args: OperationArguments) => filterTransactions(root.operations[3], OpKind.TRANSACTION, args),
        operations: (root: Block, args: OperationArguments) => {
            if (args?.hash) {
                return root.operations.map(opsArray => opsArray.filter(o => o.hash == args.hash).map(extendOperation));
            }
            return root.operations.map(opsArray => opsArray.map(extendOperation));
        },
        delegate: async (root: Block, args: { address: string }): Promise<DelegatesResponse> => {
            const result = await tezosRpcService.client.getDelegates(args.address, { block: root.hash });
            return result;
        },
        contract: async (root: Block, args: { address: string }): Promise<ContractResponse> => {
            const result = await tezosRpcService.client.getContract(args.address, { block: root.hash });

            return {
                ...result,
                blockHash: root.hash,
                address: args.address,
            };
        },
    },
};

function extendOperation(op: OperationEntry): OperationEntry {
    op.contents.forEach(c => (c.operation = op));
    return op;
}

function filterOperations(operations: OperationEntry[], opKind: OpKind, args: OperationArguments): OperationContents[] {
    operations = operations.map(extendOperation);
    const ops = flatten(operations.map(o => o.contents));
    return ops.filter(c => c.kind == opKind && (!args.hash || c.operation.hash == args.hash));
}

function filterActivations(operations: OperationEntry[], opKind: OpKind, args: OperationArguments): OperationContents[] {
    let filteredOps = filterOperations(operations, opKind, args);
    if (args?.address) {
        filteredOps = filteredOps.filter(o => (<OperationContentsActivateAccount>o).pkh == args.address);
    }
    return filteredOps;
}

function filterBallots(operations: OperationEntry[], opKind: OpKind, args: OperationArguments): OperationContents[] {
    let filteredOps = filterOperations(operations, opKind, args);
    if (args?.source) {
        filteredOps = filteredOps.filter(o => (<OperationContentsBallot>o).source == args.source);
    }
    if (args?.proposal) {
        filteredOps = filteredOps.filter(o => (<OperationContentsBallot>o).proposal == args.proposal);
    }
    if (args?.ballot) {
        filteredOps = filteredOps.filter(o => (<OperationContentsBallot>o).ballot == args.ballot);
    }
    return filteredOps;
}

function filterDelegations(operations: OperationEntry[], opKind: OpKind, args: OperationArguments): OperationContents[] {
    let filteredOps = filterOperations(operations, opKind, args);
    if (args?.source) {
        filteredOps = filteredOps.filter(o => (<OperationContentsDelegation>o).source == args.source);
    }
    if (args?.delegate) {
        filteredOps = filteredOps.filter(o => (<OperationContentsDelegation>o).delegate == args.delegate);
    }
    if (args?.status) {
        filteredOps = filteredOps.filter(o => (<OperationContentsDelegation>o).metadata.operation_result.status == args.status);
    }
    return filteredOps;
}

function filterDoubleBakings(operations: OperationEntry[], opKind: OpKind, args: OperationArguments): OperationContents[] {
    let filteredOps = filterOperations(operations, opKind, args);
    if (args?.delegate) {
        filteredOps = filteredOps.filter(
            o => (<OperationContentsDoubleBaking>o).metadata.balance_updates.find(bu => bu.kind == BalanceUpdateKind.FREEZER)?.delegate == args.delegate
        );
    }
    return filteredOps;
}

function filterDoubleEndorsements(operations: OperationEntry[], opKind: OpKind, args: OperationArguments): OperationContents[] {
    let filteredOps = filterOperations(operations, opKind, args);
    if (args?.delegate) {
        filteredOps = filteredOps.filter(
            o => (<OperationContentsDoubleEndorsement>o).metadata.balance_updates.find(bu => bu.kind == BalanceUpdateKind.FREEZER)?.delegate == args.delegate
        );
    }
    return filteredOps;
}

function filterEndorsements(operations: OperationEntry[], opKind: OpKind, args: OperationArguments): OperationContents[] {
    let filteredOps = filterOperations(operations, opKind, args);
    if (args?.delegate) {
        filteredOps = filteredOps.filter(o => (<OperationContentsEndorsement>o).metadata.delegate == args.delegate);
    }
    return filteredOps;
}

function filterOriginations(operations: OperationEntry[], opKind: OpKind, args: OperationArguments): OperationContents[] {
    let filteredOps = filterOperations(operations, opKind, args);
    if (args?.source) {
        filteredOps = filteredOps.filter(o => (<OperationContentsOrigination>o).source == args.source);
    }
    if (args?.delegate) {
        filteredOps = filteredOps.filter(o => (<OperationContentsOrigination>o).delegate == args.delegate);
    }
    if (args?.originated_contract) {
        filteredOps = filteredOps.filter(o => (<OperationContentsOrigination>o).metadata.operation_result.originated_contracts?.some(oc => oc == args.originated_contract));
    }
    if (args?.status) {
        filteredOps = filteredOps.filter(o => (<OperationContentsOrigination>o).metadata.operation_result.status == args.status);
    }
    return filteredOps;
}

function filterProposals(operations: OperationEntry[], opKind: OpKind, args: OperationArguments): OperationContents[] {
    let filteredOps = filterOperations(operations, opKind, args);
    if (args?.source) {
        filteredOps = filteredOps.filter(o => (<OperationContentsProposals>o).source == args.source);
    }
    if (args?.proposal) {
        filteredOps = filteredOps.filter(o => (<OperationContentsProposals>o).proposals?.some(p => p == args.proposal));
    }
    return filteredOps;
}

function filterReveals(operations: OperationEntry[], opKind: OpKind, args: OperationArguments): OperationContents[] {
    let filteredOps = filterOperations(operations, opKind, args);
    if (args?.source) {
        filteredOps = filteredOps.filter(o => (<OperationContentsReveal>o).source == args.source);
    }
    if (args?.status) {
        filteredOps = filteredOps.filter(o => (<OperationContentsReveal>o).metadata.operation_result.status == args.status);
    }
    return filteredOps;
}

function filterTransactions(operations: OperationEntry[], opKind: OpKind, args: OperationArguments): OperationContents[] {
    let filteredOps = filterOperations(operations, opKind, args);
    if (args?.source) {
        filteredOps = filteredOps.filter(o => (<OperationContentsTransaction>o).source == args.source);
    }
    if (args?.destination) {
        filteredOps = filteredOps.filter(o => (<OperationContentsTransaction>o).destination == args.destination);
    }
    if (args?.status) {
        filteredOps = filteredOps.filter(o => (<OperationContentsTransaction>o).metadata.operation_result.status == args.status);
    }
    return filteredOps;
}
