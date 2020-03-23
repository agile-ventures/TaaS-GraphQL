import { BlockResponse } from "@taquito/rpc";
import { TezosRpcService } from "../../services/tezos-rpc-service";
import { container } from 'tsyringe';

const tezosRpcService = container.resolve(TezosRpcService);
export const blockQueryResolver = {
    Query: {
        async block(obj: any, args: { block: string }, context: any): Promise<BlockResponse> {
            if (args.block) {
                return await tezosRpcService.client.getBlock({ block: args.block });
            }
            return await tezosRpcService.client.getBlock();
        }
    }
}
