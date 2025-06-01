import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    sub: string;
    username: string;
    role: string;
    roleName: string;
    exp: number;
    iat: number;
}

/**
 * Decode JWT token and return its payload
 * @param token JWT token string
 * @returns Decoded token payload or null if token is invalid
 */
export const decodeToken = (token: string): DecodedToken | null => {
    try {
        return jwtDecode<DecodedToken>(token);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

/**
 * Get username from JWT token
 * @param token JWT token string
 * @returns Username or null if token is invalid
 */
export const getUsernameFromToken = (token: string): string | null => {
    const decoded = decodeToken(token);
    return decoded?.username || null;
};

/**
 * Get role from JWT token
 * @param token JWT token string
 * @returns Role or null if token is invalid
 */
export const getRoleFromToken = (token: string): string | null => {
    const decoded = decodeToken(token);
    return decoded?.roleName ? decoded.roleName.toUpperCase() : null;
};

export const getCodeRoleFromToken = (token: string): string | null => {
    const decoded = decodeToken(token);
    return decoded?.role || null;
};

/**
 * Check if JWT token is expired
 * @param token JWT token string
 * @returns boolean indicating if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
    const decoded = decodeToken(token);
    if (!decoded) return true;

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
};

/**
 * Get all information from JWT token
 * @param token JWT token string
 * @returns Object containing all token information or null if token is invalid
 */
export const getTokenInfo = (token: string): DecodedToken | null => {
    return decodeToken(token);
}; 