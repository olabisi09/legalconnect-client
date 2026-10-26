import { Permission } from "@/lib/permissions";

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  organizationType: OrgType;
  subscriptionTier?: SubscriptionTier;
  firmSize?: string;
  jurisdiction?: string;
  acceptTerms: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  orgId: string;
  role: string;
  firmSlug: string;
  firmName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  firmSlug?: string;
}

/** One email can be a client of several firms; login without firmSlug then returns 409 MULTIPLE_FIRMS with these. */
export interface FirmOption {
  firmSlug: string;
  firmName: string;
}

/** Portal role — only PRIMARY_CONTACT and AUTHORIZED_REPRESENTATIVE can pay. */
export type ClientRole =
  | "PRIMARY_CONTACT"
  | "AUTHORIZED_REPRESENTATIVE"
  | "VIEWER";

export interface RegisterResponse {
  userId: string;
  orgId: string;
  workspaceUrl: string;
  organization: Organization;
  auth: Auth;
}

interface Auth {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

interface Organization {
  id: string;
  name: string;
  slug: null;
  type: string;
  status: string;
  primaryEmail: null;
  primaryPhone: null;
  billingEmail: null;
  subscriptionTier: string;
  subscriptionStatus: string;
  maxUsers: number;
  jurisdiction: string;
  ownerId: string;
  activeUserCount: number;
  createdAt: string;
  archivedAt: null;
  archivedReason: null;
  settings: any;
}

export type OrgRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "LAWYER"
  | "PARALEGAL"
  | "FINANCE"
  | "CLIENT";

export type SubscriptionTier = "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
export type OrgType =
  | "SOLO"
  | "SMALL_FIRM"
  | "MID_SIZE"
  | "LARGE_FIRM"
  | "CORPORATE_LEGAL"
  | "NON_PROFIT"
  | "GOVERNMENT";
