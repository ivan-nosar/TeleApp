interface String {
    format(this: string, ...args: any[]): string;
}

function format(this: string, ...args: any[]): string {
    return this.replace(/{(\d+)}/g, (match, index) => {
        return typeof args[index] !== "undefined"
          ? args[index]
          : match
        ;
    });
}

String.prototype.format = format;
