// src/types/next-auth.d.ts
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface User {
        id: string;
        username?: string;
        role?: string;
        accountStatus?: string;
        requirePasswordChange?: boolean;
        sessionToken?: string;
    }

    interface Session {
        user: {
            userId: string;
            username: string;
            email: string;
            name: string;
            role: string;
            accountStatus: string;
            requirePasswordChange: boolean;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        userId: string;
        username: string;
        role: string;
        accountStatus: string;
        requirePasswordChange: boolean;
        sessionToken: string;
    }
}
