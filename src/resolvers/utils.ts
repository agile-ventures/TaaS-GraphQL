import { isPlainObject, camelCase, isArray, each } from 'lodash';

function convertToCamelCase(obj: any): any {
    if (isPlainObject(obj)) {
        let result: any = {};
        each(obj, (v, k) => {
            result[camelCase(k)] = convertToCamelCase(v);
        });
        return result;
    } else if (isArray(obj)) {
        return obj.map(convertToCamelCase);
    } else {
        return obj;
    }
}

export function convertResponse<T>(response: any): T {
    return convertToCamelCase(response) as T;
}

export function convertResponseOrNull<T>(response: any | null): T | null {
    if (!response) {
        return null;
    }
    return convertResponse<T>(response!);
}
