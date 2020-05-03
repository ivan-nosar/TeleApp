interface Error {
    toJson?(): Object;
}

function toJson(this: Error): Object {
    const result: any = {};
    // tslint:disable-next-line: variable-name
    const _this = this as any;

    Object.getOwnPropertyNames(this).forEach(function (key) {
        result[key] = _this[key];
    }, this);

    return { ...result };
}

Error.prototype.toJson = toJson;
