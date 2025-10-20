/**
 * Unit tests for MFA Service
 * Основано на TESTING_STRATEGY.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MFAService, MFAMethod } from './mfa-service';

// Mock security monitoring
vi.mock('@/lib/monitoring/security-monitoring', () => ({
  securityMonitoring: {
    logEvent: vi.fn(),
  },
  SecurityEvent: {
    MFA_INITIATED: 'MFA_INITIATED',
    MFA_SUCCESS: 'MFA_SUCCESS',
    MFA_METHOD_ADDED: 'MFA_METHOD_ADDED',
    MFA_METHOD_ENABLED: 'MFA_METHOD_ENABLED',
    MFA_METHOD_DISABLED: 'MFA_METHOD_DISABLED',
    UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  },
}));

describe('MFAService', () => {
  let mfaService: MFAService;
  const testUserId = 'test-user-123';

  beforeEach(() => {
    mfaService = new MFAService();
  });

  describe('addMFAMethod', () => {
    it('should add a new MFA method', async () => {
      const method = await mfaService.addMFAMethod(testUserId, 'sms', 'My Phone');
      
      expect(method).toMatchObject({
        type: 'sms',
        name: 'My Phone',
        isEnabled: false,
        isVerified: false,
      });
      expect(method.id).toBeDefined();
      expect(method.createdAt).toBeInstanceOf(Date);
    });

    it('should store the method for the user', async () => {
      await mfaService.addMFAMethod(testUserId, 'email', 'My Email');
      
      const userMethods = mfaService.getUserMethods(testUserId);
      expect(userMethods).toHaveLength(1);
      expect(userMethods[0].type).toBe('email');
      expect(userMethods[0].name).toBe('My Email');
    });
  });

  describe('enableMFAMethod', () => {
    it('should enable and verify a method', async () => {
      const method = await mfaService.addMFAMethod(testUserId, 'sms', 'My Phone');
      
      await mfaService.enableMFAMethod(testUserId, method.id);
      
      const userMethods = mfaService.getUserMethods(testUserId);
      const enabledMethod = userMethods.find(m => m.id === method.id);
      
      expect(enabledMethod?.isEnabled).toBe(true);
      expect(enabledMethod?.isVerified).toBe(true);
    });

    it('should throw error for non-existent method', async () => {
      await expect(
        mfaService.enableMFAMethod(testUserId, 'non-existent-id')
      ).rejects.toThrow('MFA method not found');
    });
  });

  describe('disableMFAMethod', () => {
    it('should disable a method', async () => {
      const method = await mfaService.addMFAMethod(testUserId, 'sms', 'My Phone');
      await mfaService.enableMFAMethod(testUserId, method.id);
      
      await mfaService.disableMFAMethod(testUserId, method.id);
      
      const userMethods = mfaService.getUserMethods(testUserId);
      const disabledMethod = userMethods.find(m => m.id === method.id);
      
      expect(disabledMethod?.isEnabled).toBe(false);
    });
  });

  describe('initiateMFA', () => {
    beforeEach(async () => {
      const method = await mfaService.addMFAMethod(testUserId, 'sms', 'My Phone');
      await mfaService.enableMFAMethod(testUserId, method.id);
    });

    it('should initiate MFA for enabled method', async () => {
      const challengeId = await mfaService.initiateMFA(testUserId, 'sms');
      
      expect(challengeId).toBeDefined();
      expect(typeof challengeId).toBe('string');
    });

    it('should throw error for disabled method', async () => {
      await expect(
        mfaService.initiateMFA(testUserId, 'email')
      ).rejects.toThrow('MFA method not enabled or verified');
    });

    it('should throw error for non-existent method', async () => {
      await expect(
        mfaService.initiateMFA(testUserId, 'totp')
      ).rejects.toThrow('MFA method not enabled or verified');
    });
  });

  describe('verifyMFA', () => {
    let challengeId: string;

    beforeEach(async () => {
      const method = await mfaService.addMFAMethod(testUserId, 'sms', 'My Phone');
      await mfaService.enableMFAMethod(testUserId, method.id);
      challengeId = await mfaService.initiateMFA(testUserId, 'sms');
    });

    it('should verify correct code', async () => {
      // Note: In real implementation, we'd need to get the actual code
      // For testing, we'll mock the validation
      const result = await mfaService.verifyMFA(challengeId, '123456');
      
      expect(result.success).toBe(true);
      expect(result.method).toBe('sms');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should throw error for non-existent challenge', async () => {
      await expect(
        mfaService.verifyMFA('non-existent-id', '123456')
      ).rejects.toThrow('MFA challenge not found');
    });

    it('should throw error for expired challenge', async () => {
      // Mock expired challenge
      const expiredChallengeId = await mfaService.initiateMFA(testUserId, 'sms');
      
      // Simulate time passing
      vi.advanceTimersByTime(6 * 60 * 1000); // 6 minutes
      
      await expect(
        mfaService.verifyMFA(expiredChallengeId, '123456')
      ).rejects.toThrow('MFA challenge expired');
    });

    it('should throw error for too many attempts', async () => {
      // Make multiple failed attempts
      for (let i = 0; i < 3; i++) {
        try {
          await mfaService.verifyMFA(challengeId, 'wrong-code');
        } catch (error) {
          // Expected to fail
        }
      }
      
      await expect(
        mfaService.verifyMFA(challengeId, '123456')
      ).rejects.toThrow('Too many MFA attempts');
    });
  });

  describe('isMFARequired', () => {
    it('should return false when no methods are enabled', () => {
      expect(mfaService.isMFARequired(testUserId)).toBe(false);
    });

    it('should return true when at least one method is enabled', async () => {
      const method = await mfaService.addMFAMethod(testUserId, 'sms', 'My Phone');
      await mfaService.enableMFAMethod(testUserId, method.id);
      
      expect(mfaService.isMFARequired(testUserId)).toBe(true);
    });

    it('should return false when all methods are disabled', async () => {
      const method = await mfaService.addMFAMethod(testUserId, 'sms', 'My Phone');
      await mfaService.enableMFAMethod(testUserId, method.id);
      await mfaService.disableMFAMethod(testUserId, method.id);
      
      expect(mfaService.isMFARequired(testUserId)).toBe(false);
    });
  });

  describe('getUserMethods', () => {
    it('should return empty array for new user', () => {
      const methods = mfaService.getUserMethods('new-user');
      expect(methods).toEqual([]);
    });

    it('should return all methods for user', async () => {
      await mfaService.addMFAMethod(testUserId, 'sms', 'My Phone');
      await mfaService.addMFAMethod(testUserId, 'email', 'My Email');
      
      const methods = mfaService.getUserMethods(testUserId);
      expect(methods).toHaveLength(2);
      expect(methods.map(m => m.type)).toEqual(['sms', 'email']);
    });
  });
});
