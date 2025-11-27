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
import type * as analytics from "../analytics.js";
import type * as bookings from "../bookings.js";
import type * as events from "../events.js";
import type * as http from "../http.js";
import type * as managementUsers from "../managementUsers.js";
import type * as notifications from "../notifications.js";
import type * as organisers from "../organisers.js";
import type * as payments from "../payments.js";
import type * as payouts from "../payouts.js";
import type * as refunds from "../refunds.js";
import type * as scripts from "../scripts.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  analytics: typeof analytics;
  bookings: typeof bookings;
  events: typeof events;
  http: typeof http;
  managementUsers: typeof managementUsers;
  notifications: typeof notifications;
  organisers: typeof organisers;
  payments: typeof payments;
  payouts: typeof payouts;
  refunds: typeof refunds;
  scripts: typeof scripts;
  users: typeof users;
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
