/**
 * IEncryptor - Interface Segregation Principle (ISP) Implementation
 *
 * This interface follows ISP by containing ONLY encryption/decryption operations.
 * Clients that only need to encrypt/decrypt data can depend on this interface
 * without being forced to implement other operations they don't need.
 *
 * @example
 * ```typescript
 * class DataProtectionService {
 *   constructor(private readonly encryptor: IEncryptor) {}
 *
 *   async protectSensitiveData(data: string): Promise<string> {
 *     return await this.encryptor.encrypt(data);
 *   }
 * }
 * ```
 */

export interface IEncryptor {
  /**
   * Encrypt a string of data
   *
   * @param data - The plaintext data to encrypt
   * @returns Promise resolving to the encrypted ciphertext
   *
   * @example
   * ```typescript
   * const encrypted = await encryptor.encrypt('sensitive data');
   * console.log(`Encrypted: ${encrypted}`);
   * ```
   */
  encrypt(data: string): Promise<string>;

  /**
   * Decrypt encrypted data back to plaintext
   *
   * @param encrypted - The encrypted ciphertext to decrypt
   * @returns Promise resolving to the decrypted plaintext
   *
   * @example
   * ```typescript
   * const decrypted = await encryptor.decrypt(encrypted);
   * console.log(`Decrypted: ${decrypted}`);
   * ```
   */
  decrypt(encrypted: string): Promise<string>;
}
