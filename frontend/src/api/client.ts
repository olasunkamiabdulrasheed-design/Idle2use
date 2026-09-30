/**
 * Shared authenticated HTTP layer for Stages 6-10 API surfaces.
 * Thin re-export: the refresh-and-retry pipeline lives in auth.ts
 * (authedApiRequest) so there is exactly one implementation.
 */

export { authedApiRequest as authedRequest } from "./auth";
