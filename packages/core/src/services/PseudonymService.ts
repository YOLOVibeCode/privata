/**
 * PseudonymService - Service for generating and validating pseudonyms
 *
 * This service provides a high-level interface for pseudonym operations,
 * following the Single Responsibility Principle and using dependency injection.
 *
 * @example
 * ```typescript
 * const generator = new CryptoPseudonymGenerator();
 * const service = new PseudonymService(generator);
 *
 * const pseudonym = service.generate();
 * const isValid = service.validate(pseudonym);
 * ```
 */

import { IPseudonymGenerator } from '../interfaces/IPseudonymGenerator';

export class PseudonymService {
  /**
   * Creates a new PseudonymService instance
   *
   * @param generator - The pseudonym generator to use
   */
  constructor(private readonly generator: IPseudonymGenerator) {}

  /**
   * Generate a new pseudonym
   *
   * @returns A cryptographically secure pseudonym string
   *
   * @example
   * ```typescript
   * const pseudonym = service.generate();
   * console.log(`Generated pseudonym: ${pseudonym}`); // 'pseudo_abc123def456'
   * ```
   */
  generate(): string {
    return this.generator.generate();
  }

  /**
   * Validate a pseudonym format
   *
   * @param pseudonym - The pseudonym string to validate
   * @returns True if the pseudonym has valid format, false otherwise
   *
   * @example
   * ```typescript
   * const isValid = service.validate('pseudo_abc123def456');
   * if (isValid) {
   *   console.log('Valid pseudonym format');
   * }
   * ```
   */
  validate(pseudonym: string): boolean {
    return this.generator.validate(pseudonym);
  }
}
