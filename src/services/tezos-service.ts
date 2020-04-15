import { RpcClient } from '@taquito/rpc';
import { singleton } from 'tsyringe';
import { TezosToolkit, Tezos } from '@taquito/taquito';
import axios, { AxiosInstance } from 'axios';
@singleton()
export class TezosService {
    static async handleNotFound<T>(run: () => Promise<T>): Promise<T | null> {
        try {
            return await run();
        } catch (e) {
            if (e.status === 404) {
                return null;
            }
            throw e;
        }
    }
    client: RpcClient;
    toolkit: TezosToolkit;
    axios: AxiosInstance;
    constructor() {
        const provider = process.env.TEZOS_NODE;
        this.client = new RpcClient(provider);
        Tezos.setRpcProvider(provider);
        this.toolkit = Tezos;
        this.axios = axios.create({ baseURL: provider });
    }
}
