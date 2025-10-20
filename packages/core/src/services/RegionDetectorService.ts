/**
 * RegionDetectorService - Service for detecting data regions
 *
 * This service provides a high-level interface for region detection operations,
 * following the Single Responsibility Principle and using dependency injection.
 *
 * @example
 * ```typescript
 * const detector = new IPGeolocationRegionDetector();
 * const service = new RegionDetectorService(detector);
 *
 * const region = await service.detectFromId('user-123');
 * const regionFromData = await service.detectFromData({ email: 'user@example.co.uk' });
 * ```
 */

import { IRegionDetector } from '../interfaces/IRegionDetector';
import { Region } from '../types/Region';
import { RequestContext } from '../types/RequestContext';

export class RegionDetectorService {
  /**
   * Creates a new RegionDetectorService instance
   *
   * @param detector - The region detector to use
   */
  constructor(private readonly detector: IRegionDetector) {}

  /**
   * Detect region from entity ID
   *
   * @param id - The entity ID to analyze
   * @returns Promise resolving to the detected region
   *
   * @example
   * ```typescript
   * const region = await service.detectFromId('user-us-123');
   * console.log(`User is in region: ${region}`); // 'US'
   * ```
   */
  async detectFromId(id: string): Promise<Region> {
    return this.detector.detectFromId(id);
  }

  /**
   * Detect region from data object
   *
   * @param data - The data object to analyze
   * @returns Promise resolving to the detected region
   *
   * @example
   * ```typescript
   * const region = await service.detectFromData({
   *   email: 'user@example.co.uk',
   *   address: { country: 'United Kingdom' }
   * });
   * console.log(`Data is in region: ${region}`); // 'EU'
   * ```
   */
  async detectFromData(data: any): Promise<Region> {
    return this.detector.detectFromData(data);
  }

  /**
   * Detect region from request context
   *
   * @param context - The request context to analyze
   * @returns Promise resolving to the detected region
   *
   * @example
   * ```typescript
   * const region = await service.detectFromContext({
   *   ipAddress: '203.0.113.1',
   *   headers: { 'accept-language': 'de-DE' }
   * });
   * console.log(`Request is from region: ${region}`); // 'EU'
   * ```
   */
  async detectFromContext(context: RequestContext): Promise<Region> {
    return this.detector.detectFromContext(context);
  }
}
