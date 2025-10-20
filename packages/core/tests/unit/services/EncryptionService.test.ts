/**
 * TDD RED Phase: Tests for EncryptionService
 * 
 * These tests define the expected behavior of the EncryptionService
 * before we implement it. They should FAIL initially (RED).
 */

import { EncryptionService } from '../../../src/services/EncryptionService';
import { IEncryptor } from '../../../src/interfaces/IEncryptor';

describe('EncryptionService', () => {
  let encryptionService: EncryptionService;
  let mockEncryptor: jest.Mocked<IEncryptor>;

  beforeEach(() => {
    // This will fail until we create the service
    mockEncryptor = {
      encrypt: jest.fn(),
      decrypt: jest.fn()
    };
    
    encryptionService = new EncryptionService(mockEncryptor);
  });

  describe('encrypt method', () => {
    it('should have correct signature: encrypt(data: string): Promise<string>', async () => {
      // TDD RED: Test the method signature
      const result = await encryptionService.encrypt('test data');
      expect(typeof encryptionService.encrypt).toBe('function');
    });

    it('should encrypt string data', async () => {
      // TDD RED: Test encrypts string
      const plaintext = 'sensitive data';
      const ciphertext = 'encrypted_abc123def456';
      mockEncryptor.encrypt.mockResolvedValue(ciphertext);
      
      const result = await encryptionService.encrypt(plaintext);
      expect(result).toBe(ciphertext);
      expect(result).not.toBe(plaintext);
      expect(mockEncryptor.encrypt).toHaveBeenCalledWith(plaintext);
    });

    it('should encrypt different data types as strings', async () => {
      // TDD RED: Test encrypts different data types
      const testCases = [
        { input: 'string data', expected: 'encrypted_string' },
        { input: '123', expected: 'encrypted_number' },
        { input: 'true', expected: 'encrypted_boolean' }
      ];
      
      for (const testCase of testCases) {
        mockEncryptor.encrypt.mockResolvedValue(testCase.expected);
        const result = await encryptionService.encrypt(testCase.input);
        expect(result).toBe(testCase.expected);
        expect(mockEncryptor.encrypt).toHaveBeenCalledWith(testCase.input);
      }
    });

    it('should handle empty string', async () => {
      // TDD RED: Test handles empty string
      const plaintext = '';
      const ciphertext = 'encrypted_empty';
      mockEncryptor.encrypt.mockResolvedValue(ciphertext);
      
      const result = await encryptionService.encrypt(plaintext);
      expect(result).toBe(ciphertext);
    });

    it('should handle long strings', async () => {
      // TDD RED: Test handles long strings
      const plaintext = 'a'.repeat(10000);
      const ciphertext = 'encrypted_long_string';
      mockEncryptor.encrypt.mockResolvedValue(ciphertext);
      
      const result = await encryptionService.encrypt(plaintext);
      expect(result).toBe(ciphertext);
    });

    it('should handle special characters', async () => {
      // TDD RED: Test handles special characters
      const plaintext = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const ciphertext = 'encrypted_special_chars';
      mockEncryptor.encrypt.mockResolvedValue(ciphertext);
      
      const result = await encryptionService.encrypt(plaintext);
      expect(result).toBe(ciphertext);
    });

    it('should handle unicode characters', async () => {
      // TDD RED: Test handles unicode characters
      const plaintext = 'Hello 世界 🌍';
      const ciphertext = 'encrypted_unicode';
      mockEncryptor.encrypt.mockResolvedValue(ciphertext);
      
      const result = await encryptionService.encrypt(plaintext);
      expect(result).toBe(ciphertext);
    });
  });

  describe('decrypt method', () => {
    it('should have correct signature: decrypt(encrypted: string): Promise<string>', async () => {
      // TDD RED: Test the method signature
      const result = await encryptionService.decrypt('encrypted_data');
      expect(typeof encryptionService.decrypt).toBe('function');
    });

    it('should decrypt encrypted data back to original', async () => {
      // TDD RED: Test decrypts string
      const plaintext = 'sensitive data';
      const ciphertext = 'encrypted_abc123def456';
      mockEncryptor.decrypt.mockResolvedValue(plaintext);
      
      const result = await encryptionService.decrypt(ciphertext);
      expect(result).toBe(plaintext);
      expect(mockEncryptor.decrypt).toHaveBeenCalledWith(ciphertext);
    });

    it('should handle empty encrypted string', async () => {
      // TDD RED: Test handles empty encrypted string
      const ciphertext = '';
      const plaintext = '';
      mockEncryptor.decrypt.mockResolvedValue(plaintext);
      
      const result = await encryptionService.decrypt(ciphertext);
      expect(result).toBe(plaintext);
    });

    it('should handle invalid encrypted data', async () => {
      // TDD RED: Test handles invalid encrypted data
      const invalidCiphertext = 'invalid_encrypted_data';
      mockEncryptor.decrypt.mockRejectedValue(new Error('Invalid encrypted data'));
      
      await expect(encryptionService.decrypt(invalidCiphertext)).rejects.toThrow('Invalid encrypted data');
    });

    it('should handle corrupted encrypted data', async () => {
      // TDD RED: Test handles corrupted encrypted data
      const corruptedCiphertext = 'corrupted_encrypted_data';
      mockEncryptor.decrypt.mockRejectedValue(new Error('Corrupted encrypted data'));
      
      await expect(encryptionService.decrypt(corruptedCiphertext)).rejects.toThrow('Corrupted encrypted data');
    });
  });

  describe('encrypt/decrypt roundtrip', () => {
    it('should be able to decrypt what it encrypts', async () => {
      // TDD RED: Test encryption is reversible
      const plaintext = 'test data';
      const ciphertext = 'encrypted_abc123def456';
      
      mockEncryptor.encrypt.mockResolvedValue(ciphertext);
      mockEncryptor.decrypt.mockResolvedValue(plaintext);
      
      const encrypted = await encryptionService.encrypt(plaintext);
      const decrypted = await encryptionService.decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should handle multiple encrypt/decrypt cycles', async () => {
      // TDD RED: Test multiple cycles
      const plaintext = 'test data';
      const ciphertext = 'encrypted_abc123def456';
      
      mockEncryptor.encrypt.mockResolvedValue(ciphertext);
      mockEncryptor.decrypt.mockResolvedValue(plaintext);
      
      for (let i = 0; i < 5; i++) {
        const encrypted = await encryptionService.encrypt(plaintext);
        const decrypted = await encryptionService.decrypt(encrypted);
        expect(decrypted).toBe(plaintext);
      }
    });

    it('should produce different encrypted output for same input', async () => {
      // TDD RED: Test encrypted != original
      const plaintext = 'same data';
      const ciphertext1 = 'encrypted_abc123def456';
      const ciphertext2 = 'encrypted_xyz789ghi012';
      
      mockEncryptor.encrypt
        .mockResolvedValueOnce(ciphertext1)
        .mockResolvedValueOnce(ciphertext2);
      
      const result1 = await encryptionService.encrypt(plaintext);
      const result2 = await encryptionService.encrypt(plaintext);
      
      expect(result1).not.toBe(result2);
      expect(result1).not.toBe(plaintext);
      expect(result2).not.toBe(plaintext);
    });
  });

  describe('Dependency Injection', () => {
    it('should accept IEncryptor in constructor', () => {
      // TDD RED: Test constructor dependency injection
      const service = new EncryptionService(mockEncryptor);
      expect(service).toBeInstanceOf(EncryptionService);
    });

    it('should use injected encryptor for operations', async () => {
      // TDD RED: Test uses injected encryptor
      const plaintext = 'test data';
      const ciphertext = 'encrypted_test';
      mockEncryptor.encrypt.mockResolvedValue(ciphertext);
      
      const result = await encryptionService.encrypt(plaintext);
      expect(mockEncryptor.encrypt).toHaveBeenCalledWith(plaintext);
      expect(result).toBe(ciphertext);
    });
  });

  describe('Error Handling', () => {
    it('should handle encryptor errors gracefully', async () => {
      // TDD RED: Test error handling
      const plaintext = 'test data';
      mockEncryptor.encrypt.mockRejectedValue(new Error('Encryption failed'));
      
      await expect(encryptionService.encrypt(plaintext)).rejects.toThrow('Encryption failed');
    });

    it('should handle decryptor errors gracefully', async () => {
      // TDD RED: Test decryption error handling
      const ciphertext = 'encrypted_data';
      mockEncryptor.decrypt.mockRejectedValue(new Error('Decryption failed'));
      
      await expect(encryptionService.decrypt(ciphertext)).rejects.toThrow('Decryption failed');
    });
  });

  describe('Performance', () => {
    it('should encrypt data within reasonable time', async () => {
      // TDD RED: Test performance
      const plaintext = 'performance test data';
      const ciphertext = 'encrypted_performance';
      mockEncryptor.encrypt.mockResolvedValue(ciphertext);
      
      const startTime = Date.now();
      await encryptionService.encrypt(plaintext);
      const endTime = Date.now();
      
      // Should complete within 100ms (mocked, but tests the interface)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should decrypt data within reasonable time', async () => {
      // TDD RED: Test decryption performance
      const ciphertext = 'encrypted_performance';
      const plaintext = 'performance test data';
      mockEncryptor.decrypt.mockResolvedValue(plaintext);
      
      const startTime = Date.now();
      await encryptionService.decrypt(ciphertext);
      const endTime = Date.now();
      
      // Should complete within 100ms (mocked, but tests the interface)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
