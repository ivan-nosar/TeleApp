import { decode } from "./base64";

const authTokenKey = "auth-token";
const authTokenExpiresKey = "auth-token-expires";
const userIdKey = "user-id";

export interface SignedUserInfo {
    id: string | null;
    authToken: string | null;
    authTokenExpires: string | null;
}

export function storeToken(token: string) {
    const decryptedToken = decode(token);
    const tokenPayload = JSON.parse((decryptedToken as any).match(/{([^}]+)}/g)[1]);
    localStorage.setItem(userIdKey, tokenPayload.id);
    localStorage.setItem(authTokenExpiresKey, tokenPayload.exp);
    localStorage.setItem(authTokenKey, token);
}

export function checkSigning(): boolean {
    const tokenExpires = Number(localStorage.getItem(authTokenExpiresKey));
    const token = localStorage.getItem(authTokenKey);
    const now = Math.floor(Number(new Date()) / 1000);
    const result = (now < tokenExpires) && !!token;
    if (!result) {
        localStorage.removeItem(userIdKey);
        localStorage.removeItem(authTokenExpiresKey);
        localStorage.removeItem(authTokenKey);
    }
    return result;
}

export function extractSignedUser(): SignedUserInfo {
    return {
        id: localStorage.getItem(userIdKey),
        authToken: localStorage.getItem(authTokenKey),
        authTokenExpires: localStorage.getItem(authTokenExpiresKey)
    };
}
