import { HashTable } from "./types";

export function assignOwnPropertiesTo(origin: HashTable, target: HashTable, exclude?: string[]) {
    let keys = Object.getOwnPropertyNames(origin);
    if (exclude) {
        keys = keys.filter((key: string) =>
            !exclude.find(excludedKey => excludedKey === key)
        );
    }
    keys.forEach(key => {
        target[key] = origin[key];
    });
}

export function updateOwnPropertiesWith(target: HashTable, template: HashTable, exclude?: string[]) {
    let keys = Object.getOwnPropertyNames(template);
    if (exclude) {
        keys = keys.filter((key: string) =>
            !exclude.find(excludedKey => excludedKey === key)
        );
    }
    keys.forEach(key => {
        if (Object.getOwnPropertyDescriptor(target, key)) {
            target[key] = template[key];
        }
    });
}
