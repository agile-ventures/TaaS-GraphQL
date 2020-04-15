import { BlockResponse } from '@taquito/rpc';
import { Block } from '../../../types/types';

export function convertResponse(response: BlockResponse | null) {
    return (response as any) as Block;
}
