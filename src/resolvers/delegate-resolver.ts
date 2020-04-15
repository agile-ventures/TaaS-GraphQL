import { ApolloError } from 'apollo-server-express';
import { container } from 'tsyringe';

import { TezosService } from '../services/tezos-service';
import { BakingRight, Delegate, EndorsingRight } from '../types/types';

const tezosService = container.resolve(TezosService) as TezosService;

export const delegateResolver = {
    Delegate: {
        baking_rights: async (root: Delegate, args: { level?: number[]; cycle?: number[]; max_priority?: number }): Promise<BakingRight[] | null> => {
            checkMaxPriority(args);
            checkMaxCycles(args);
            checkMaxLevels(args);
            return TezosService.handleNotFound(() => tezosService.client.getBakingRights({ ...args, delegate: root.address }, { block: root.block_hash }));
        },
        endorsing_rights: async (root: Delegate, args: { level?: number[]; cycle?: number[] }): Promise<EndorsingRight[] | null> => {
            checkMaxCycles(args);
            checkMaxLevels(args);
            return TezosService.handleNotFound(() => tezosService.client.getEndorsingRights({ ...args, delegate: root.address }, { block: root.block_hash }));
        },
    },
};

function checkMaxPriority(args: any) {
    const maxPriority = process.env.TEZOS_BAKING_RIGHTS_MAX_PRIORITY ? +process.env.TEZOS_BAKING_RIGHTS_MAX_PRIORITY : 5;
    if (!args.max_priority) {
        args.max_priority = maxPriority;
    }
    if (args.max_priority > maxPriority) {
        throw new ApolloError(
            `max_priority must be lower or equal to ${process.env.TEZOS_BAKING_RIGHTS_MAX_PRIORITY}. You can set this value in the ENV variable TEZOS_BAKING_RIGHTS_MAX_PRIORITY.`
        );
    }
}

function checkMaxCycles(args: any) {
    const maxCycles = process.env.TEZOS_RIGHTS_MAX_CYCLES ? +process.env.TEZOS_RIGHTS_MAX_CYCLES : 5;
    if (args.cycle?.length > maxCycles) {
        throw new ApolloError(`number of cycles must be lower or equal to ${maxCycles}. You can set this value in the ENV variable TEZOS_RIGHTS_MAX_CYCLES.`);
    }
}

function checkMaxLevels(args: any) {
    const maxLevels = process.env.TEZOS_RIGHTS_MAX_LEVELS ? +process.env.TEZOS_RIGHTS_MAX_LEVELS : 20480;
    if (args.level?.length > maxLevels) {
        throw new ApolloError(`number of levels must be lower or equal to ${maxLevels}. You can set this value in the ENV variable TEZOS_RIGHTS_MAX_LEVELS.`);
    }
}
