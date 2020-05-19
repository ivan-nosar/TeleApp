import { ID, Optional, Type } from "validate-typescript";

export const Metric = {
    id: Optional(ID()),
    timestamp: Optional(Type(Date)),
    content: Type(Object)
};
