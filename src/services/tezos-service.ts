import { RpcClient } from '@taquito/rpc';
import { singleton } from 'tsyringe';
import { TezosToolkit, Tezos } from '@taquito/taquito';

@singleton()
export class TezosService {
    client: RpcClient;
    toolkit: TezosToolkit;
    constructor() {
        const provider = process.env.TEZOS_NODE;
        this.client = new RpcClient(provider);
        Tezos.setRpcProvider(provider);
        this.toolkit = Tezos;
    }
}
