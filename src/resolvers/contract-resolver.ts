import { Schema } from '@taquito/michelson-encoder';
import { ManagerKeyResponse as TaquitoManagerKeyResponse, ScriptResponse } from '@taquito/rpc';
import { ApolloError } from 'apollo-server-express';
import { container } from 'tsyringe';

import { TezosService } from '../services/tezos-service';
import { ContractEntrypoint, Contract, EntrypointPath, ManagerKey, MichelsonExpression } from '../types/types';

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
        async entrypoint(contract: Contract): Promise<ContractEntrypoint | null> {
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
        async manager_key(contract: Contract): Promise<ManagerKey | null> {
            const result = await handleNotFound(() => tezosService.client.getManagerKey(contract.address, { block: contract.blockHash }));
            if (result != null) {
                return managerKeyIsString(result) ? { key: result } : { key: result.key, invalid: true };
            }
            return null;
        },
        storage(contract: Contract): Promise<MichelsonExpression | null> {
            return handleNotFound(() => tezosService.client.getStorage(contract.address, { block: contract.blockHash }));
        },
        async storage_decoded(contract: Contract): Promise<any> {
            const contractSchema = Schema.fromRPCResponse({ script: contract.script as ScriptResponse });
            let storage = await tezosService.client.getStorage(contract.address, { block: contract.blockHash });
            return contractSchema.Execute(storage);
        },
        schema(contract: Contract): any {
            var schema = Schema.fromRPCResponse({ script: contract.script as ScriptResponse });
            return schema.ExtractSchema();
        },
        async big_map_value(contract: Contract, args: { key: string }): Promise<any> {
            if (!args?.key) {
                throw new ApolloError('Parameter key is missing!');
            }
            var taqContract = await tezosService.toolkit.contract.at(contract.address);
            return await taqContract.bigMap(args.key);
        },
        delegate(contract: Contract): Promise<string | null> {
            return handleNotFound(() => tezosService.client.getDelegate(contract.address, { block: contract.blockHash }));
        },
    },
};

function managerKeyIsString(value: TaquitoManagerKeyResponse): value is string {
    return typeof value === 'string';
}
