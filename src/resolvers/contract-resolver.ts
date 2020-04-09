import { container } from 'tsyringe';

import { TezosRpcService } from '../services/tezos-rpc-service';
import { ContractEntrypoint, ContractResponse, EntrypointPath, ManagerKeyResponse, StorageResponse, DelegateResponse } from '../types/types';
import { ManagerKeyResponse as TaquitoManagerKeyResponse, EntrypointsResponse } from '@taquito/rpc';

const tezosRpcService = container.resolve(TezosRpcService);

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
            const result = await handleNotFound(() => tezosRpcService.client.getEntrypoints(contract.address, { block: contract.blockHash }));
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
            const result = await handleNotFound(() => tezosRpcService.client.getManagerKey(contract.address, { block: contract.blockHash }));
            if (result != null) {
                return managerKeyIsString(result) ? { key: result } : { key: result.key, invalid: true };
            }
            return null;
        },
        storage(contract: ContractResponse): Promise<StorageResponse | null> {
            return handleNotFound(() => tezosRpcService.client.getStorage(contract.address, { block: contract.blockHash }));
        },
        delegate(contract: ContractResponse): Promise<DelegateResponse> {
            return handleNotFound(() => tezosRpcService.client.getDelegate(contract.address, { block: contract.blockHash }));
        },
    },
};

function managerKeyIsString(value: TaquitoManagerKeyResponse): value is string {
    return typeof value === 'string';
}
