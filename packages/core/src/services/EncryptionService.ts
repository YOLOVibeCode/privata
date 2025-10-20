/**
 * EncryptionService - Service for encrypting and decrypting sensitive data
 *
 * This service provides a high-level interface for encryption operations,
 * following the Single Responsibility Principle and using dependency injection.
 *
 * @example
 * ```typescript
 * const encryptor = new AESEncryptor();
 * const service = new EncryptionService(encryptor);
 *
 * const encrypted = await service.encrypt('sensitive data');
 * const decrypted = await service.decrypt(encrypted);
 * ```
 */

import { IEncryptor } from '../interfaces/IEncryptor';

export class EncryptionService {
  /**
   * Creates a new EncryptionService instance
   *
   * @param encryptor - The encryptor to use for encryption/decryption
   */
  constructor(private readonly encryptor: IEncryptor) {}

  /**
   * Encrypt a string of data
   *
   * @param data - The plaintext data to encrypt
   * @returns Promise resolving to the encrypted ciphertext
   *
   * @example
   * ```typescript
   * const encrypted = await service.encrypt('sensitive data');
   * console.log(`Encrypted: ${encrypted}`);
   * ```
   */
  async encrypt(data: string): Promise<string> {
    return this.encryptor.encrypt(data);
  }

  /**
   * Decrypt encrypted data back to plaintext
   *
   * @param encrypted - The encrypted ciphertext to decrypt
   * @returns Promise resolving to the decrypted plaintext
   *
   * @example
   * ```typescript
   * const decrypted = await service.decrypt(encrypted);
   * console.log(`Decrypted: ${decrypted}`);
   * ```
   */
  async decrypt(encrypted: string): Promise<string> {
    return this.encryptor.decrypt(encrypted);
  }
}
