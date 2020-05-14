import { ID, Optional, Type } from "validate-typescript";

export const App = {
    id: Optional(ID()),
    secret: Type(String),
    name: Type(String)
};
