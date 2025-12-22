// convex/auth.config.ts - NEW FILE for Clerk authentication

// Get the Clerk issuer domain from environment variable
const clerkIssuerDomain = process.env.CLERK_JWT_ISSUER_DOMAIN;

// Export configuration
export default {
    providers: clerkIssuerDomain ? [
        {
            domain: clerkIssuerDomain,
            applicationID: "convex",
        },
    ] : [],
};