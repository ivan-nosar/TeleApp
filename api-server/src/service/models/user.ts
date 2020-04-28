import { ID, Optional, Type } from "validate-typescript";

export const User = {
    id: Optional(ID()),
    username: Type(String),
    email: Type(String),
    password: Type(String)
};
