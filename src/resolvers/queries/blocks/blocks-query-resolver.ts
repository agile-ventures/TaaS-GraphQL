import { BlockResponse } from '@taquito/rpc';
import { UserInputError } from 'apollo-server-express';
import { container } from 'tsyringe';

import { TezosService } from '../../../services/tezos-service';
import { Block } from '../../../types/types';
import { convertResponse } from '../../utils';

const tezosRpcService = container.resolve(TezosService);

function fetchBlock(block: string | number): Promise<BlockResponse> {
    return tezosRpcService.client.getBlock({ block: block.toString() });
}

export const blocksQueryResolver = {
    Query: {
        async blocks(obj: any, args: { from: string | number | null; to: string | number | null; count: number | null }, context: any): Promise<Block[]> {
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
                firstBlock = await fetchBlock(args.from || '0');
                lastBlock = await fetchBlock(args.to || 'head');
                fromLevel = firstBlock.header.level;
                count = lastBlock.header.level - firstBlock.header.level + 1;
            } else {
                if (args.from != null) {
                    firstBlock = await fetchBlock(args.from || '0');
                    lastBlock = null;
                    fromLevel = firstBlock.header.level;
                    count = args.count;
                } else {
                    lastBlock = await fetchBlock(args.to || 'head');
                    firstBlock = null;
                    fromLevel = Math.max(0, lastBlock.header.level - args.count + 1);
                    count = lastBlock.header.level - fromLevel + 1;
                }
            }

            // handle corner cases first
            if (count <= 0) {
                return [];
            }
            if (count > +process.env.MAX_BLOCKS!) {
                throw new UserInputError(`Number of blocks has to be lower than ${process.env.MAX_BLOCKS!}.`);
            }

            let blocks: Block[] = [convertResponse<Block>(firstBlock || (await fetchBlock(fromLevel)))];
            for (let i = 1; i < count; i++) {
                if (i == count - 1 && lastBlock != null) {
                    // if we are at the last block and we have fetched it already...
                    blocks.push(convertResponse<Block>(lastBlock));
                } else {
                    // fetch the block
                    let block: BlockResponse;
                    try {
                        block = await fetchBlock(fromLevel + i);
                    } catch (e) {
                        if (e.status == 404) {
                            // we are at the end of the list
                            break;
                        }
                        throw e;
                    }
                    blocks.push(convertResponse<Block>(block));
                }
            }
            return blocks;
        },
    },
};
