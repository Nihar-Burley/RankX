import { jwtDecode } from "jwt-decode";

export const getRoleFromToken = (token) => {
    try {
        const decoded = jwtDecode(token);
        return decoded.role; // must match backend claim
    } catch {
        return null;
    }
};
