/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as adminAuth from "../adminAuth.js";
import type * as adminNavigation from "../adminNavigation.js";
import type * as adminOrganisers from "../adminOrganisers.js";
import type * as adminPayouts from "../adminPayouts.js";
import type * as adminQueries from "../adminQueries.js";
import type * as admin_addOrganiserCredentials from "../admin/addOrganiserCredentials.js";
import type * as analytics from "../analytics.js";
import type * as auth_authActions from "../auth/authActions.js";
import type * as auth_authHelpers from "../auth/authHelpers.js";
import type * as auth_authMutations from "../auth/authMutations.js";
import type * as auth_authQueries from "../auth/authQueries.js";
import type * as auth_secureAuth from "../auth/secureAuth.js";
import type * as bookings from "../bookings.js";
import type * as clerk from "../clerk.js";
import type * as coupons from "../coupons.js";
import type * as database from "../database.js";
import type * as emailVerifications from "../emailVerifications.js";
import type * as events from "../events.js";
import type * as fileStorage from "../fileStorage.js";
import type * as http from "../http.js";
import type * as lib_security from "../lib/security.js";
import type * as mail from "../mail.js";
import type * as management from "../management.js";
import type * as managementApprovals from "../managementApprovals.js";
import type * as notifications from "../notifications.js";
import type * as organisers from "../organisers.js";
import type * as organisersAuth from "../organisersAuth.js";
import type * as payments from "../payments.js";
import type * as payouts from "../payouts.js";
import type * as refunds from "../refunds.js";
import type * as roleBasedAuth from "../roleBasedAuth.js";
import type * as roles from "../roles.js";
import type * as scanAnalytics from "../scanAnalytics.js";
import type * as scripts from "../scripts.js";
import type * as seedAdmin from "../seedAdmin.js";
import type * as setup_setupTicketsHub from "../setup/setupTicketsHub.js";
import type * as support from "../support.js";
import type * as users from "../users.js";
import type * as verification from "../verification.js";
import type * as verificationStaff from "../verificationStaff.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminAuth: typeof adminAuth;
  adminNavigation: typeof adminNavigation;
  adminOrganisers: typeof adminOrganisers;
  adminPayouts: typeof adminPayouts;
  adminQueries: typeof adminQueries;
  "admin/addOrganiserCredentials": typeof admin_addOrganiserCredentials;
  analytics: typeof analytics;
  "auth/authActions": typeof auth_authActions;
  "auth/authHelpers": typeof auth_authHelpers;
  "auth/authMutations": typeof auth_authMutations;
  "auth/authQueries": typeof auth_authQueries;
  "auth/secureAuth": typeof auth_secureAuth;
  bookings: typeof bookings;
  clerk: typeof clerk;
  coupons: typeof coupons;
  database: typeof database;
  emailVerifications: typeof emailVerifications;
  events: typeof events;
  fileStorage: typeof fileStorage;
  http: typeof http;
  "lib/security": typeof lib_security;
  mail: typeof mail;
  management: typeof management;
  managementApprovals: typeof managementApprovals;
  notifications: typeof notifications;
  organisers: typeof organisers;
  organisersAuth: typeof organisersAuth;
  payments: typeof payments;
  payouts: typeof payouts;
  refunds: typeof refunds;
  roleBasedAuth: typeof roleBasedAuth;
  roles: typeof roles;
  scanAnalytics: typeof scanAnalytics;
  scripts: typeof scripts;
  seedAdmin: typeof seedAdmin;
  "setup/setupTicketsHub": typeof setup_setupTicketsHub;
  support: typeof support;
  users: typeof users;
  verification: typeof verification;
  verificationStaff: typeof verificationStaff;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
