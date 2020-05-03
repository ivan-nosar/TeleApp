interface Array<T> {
    diff<T>(this: Array<T>, arrayToCompare: Array<T>): Array<T>;
}

function diff<T>(this: Array<T>, arrayToCompare: Array<T>): Array<T> {
    return this.filter(i => arrayToCompare.indexOf(i) < 0);
}

Array.prototype.diff = diff;
