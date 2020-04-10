import { Schema } from '@taquito/michelson-encoder';
import { ManagerKeyResponse as TaquitoManagerKeyResponse, ScriptResponse } from '@taquito/rpc';
import { Contract } from '@taquito/taquito/dist/types/contract/contract';
import { ApolloError } from 'apollo-server-express';
import { container } from 'tsyringe';

import { TezosService } from '../services/tezos-service';
import { ContractEntrypoint, ContractResponse, DelegateResponse, EntrypointPath, ManagerKeyResponse, StorageResponse } from '../types/types';

const tezosService = container.resolve(TezosService) as TezosService;

async function handleNotFound<T>(run: () => Promise<T>): Promise<T | null> {
    try {
        return await run();
    } catch (e) {
        if (e.status === 404) {
            return null;
        }
        throw e;
    }
}

export const contractResolver = {
    Contract: {
        async entrypoint(contract: ContractResponse): Promise<ContractEntrypoint | null> {
            const result = await handleNotFound(() => tezosService.client.getEntrypoints(contract.address, { block: contract.blockHash }));
            if (result != null) {
                return {
                    ...result,
                    unreachable: result.unreachable
                        ? {
                              ...result.unreachable,
                              path: result.unreachable.path.map(p => EntrypointPath[p]), //is there a better way to go from ('left' | 'right') to Enum?
                          }
                        : undefined,
                };
            }
            return null;
        },
        async manager_key(contract: ContractResponse): Promise<ManagerKeyResponse | null> {
            const result = await handleNotFound(() => tezosService.client.getManagerKey(contract.address, { block: contract.blockHash }));
            if (result != null) {
                return managerKeyIsString(result) ? { key: result } : { key: result.key, invalid: true };
            }
            return null;
        },
        async storage(contract: ContractResponse): Promise<StorageResponse | null> {
            const result = handleNotFound(() => tezosService.client.getStorage(contract.address, { block: contract.blockHash }));
            return result;
        },
        async storage_decoded(contract: ContractResponse): Promise<any> {
            const contractSchema = Schema.fromRPCResponse({ script: contract.script as ScriptResponse });
            return await tezosService.toolkit.contract.getStorage(contract.address, contractSchema);
        },
        schema(contract: ContractResponse): any {
            var schema = Schema.fromRPCResponse({ script: contract.script as ScriptResponse });
            return schema.ExtractSchema();
        },
        async big_map_value(contract: ContractResponse, args: { key: string }): Promise<any> {
            if (!args?.key) {
                throw new ApolloError('Parameter key is missing!');
            }
            // TODO why do we need to load this again. can we call the constructor on this with the contract object?
            // constructor(address: string, script: ScriptResponse, provider: ContractProvider, entrypoints: EntrypointsResponse);
            var taqContract = await tezosService.toolkit.contract.at(contract.address);
            return await taqContract.bigMap(args.key);
        },
        async delegate(contract: ContractResponse): Promise<DelegateResponse> {
            return handleNotFound(() => tezosService.client.getDelegate(contract.address, { block: contract.blockHash }));
        },
    },
};

function managerKeyIsString(value: TaquitoManagerKeyResponse): value is string {
    return typeof value === 'string';
}
