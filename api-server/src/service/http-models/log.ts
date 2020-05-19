import { ID, Optional, Type } from "validate-typescript";

export const Log = {
    id: Optional(ID()),
    timestamp: Optional(Type(Date)),
    text: Type(String)
};
