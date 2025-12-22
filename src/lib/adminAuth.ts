import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.ADMIN_JWT_SECRET || 'your-secret-key-change-this-in-production'
);

export async function verifyAdminSession(token: string | undefined): Promise<boolean> {
    if (!token) return false;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload.role === 'admin';
    } catch (error) {
        return false;
    }
}

export function getAdminSessionToken(cookies: Map<string, string>): string | undefined {
    return cookies.get('admin_session');
}
