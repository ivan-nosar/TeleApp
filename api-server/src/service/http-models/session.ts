import { ID, Optional, Type } from "validate-typescript";

export const Session = {
    id: Optional(ID()),
    timestamp: Optional(Type(Date)),
    deviceModelName: Type(String),
    deviceId: Type(String),
    osVersionName: Type(String),
    localeName: Type(String)
};
