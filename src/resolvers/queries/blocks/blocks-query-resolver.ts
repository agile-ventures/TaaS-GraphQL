import { BlockResponse } from '@taquito/rpc';
import { UserInputError } from 'apollo-server-express';
import { container } from 'tsyringe';

import { TezosRpcService } from '../../../services/tezos-rpc-service';
import { Block } from '../../../types/types';
import { convertResponse } from './block-utils';

const tezosRpcService = container.resolve(TezosRpcService);

function fetchBlock(block: string): Promise<BlockResponse> {
    return tezosRpcService.client.getBlock({ block });
}

// let's save some calls by saving the fetched blocks
async function getLevel(argument: string | null): Promise<[number, BlockResponse | null]> {
    if (argument == null) {
        var block = await fetchBlock('head');
        return [block.metadata.level.level, block];
    }

    let parsed = Number(argument);
    if (isNaN(parsed)) {
        // try fetching hash or head
        var block = await fetchBlock(argument);
        return [block.metadata.level.level, block];
    } else if (parsed < 0) {
        // relative to head
        var block = await fetchBlock('head');
        return [block.metadata.level.level + parsed, null];
    }
    return [parsed, await fetchBlock(argument)];
}

export const blocksQueryResolver = {
    Query: {
        async blocks(obj: any, args: { from: string | null; to: string | null, count: number | null }, context: any): Promise<Block[]> {
            if (args.from == null && args.to == null && args.count == null) {
                throw new UserInputError(`Neither "from", "to" or "count" argument specified`);
            }
            if (args.from != null && args.to != null && args.count != null) {
                throw new UserInputError(`You cannot limit your query from both ends ("from" and "to") and by maximum count at the same time`);
            }
            if (args.count != null && args.count <= 0) {
                throw new UserInputError(`The "count" argument has to be greater than 0`);
            }

            let fromLevel: number, toLevel: number;
            let firstBlock: BlockResponse | null, lastBlock: BlockResponse | null;
            if (args.count == null) {
                [fromLevel, firstBlock] = await getLevel(args.from);
                [toLevel, lastBlock] = await getLevel(args.to);
            } else {
                if (args.from != null) {
                    [fromLevel, firstBlock] = await getLevel(args.from);
                    [toLevel, lastBlock] = await getLevel((fromLevel + args.count - 1).toString());
                } else {
                    [toLevel, lastBlock] = await getLevel(args.to);
                    [fromLevel, firstBlock] = await getLevel((toLevel - args.count + 1).toString());
                }
            }

            if (toLevel - fromLevel + 1 > +process.env.MAX_BLOCKS!) {
                throw new UserInputError(`Number of blocks has to be lower than ${process.env.MAX_BLOCKS!}.`);
            }

            let blocks: Block[] = [convertResponse(firstBlock || await fetchBlock(fromLevel.toString()))];
            for (let level = fromLevel + 1; level < toLevel; level++) {
                blocks.push(convertResponse(await fetchBlock(level.toString())));
            }
            blocks.push(convertResponse(lastBlock || await fetchBlock(toLevel.toString())));
            return blocks;
        },
    },
};
