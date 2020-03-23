import { BlockResponse } from '@taquito/rpc';
import { UserInputError } from 'apollo-server-express';
import { reverse } from 'lodash';
import { container } from 'tsyringe';

import { TezosRpcService } from '../../services/tezos-rpc-service';

const tezosRpcService = container.resolve(TezosRpcService);
export const blocksQueryResolver = {
    Query: {
        async blocks(obj: any, args: { from: number, to: number | null }, context: any): Promise<BlockResponse[]> {
            let firstBlock: BlockResponse;
            let blocks: BlockResponse[] = [];
            if (args.to) {
                // TODO should we automatically swap here?
                if (args.to < args.from) {
                    return [];
                }

                if (args.to - args.from > +process.env.MAX_BLOCKS!) {
                    throw new UserInputError(`Number of blocks has to be lower than ${process.env.MAX_BLOCKS!}.`);
                }

                firstBlock = await tezosRpcService.client.getBlock({ block: args.to.toString() });
            }
            else {
                firstBlock = await tezosRpcService.client.getBlock();
            }
            blocks.push(firstBlock);
            for (let level = firstBlock.metadata.level.level - 1; level >= args.from; level--) {
                blocks.push(await tezosRpcService.client.getBlock({ block: level.toString() }));
            }
            return reverse(blocks);
        }
    }
}