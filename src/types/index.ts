/**
 * Shared application-level TypeScript types for StadiumPulse AI.
 */

/** All routable menu sections in the app. */
export type ActiveMenu =
  | "overview"
  | "command_center"
  | "crowd_intelligence"
  | "ai_concierge"
  | "navigation"
  | "accessibility"
  | "transportation"
  | "sustainability"
  | "volunteers"
  | "incidents"
  | "analytics"
  | "settings";

/** Role a user can operate in within the app. */
export type UserRole = "director" | "volunteer" | "fan";
