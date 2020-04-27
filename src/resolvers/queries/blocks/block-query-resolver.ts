import { TezosService } from '../../../services/tezos-service';
import { container } from 'tsyringe';
import { convertResponseOrNull } from '../../utils';
import { Block } from '../../../types/types';

const tezosRpcService = container.resolve(TezosService);

export const blockQueryResolver = {
    Query: {
        async block(obj: any, args: { block: string | null }): Promise<Block | null> {
            return convertResponseOrNull(await TezosService.handleNotFound(() => tezosRpcService.client.getBlock({ block: args.block || 'head' })));
        },
    },
};
