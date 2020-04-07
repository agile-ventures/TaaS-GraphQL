import { TezosRpcService } from '../../../services/tezos-rpc-service';
import { container } from 'tsyringe';
import { convertResponse as responseToBlock } from './block-utils';
import { Block } from '../../../types/types';

const tezosRpcService = container.resolve(TezosRpcService);
export const blockQueryResolver = {
    Query: {
        async block(obj: any, args: { block: string }): Promise<Block> {
            let block: Block;
            if (args.block) {
                block = responseToBlock(await tezosRpcService.client.getBlock({ block: args.block }));
            }
            block = responseToBlock(await tezosRpcService.client.getBlock());

            return block;
        },
    },
};
