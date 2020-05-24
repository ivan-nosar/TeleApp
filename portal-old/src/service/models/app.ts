import { ID, Optional, Type } from "validate-typescript";

export const App = {
    id: Optional(ID()),
    name: Type(String)
};
