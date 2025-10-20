/**
 * IPseudonymGenerator - Interface Segregation Principle (ISP) Implementation
 *
 * This interface follows ISP by containing ONLY pseudonym generation operations.
 * Clients that only need to generate pseudonyms can depend on this interface
 * without being forced to implement other operations they don't need.
 *
 * @example
 * ```typescript
 * class DataSeparatorService {
 *   constructor(private readonly pseudonymGenerator: IPseudonymGenerator) {}
 *
 *   async createPseudonym(): Promise<string> {
 *     return this.pseudonymGenerator.generate();
 *   }
 * }
 * ```
 */

export interface IPseudonymGenerator {
  /**
   * Generate a new pseudonym
   *
   * @returns A cryptographically secure pseudonym string
   *
   * @example
   * ```typescript
   * const pseudonym = pseudonymGenerator.generate();
   * console.log(`Generated pseudonym: ${pseudonym}`); // 'pseudo_abc123def456'
   * ```
   */
  generate(): string;

  /**
   * Validate a pseudonym format
   *
   * @param pseudonym - The pseudonym string to validate
   * @returns True if the pseudonym has valid format, false otherwise
   *
   * @example
   * ```typescript
   * const isValid = pseudonymGenerator.validate('pseudo_abc123def456');
   * if (isValid) {
   *   console.log('Valid pseudonym format');
   * }
   * ```
   */
  validate(pseudonym: string): boolean;
}
