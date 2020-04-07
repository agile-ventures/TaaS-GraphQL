import { container } from 'tsyringe';

import { TezosRpcService } from '../services/tezos-rpc-service';
import { ContractEntrypoint, ContractResponse, EntrypointPath, ManagerKeyResponse, StorageResponse, DelegateResponse } from '../types/types';
import { ManagerKeyResponse as TaquitoManagerKeyResponse } from '@taquito/rpc';

const tezosRpcService = container.resolve(TezosRpcService);

export const contractResolver = {
    Contract: {
        async entrypoint(contract: ContractResponse): Promise<ContractEntrypoint> {
            const result = await tezosRpcService.client.getEntrypoints(contract.address, { block: contract.blockHash });
            return {
                ...result,
                unreachable: result.unreachable
                    ? {
                          ...result.unreachable,
                          path: result.unreachable.path.map(p => EntrypointPath[p]), //is there a better way to go from ('left' | 'right') to Enum?
                      }
                    : undefined,
            };
        },
        async manager_key(contract: ContractResponse): Promise<ManagerKeyResponse | null> {
            // apparently can return a 404
            try {
                const result = await tezosRpcService.client.getManagerKey(contract.address, { block: contract.blockHash });
                return managerKeyIsString(result) ? { key: result } : { key: result.key, invalid: true };
            } catch (e) {
                if (e.status === 404) {
                    return null;
                }

                throw e;
            }
        },
        async storage(contract: ContractResponse): Promise<StorageResponse> {
            const result = await tezosRpcService.client.getStorage(contract.address, { block: contract.blockHash });
            return result;
        },
        async delegate(contract: ContractResponse): Promise<DelegateResponse> {
            try {
                const result = await tezosRpcService.client.getDelegate(contract.address, { block: contract.blockHash });
                return result;
            } catch (e) {
                if (e.status === 404) {
                    return null;
                }

                throw e;
            }
        },
    },
};

function managerKeyIsString(value: TaquitoManagerKeyResponse): value is string {
    return typeof value === 'string';
}
