import { BlockResponse } from "@taquito/rpc";
import { Block } from "../../../types/types";

export function convertResponse(response: BlockResponse) {
    return (response as any) as Block;
}
