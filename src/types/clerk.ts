export interface ClerkUser {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    phoneNumbers?: Array<{
      phoneNumber: string;
    }>;
    publicMetadata?: {
      role?: string;
    };
  }