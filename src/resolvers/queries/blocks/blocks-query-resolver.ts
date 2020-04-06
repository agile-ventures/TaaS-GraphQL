import { BlockResponse } from '@taquito/rpc';
import { UserInputError } from 'apollo-server-express';
import { reverse } from 'lodash';
import { container } from 'tsyringe';

import { TezosRpcService } from '../../../services/tezos-rpc-service';
import { Block } from '../../../types/types';
import { convertResponse } from './block-utils';

const tezosRpcService = container.resolve(TezosRpcService);
export const blocksQueryResolver = {
    Query: {
        async blocks(obj: any, args: { from: string; to: string | null }, context: any): Promise<Block[]> {
            function fetchBlock(block: string): Promise<BlockResponse> {
                return tezosRpcService.client.getBlock({ block });
            }

            async function getLevel(argument: string | null): Promise<[number, BlockResponse]> {
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
                    return [block.metadata.level.level + parsed, block];
                }
                return [parsed, await fetchBlock(argument)];
            }

            // let's save some calls by fetching the whole first and last blocks
            let [fromLevel, firstBlock] = await getLevel(args.from);
            let [toLevel, lastBlock] = await getLevel(args.to);

            if (toLevel - fromLevel > +process.env.MAX_BLOCKS!) {
                throw new UserInputError(`Number of blocks has to be lower than ${process.env.MAX_BLOCKS!}.`);
            }

            let blocks: Block[] = [convertResponse(firstBlock)];
            for (let level = fromLevel + 1; level < toLevel; level++) {
                blocks.push(convertResponse(await tezosRpcService.client.getBlock({ block: level.toString() })));
            }
            blocks.push(convertResponse(lastBlock));
            return blocks;
        },
    },
};
