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

            // calculate the boundaries and potentially keep some fetched blocks for later
            let fromLevel: number;
            let count: number;
            let firstBlock: BlockResponse | null;
            let lastBlock: BlockResponse | null;
            if (args.count == null) {
                let toLevel: number;
                [fromLevel, firstBlock] = await getLevel(args.from);
                [toLevel, lastBlock] = await getLevel(args.to);
                count = toLevel - fromLevel + 1;
            } else {
                if (args.from != null) {
                    [fromLevel, firstBlock] = await getLevel(args.from);
                    lastBlock = null;
                    count = args.count;
                } else {
                    let toLevel: number;
                    [toLevel, lastBlock] = await getLevel(args.to);
                    fromLevel = Math.max(0, toLevel - args.count + 1);
                    firstBlock = null;
                    count = toLevel - fromLevel + 1;
                }
            }

            // handle corner cases first
            if (count <= 0) {
                return [];
            }
            if (count > +process.env.MAX_BLOCKS!) {
                throw new UserInputError(`Number of blocks has to be lower than ${process.env.MAX_BLOCKS!}.`);
            }

            let blocks: Block[] = [convertResponse(firstBlock || await fetchBlock(fromLevel.toString()))];
            for (let i = 1; i < count; i++) {
                if (i == count - 1 && lastBlock != null) {
                    // if we are at the last block and we have fetched it already...
                    blocks.push(convertResponse(lastBlock));
                } else {
                    // fetch the block
                    let block: BlockResponse;
                    try {
                        block = await fetchBlock((fromLevel + i).toString());
                    } catch (e) {
                        if (e.status == 404) {
                            // we are at the end of the list
                            break;
                        }
                        throw e;
                    }
                    blocks.push(convertResponse(block));    
                }
            }
            return blocks;
        },
    },
};
