import { Schema } from '@taquito/michelson-encoder';
import { ManagerKeyResponse as TaquitoManagerKeyResponse, PackDataParams, ScriptResponse } from '@taquito/rpc';
import { b58cencode, b58decode, hex2buf } from '@taquito/utils';
import { ApolloError } from 'apollo-server-express';
import { container } from 'tsyringe';

import { TezosService } from '../services/tezos-service';
import { BigMapKeyType, Contract, EntrypointPath, Entrypoints, ManagerKey, MichelsonExpression } from '../types/types';

const blake = require('blakejs');
const tezosService = container.resolve(TezosService) as TezosService;

export const contractResolver = {
    Contract: {
        async entrypoints(contract: Contract): Promise<Entrypoints | null> {
            const result = await TezosService.handleNotFound(() => tezosService.client.getEntrypoints(contract.address, { block: contract.blockHash }));
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
            const result = await TezosService.handleNotFound(() => tezosService.client.getManagerKey(contract.address, { block: contract.blockHash }));
            if (result != null) {
                return managerKeyIsString(result) ? { key: result } : { key: result.key, invalid: true };
            }
            return null;
        },
        storage(contract: Contract): Promise<MichelsonExpression | null> {
            return TezosService.handleNotFound(() => tezosService.client.getStorage(contract.address, { block: contract.blockHash }));
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
        async big_map_value(contract: Contract, args: { key: any; keyType?: BigMapKeyType; bigMapId?: number }): Promise<any> {
            if (args.bigMapId) {
                // query using RPC with map ID
                if (!args.keyType) {
                    throw new ApolloError('Parameter key_type has to be present when fetching big map of given ID');
                }

                const encodedExpr = await getBigMapKeyHash(args);
                return await TezosService.handleNotFound(() =>
                    tezosService.client.getBigMapExpr(args.bigMapId!.toString(), encodedExpr, { block: contract.blockHash })
                );
            } else {
                // query using deprecated big map RPC
                const contractSchema = Schema.fromRPCResponse({ script: contract.script as ScriptResponse });
                const encodedKey = contractSchema.EncodeBigMapKey(args.key);
                return TezosService.handleNotFound(() => tezosService.client.getBigMapKey(contract.address, encodedKey, { block: contract.blockHash }));
            }
        },
        async big_map_value_decoded(contract: Contract, args: { key: any }): Promise<any> {
            const contractSchema = Schema.fromRPCResponse({ script: contract.script as ScriptResponse });
            const encodedKey = contractSchema.EncodeBigMapKey(args.key);

            // tslint:disable-next-line: deprecation
            const val = await TezosService.handleNotFound(() => tezosService.client.getBigMapKey(contract.address, encodedKey));
            if (val != null) {
                return contractSchema.ExecuteOnBigMapValue(val);
            }
            return null;
        },
        delegate(contract: Contract): Promise<string | null> {
            return TezosService.handleNotFound(() => tezosService.client.getDelegate(contract.address, { block: contract.blockHash }));
        },
    },
};

async function getBigMapKeyHash(args: { key: any; keyType?: any; bigMapId?: number | undefined }): Promise<string> {
    // pack via RPC
    let params: PackDataParams;
    switch (args.keyType) {
        case 'address':
            params = { data: { bytes: b58decode(args.key) }, type: { prim: 'bytes' } };
            break;
        case 'bool':
            params = { data: { prim: args.key ? 'True' : 'False' }, type: { prim: 'bool' } };
            break;
        case 'bytes':
            params = { data: { bytes: args.key }, type: { prim: 'bytes' } };
            break;
        case 'int':
        case 'mutez':
        case 'nat':
            params = { data: { int: args.key }, type: { prim: args.keyType } };
            break;
        case 'string':
        case 'key_hash':
            params = { data: { string: args.key }, type: { prim: args.keyType } };
            break;
        default:
            throw new ApolloError(`Unsupported key type ${args.keyType}`);
    }
    const { packed } = await tezosService.client.packData(params);

    // apply blake2, add prefix and encode to b58
    const blakeHash = blake.blake2b(hex2buf(packed), null, 32);
    return b58cencode(blakeHash, new Uint8Array([13, 44, 64, 27]));
}

function managerKeyIsString(value: TaquitoManagerKeyResponse): value is string {
    return typeof value === 'string';
}
