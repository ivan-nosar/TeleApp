import { ID, Optional, Type } from "validate-typescript";

export const AuthRequest = {
    username: Type(String),
    password: Type(String)
};

export const AuthResponse = {
    token: Type(String)
};
