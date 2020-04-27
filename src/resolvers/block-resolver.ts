import { OperationResultStatusEnum, OpKind } from '@taquito/rpc';
import { flatten, isArray } from 'lodash';
import { container } from 'tsyringe';
import { TezosService } from '../services/tezos-service';
import {
    ActivateAccount,
    BalanceUpdateKind,
    Ballot,
    BallotVote,
    Block,
    Constants,
    Contract,
    Delegate,
    Delegation,
    DoubleBakingEvidence,
    DoubleEndorsementEvidence,
    Endorsement,
    OperationContents,
    OperationEntry,
    Origination,
    Proposals,
    Reveal,
    Transaction,
} from '../types/types';
import { convertResponse, convertResponseOrNull } from './utils';

interface OperationArguments {
    address?: string;
    ballot?: BallotVote;
    delegate?: string;
    destination?: string;
    hash?: string;
    originatedContract?: string;
    proposal?: string;
    source?: string;
    status?: OperationResultStatusEnum;
}

const tezosService = container.resolve(TezosService);

export const blockResolver = {
    Block: {
        activations: (root: Block, args: OperationArguments) => filterActivations(root.operations[2], OpKind.ACTIVATION, args),
        ballots: (root: Block, args: OperationArguments) => filterBallots(root.operations[1], OpKind.BALLOT, args),
        delegations: (root: Block, args: OperationArguments) => filterDelegations(root.operations[3], OpKind.DELEGATION, args),
        doubleBakingEvidence: (root: Block, args: OperationArguments) => filterDoubleBakings(root.operations[2], OpKind.DOUBLE_BAKING_EVIDENCE, args),
        doubleEndorsementEvidence: (root: Block, args: OperationArguments) =>
            filterDoubleEndorsements(root.operations[2], OpKind.DOUBLE_ENDORSEMENT_EVIDENCE, args),
        endorsements: (root: Block, args: OperationArguments) => filterEndorsements(root.operations[0], OpKind.ENDORSEMENT, args),
        originations: (root: Block, args: OperationArguments) => filterOriginations(root.operations[3], OpKind.ORIGINATION, args),
        proposals: (root: Block, args: OperationArguments) => filterProposals(root.operations[1], OpKind.PROPOSALS, args),
        reveals: (root: Block, args: OperationArguments) => filterReveals(root.operations[3], OpKind.REVEAL, args),
        seedNonceRevelations: (root: Block, args: OperationArguments) => filterOperations(root.operations[1], OpKind.SEED_NONCE_REVELATION, args),
        transactions: (root: Block, args: OperationArguments) => filterTransactions(root.operations[3], OpKind.TRANSACTION, args),
        operation: (root: Block, args: { hash: string }) => {
            // find the operation with given hash
            for (let ops of root.operations) {
                for (let op of ops) {
                    if (op.hash == args.hash) {
                        return op;
                    }
                }
            }
            return null;
        },
        operations: (root: Block) => {
            return root.operations.map(opsArray => opsArray.map(extendOperation));
        },
        delegate: async (root: Block, args: { address: string }): Promise<Delegate | null> => {
            const result = convertResponseOrNull<Delegate>(await tezosService.client.getDelegates(args.address, { block: root.hash }));
            if (result != null) {
                return {
                    ...result,
                    blockHash: root.hash,
                    address: args.address,
                };
            }
            return null;
        },
        contract: async (root: Block, args: { address: string }): Promise<Contract | null> => {
            const result = convertResponseOrNull<Contract>(
                await TezosService.handleNotFound(() => tezosService.client.getContract(args.address, { block: root.hash }))
            );
            if (result != null) {
                return {
                    ...result,
                    blockHash: root.hash,
                    address: args.address,
                };
            }
            return null;
        },
        constants: async (root: Block): Promise<Constants> => {
            // can't use taquito here, bcs they do not have a support for Carthaganet constants
            // const result = await tezosRpcService.client.getConstants({ block: root.hash }));
            const result = await tezosService.axios.get(`/chains/main/blocks/${root.hash}/context/constants`);
            let constants = result.data;

            // Carthaganet breaking change fix
            constants.endorsement_reward = isArray(constants.endorsement_reward) ? constants.endorsement_reward : [constants.endorsement_reward];

            return convertResponse<Constants>(constants);
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
        filteredOps = filteredOps.filter(o => (<ActivateAccount>o).pkh == args.address);
    }
    return filteredOps;
}

function filterBallots(operations: OperationEntry[], opKind: OpKind, args: OperationArguments): OperationContents[] {
    let filteredOps = filterOperations(operations, opKind, args);
    if (args?.source) {
        filteredOps = filteredOps.filter(o => (<Ballot>o).source == args.source);
    }
    if (args?.proposal) {
        filteredOps = filteredOps.filter(o => (<Ballot>o).proposal == args.proposal);
    }
    if (args?.ballot) {
        filteredOps = filteredOps.filter(o => (<Ballot>o).ballot == args.ballot);
    }
    return filteredOps;
}

function filterDelegations(operations: OperationEntry[], opKind: OpKind, args: OperationArguments): OperationContents[] {
    let filteredOps = filterOperations(operations, opKind, args);
    if (args?.source) {
        filteredOps = filteredOps.filter(o => (<Delegation>o).source == args.source);
    }
    if (args?.delegate) {
        filteredOps = filteredOps.filter(o => (<Delegation>o).delegate == args.delegate);
    }
    if (args?.status) {
        filteredOps = filteredOps.filter(o => (<Delegation>o).metadata.operationResult.status == args.status);
    }
    return filteredOps;
}

function filterDoubleBakings(operations: OperationEntry[], opKind: OpKind, args: OperationArguments): OperationContents[] {
    let filteredOps = filterOperations(operations, opKind, args);
    if (args?.delegate) {
        filteredOps = filteredOps.filter(
            o => (<DoubleBakingEvidence>o).metadata.balanceUpdates.find(bu => bu.kind == BalanceUpdateKind.FREEZER)?.delegate == args.delegate
        );
    }
    return filteredOps;
}

function filterDoubleEndorsements(operations: OperationEntry[], opKind: OpKind, args: OperationArguments): OperationContents[] {
    let filteredOps = filterOperations(operations, opKind, args);
    if (args?.delegate) {
        filteredOps = filteredOps.filter(
            o => (<DoubleEndorsementEvidence>o).metadata.balanceUpdates.find(bu => bu.kind == BalanceUpdateKind.FREEZER)?.delegate == args.delegate
        );
    }
    return filteredOps;
}

function filterEndorsements(operations: OperationEntry[], opKind: OpKind, args: OperationArguments): OperationContents[] {
    let filteredOps = filterOperations(operations, opKind, args);
    if (args?.delegate) {
        filteredOps = filteredOps.filter(o => (<Endorsement>o).metadata.delegate == args.delegate);
    }
    return filteredOps;
}

function filterOriginations(operations: OperationEntry[], opKind: OpKind, args: OperationArguments): OperationContents[] {
    let filteredOps = filterOperations(operations, opKind, args);
    if (args?.source) {
        filteredOps = filteredOps.filter(o => (<Origination>o).source == args.source);
    }
    if (args?.delegate) {
        filteredOps = filteredOps.filter(o => (<Origination>o).delegate == args.delegate);
    }
    if (args?.originatedContract) {
        filteredOps = filteredOps.filter(o => (<Origination>o).metadata.operationResult.originatedContracts?.some(oc => oc == args.originatedContract));
    }
    if (args?.status) {
        filteredOps = filteredOps.filter(o => (<Origination>o).metadata.operationResult.status == args.status);
    }
    return filteredOps;
}

function filterProposals(operations: OperationEntry[], opKind: OpKind, args: OperationArguments): OperationContents[] {
    let filteredOps = filterOperations(operations, opKind, args);
    if (args?.source) {
        filteredOps = filteredOps.filter(o => (<Proposals>o).source == args.source);
    }
    if (args?.proposal) {
        filteredOps = filteredOps.filter(o => (<Proposals>o).proposals?.some(p => p == args.proposal));
    }
    return filteredOps;
}

function filterReveals(operations: OperationEntry[], opKind: OpKind, args: OperationArguments): OperationContents[] {
    let filteredOps = filterOperations(operations, opKind, args);
    if (args?.source) {
        filteredOps = filteredOps.filter(o => (<Reveal>o).source == args.source);
    }
    if (args?.status) {
        filteredOps = filteredOps.filter(o => (<Reveal>o).metadata.operationResult.status == args.status);
    }
    return filteredOps;
}

function filterTransactions(operations: OperationEntry[], opKind: OpKind, args: OperationArguments): OperationContents[] {
    let filteredOps = filterOperations(operations, opKind, args);
    if (args?.source) {
        filteredOps = filteredOps.filter(o => (<Transaction>o).source == args.source);
    }
    if (args?.destination) {
        filteredOps = filteredOps.filter(o => (<Transaction>o).destination == args.destination);
    }
    if (args?.status) {
        filteredOps = filteredOps.filter(o => (<Transaction>o).metadata.operationResult.status == args.status);
    }
    return filteredOps;
}
