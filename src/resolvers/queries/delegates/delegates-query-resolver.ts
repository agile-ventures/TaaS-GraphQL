import { container } from 'tsyringe';
import { TezosRpcService } from '../../../services/tezos-rpc-service';
import { DelegatesResponse } from '../../../types/types';

const tezosRpcService = container.resolve(TezosRpcService);
export const delegatesQueryResolver = {
    Query: {
        async delegate(obj: any, args: { address: string; block?: string }, context: any): Promise<DelegatesResponse> {
            const result = await tezosRpcService.client.getDelegates(args.address, { block: args.block || 'head' });
            return result;
        },
    },
};
