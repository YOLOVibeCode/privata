/**
 * RequestContext - Context information for request processing
 *
 * This type defines the context information available during request processing,
 * used for region detection and compliance decisions.
 */

export interface RequestContext {
  /** IP address of the client */
  ipAddress?: string;

  /** User agent string from the client */
  userAgent?: string;

  /** HTTP headers from the request */
  headers: Record<string, string>;

  /** User ID if authenticated */
  userId?: string;

  /** Session ID */
  sessionId?: string;

  /** Request timestamp */
  timestamp?: Date;

  /** Request method (GET, POST, etc.) */
  method?: string;

  /** Request URL */
  url?: string;

  /** Custom metadata */
  metadata?: Record<string, any>;
}
