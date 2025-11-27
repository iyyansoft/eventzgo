export type UserRole = "user" | "organiser" | "admin";

export interface User {
  _id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: UserRole;
  profileImage?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Organiser {
  _id: string;
  userId: string;
  clerkId: string;
  institutionName: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  gstNumber: string;
  panNumber: string;
  tanNumber?: string;
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName: string;
  };
  documents: {
    gstCertificate?: string;
    panCard?: string;
    cancelledCheque?: string;
    bankStatement?: string;
  };
  approvalStatus: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: number;
  rejectionReason?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile extends User {
  organiser?: Organiser;
}