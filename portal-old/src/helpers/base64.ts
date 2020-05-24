export function encode(arg: string) {
    return Buffer.from(arg, "utf8").toString("base64");
}

export function decode(arg: string) {
    return Buffer.from(arg, "base64").toString("utf8");
}
