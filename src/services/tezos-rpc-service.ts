import { RpcClient } from '@taquito/rpc';
import { singleton } from 'tsyringe';

@singleton()
export class TezosRpcService {
  client: RpcClient;
  constructor() {
    const provider = process.env.TEZOS_NODE;
    this.client = new RpcClient(provider);
  }
}