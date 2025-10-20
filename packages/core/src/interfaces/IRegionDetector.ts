/**
 * IRegionDetector - Interface Segregation Principle (ISP) Implementation
 *
 * This interface follows ISP by containing ONLY region detection operations.
 * Clients that only need to detect regions can depend on this interface
 * without being forced to implement other operations they don't need.
 *
 * @example
 * ```typescript
 * class ComplianceService {
 *   constructor(private readonly regionDetector: IRegionDetector) {}
 *
 *   async ensureDataResidency(userId: string): Promise<Region> {
 *     return await this.regionDetector.detectFromId(userId);
 *   }
 * }
 * ```
 */

import { Region } from '../types/Region';
import { RequestContext } from '../types/RequestContext';

export interface IRegionDetector {
  /**
   * Detect region from entity ID
   *
   * @param id - The entity ID to analyze
   * @returns Promise resolving to the detected region
   *
   * @example
   * ```typescript
   * const region = await regionDetector.detectFromId('user-us-123');
   * console.log(`User is in region: ${region}`); // 'US'
   * ```
   */
  detectFromId(id: string): Promise<Region>;

  /**
   * Detect region from data object
   *
   * @param data - The data object to analyze
   * @returns Promise resolving to the detected region
   *
   * @example
   * ```typescript
   * const region = await regionDetector.detectFromData({
   *   email: 'user@example.co.uk',
   *   address: { country: 'United Kingdom' }
   * });
   * console.log(`Data is in region: ${region}`); // 'EU'
   * ```
   */
  detectFromData(data: any): Promise<Region>;

  /**
   * Detect region from request context
   *
   * @param context - The request context to analyze
   * @returns Promise resolving to the detected region
   *
   * @example
   * ```typescript
   * const region = await regionDetector.detectFromContext({
   *   ipAddress: '203.0.113.1',
   *   headers: { 'accept-language': 'de-DE' }
   * });
   * console.log(`Request is from region: ${region}`); // 'EU'
   * ```
   */
  detectFromContext(context: RequestContext): Promise<Region>;
}

// Re-export types for convenience
export { Region, RequestContext };
