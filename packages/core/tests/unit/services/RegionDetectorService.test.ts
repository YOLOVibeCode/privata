/**
 * TDD RED Phase: Tests for RegionDetectorService
 * 
 * These tests define the expected behavior of the RegionDetectorService
 * before we implement it. They should FAIL initially (RED).
 */

import { RegionDetectorService } from '../../../src/services/RegionDetectorService';
import { IRegionDetector } from '../../../src/interfaces/IRegionDetector';
import { Region } from '../../../src/types/Region';
import { RequestContext } from '../../../src/types/RequestContext';

describe('RegionDetectorService', () => {
  let regionDetectorService: RegionDetectorService;
  let mockDetector: jest.Mocked<IRegionDetector>;

  beforeEach(() => {
    // This will fail until we create the service
    mockDetector = {
      detectFromId: jest.fn(),
      detectFromData: jest.fn(),
      detectFromContext: jest.fn()
    };
    
    regionDetectorService = new RegionDetectorService(mockDetector);
  });

  describe('detectFromId method', () => {
    it('should have correct signature: detectFromId(id: string): Promise<Region>', async () => {
      // TDD RED: Test the method signature
      const result = await regionDetectorService.detectFromId('user-123');
      expect(typeof regionDetectorService.detectFromId).toBe('function');
    });

    it('should detect US region from ID', async () => {
      // TDD RED: Test `detectFromId()` returns 'US'
      const mockRegion: Region = 'US';
      mockDetector.detectFromId.mockResolvedValue(mockRegion);
      
      const result = await regionDetectorService.detectFromId('user-us-123');
      expect(result).toBe('US');
      expect(mockDetector.detectFromId).toHaveBeenCalledWith('user-us-123');
    });

    it('should detect EU region from ID', async () => {
      // TDD RED: Test `detectFromId()` returns 'EU'
      const mockRegion: Region = 'EU';
      mockDetector.detectFromId.mockResolvedValue(mockRegion);
      
      const result = await regionDetectorService.detectFromId('user-eu-456');
      expect(result).toBe('EU');
      expect(mockDetector.detectFromId).toHaveBeenCalledWith('user-eu-456');
    });

    it('should detect APAC region from ID', async () => {
      // TDD RED: Test APAC region detection
      const mockRegion: Region = 'APAC';
      mockDetector.detectFromId.mockResolvedValue(mockRegion);
      
      const result = await regionDetectorService.detectFromId('user-apac-789');
      expect(result).toBe('APAC');
    });

    it('should detect GLOBAL region from ID', async () => {
      // TDD RED: Test GLOBAL region detection
      const mockRegion: Region = 'GLOBAL';
      mockDetector.detectFromId.mockResolvedValue(mockRegion);
      
      const result = await regionDetectorService.detectFromId('user-global-999');
      expect(result).toBe('GLOBAL');
    });
  });

  describe('detectFromData method', () => {
    it('should have correct signature: detectFromData(data: any): Promise<Region>', async () => {
      // TDD RED: Test the method signature
      const data = { region: 'US', name: 'John' };
      const result = await regionDetectorService.detectFromData(data);
      expect(typeof regionDetectorService.detectFromData).toBe('function');
    });

    it('should detect region from explicit region field', async () => {
      // TDD RED: Test `detectFromData()` with US data
      const data = { region: 'US', name: 'John', email: 'john@example.com' };
      const mockRegion: Region = 'US';
      mockDetector.detectFromData.mockResolvedValue(mockRegion);
      
      const result = await regionDetectorService.detectFromData(data);
      expect(result).toBe('US');
      expect(mockDetector.detectFromData).toHaveBeenCalledWith(data);
    });

    it('should detect region from email domain', async () => {
      // TDD RED: Test `detectFromData()` with EU data
      const data = { name: 'John', email: 'john@example.co.uk' };
      const mockRegion: Region = 'EU';
      mockDetector.detectFromData.mockResolvedValue(mockRegion);
      
      const result = await regionDetectorService.detectFromData(data);
      expect(result).toBe('EU');
    });

    it('should detect region from phone number', async () => {
      // TDD RED: Test phone-based detection
      const data = { name: 'John', phone: '+1-555-123-4567' };
      const mockRegion: Region = 'US';
      mockDetector.detectFromData.mockResolvedValue(mockRegion);
      
      const result = await regionDetectorService.detectFromData(data);
      expect(result).toBe('US');
    });

    it('should detect region from address', async () => {
      // TDD RED: Test address-based detection
      const data = { 
        name: 'John', 
        address: { 
          country: 'Germany', 
          city: 'Berlin' 
        } 
      };
      const mockRegion: Region = 'EU';
      mockDetector.detectFromData.mockResolvedValue(mockRegion);
      
      const result = await regionDetectorService.detectFromData(data);
      expect(result).toBe('EU');
    });

    it('should handle empty or null data', async () => {
      // TDD RED: Test edge cases
      const mockRegion: Region = 'GLOBAL';
      mockDetector.detectFromData.mockResolvedValue(mockRegion);
      
      const result1 = await regionDetectorService.detectFromData({});
      const result2 = await regionDetectorService.detectFromData(null);
      const result3 = await regionDetectorService.detectFromData(undefined);
      
      expect(result1).toBe('GLOBAL');
      expect(result2).toBe('GLOBAL');
      expect(result3).toBe('GLOBAL');
    });
  });

  describe('detectFromContext method', () => {
    it('should have correct signature: detectFromContext(context: RequestContext): Promise<Region>', async () => {
      // TDD RED: Test the method signature
      const context: RequestContext = {
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        headers: { 'x-forwarded-for': '203.0.113.1' }
      };
      
      const result = await regionDetectorService.detectFromContext(context);
      expect(typeof regionDetectorService.detectFromContext).toBe('function');
    });

    it('should detect region from IP address', async () => {
      // TDD RED: Test `detectFromContext()` with request context
      const context: RequestContext = {
        ipAddress: '203.0.113.1',
        userAgent: 'Mozilla/5.0...',
        headers: {}
      };
      const mockRegion: Region = 'US';
      mockDetector.detectFromContext.mockResolvedValue(mockRegion);
      
      const result = await regionDetectorService.detectFromContext(context);
      expect(result).toBe('US');
      expect(mockDetector.detectFromContext).toHaveBeenCalledWith(context);
    });

    it('should detect region from X-Forwarded-For header', async () => {
      // TDD RED: Test header-based detection
      const context: RequestContext = {
        ipAddress: '10.0.0.1',
        userAgent: 'Mozilla/5.0...',
        headers: { 'x-forwarded-for': '203.0.113.1' }
      };
      const mockRegion: Region = 'US';
      mockDetector.detectFromContext.mockResolvedValue(mockRegion);
      
      const result = await regionDetectorService.detectFromContext(context);
      expect(result).toBe('US');
    });

    it('should detect region from Accept-Language header', async () => {
      // TDD RED: Test language-based detection
      const context: RequestContext = {
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        headers: { 'accept-language': 'de-DE,de;q=0.9' }
      };
      const mockRegion: Region = 'EU';
      mockDetector.detectFromContext.mockResolvedValue(mockRegion);
      
      const result = await regionDetectorService.detectFromContext(context);
      expect(result).toBe('EU');
    });

    it('should handle missing context data', async () => {
      // TDD RED: Test edge cases
      const context: RequestContext = {
        headers: {}
      };
      const mockRegion: Region = 'GLOBAL';
      mockDetector.detectFromContext.mockResolvedValue(mockRegion);
      
      const result = await regionDetectorService.detectFromContext(context);
      expect(result).toBe('GLOBAL');
    });
  });

  describe('Dependency Injection', () => {
    it('should accept IRegionDetector in constructor', () => {
      // TDD RED: Test constructor dependency injection
      const service = new RegionDetectorService(mockDetector);
      expect(service).toBeInstanceOf(RegionDetectorService);
    });

    it('should use injected detector for operations', async () => {
      // TDD RED: Test uses injected detector
      const mockRegion: Region = 'US';
      mockDetector.detectFromId.mockResolvedValue(mockRegion);
      
      const result = await regionDetectorService.detectFromId('test-id');
      expect(mockDetector.detectFromId).toHaveBeenCalledWith('test-id');
      expect(result).toBe(mockRegion);
    });
  });

  describe('Error Handling', () => {
    it('should handle detector errors gracefully', async () => {
      // TDD RED: Test error handling
      mockDetector.detectFromId.mockRejectedValue(new Error('Detection failed'));
      
      await expect(regionDetectorService.detectFromId('test-id')).rejects.toThrow('Detection failed');
    });

    it('should handle context detection errors gracefully', async () => {
      // TDD RED: Test context error handling
      const context: RequestContext = { headers: {} };
      mockDetector.detectFromContext.mockRejectedValue(new Error('Context detection failed'));
      
      await expect(regionDetectorService.detectFromContext(context)).rejects.toThrow('Context detection failed');
    });
  });
});
