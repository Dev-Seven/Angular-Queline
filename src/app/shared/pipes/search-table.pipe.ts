import { Pipe, PipeTransform } from '@angular/core';
import { CommonUtility } from '@app-core';

@Pipe({
    name: 'searchtable'
})
export class SearchTablePipe implements PipeTransform {

    transform(items: any[] = [], search: { [key: string]: any }) {
        if (!items) return [];
        if (CommonUtility.isObjectEmpty(search)) return items;
        Object.keys(search).forEach(key => {
            if (CommonUtility.isNotEmpty(search[key])) {
                items = filterItems(items, key, search[key]);
            }
        });
        return items;
    }
}

function filterItems(items: any[], key: string, value: any): any[] {
    const type: string = typeof value;
    switch (type) {
        case 'string':
            items = filterText(items, key, value as string);
            break;
        case 'number':
            items = filterNumber(items, key, value as number);
            break;
        case 'date':
            items = filterDate(items, key, new Date(value));
            break;
        case 'boolean':
            if (key === 'isDeleted') {
                items = filterDeleted(items, value);
            } else {
                items = filterBoolean(items, key, value);
            }
            break;
        default:
            break;
    }
    return items;
}

function filterDeleted(items: any[], value: boolean) {
    return value ? items : items.filter(x => x.isDeleted);
}

function filterDate(items: any[], key: string, value: Date) {
    const keys = CommonUtility.splitKeys(key);
    return items.filter(x => keys.some(k => {
        return new Date(x[k] || '') === value;
    }));
}

function filterText(items: any[], key: string, value: string) {
    const keys = CommonUtility.splitKeys(key);
    return items.filter(x => keys.some(k => {
        return (x[k] || '').toLowerCase().includes(value.toLowerCase());
    }));
}

function filterNumber(items: any[], key: string, value: number) {
    const keys = CommonUtility.splitKeys(key);
    return items.filter(x => keys.some(k => {
        return (x[k] || 0) === value;
    }));
}

function filterBoolean(items: any[], key: string, value: boolean) {
    const keys = CommonUtility.splitKeys(key);
    return items.filter(x => keys.some(k => {
        return (x[k] || false) === value;
    }));
}