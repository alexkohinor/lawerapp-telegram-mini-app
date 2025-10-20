/**
 * Integration tests for AI Consultation API
 * Основано на TESTING_STRATEGY.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

// Mock dependencies
vi.mock('@/lib/auth/get-current-user', () => ({
  getAuthUser: vi.fn(),
}));

vi.mock('@/lib/ai/multi-agent-system', () => ({
  MultiAgentSystem: vi.fn().mockImplementation(() => ({
    consult: vi.fn(),
  })),
}));

vi.mock('@/lib/ai/rag-service', () => ({
  ragService: {
    search: vi.fn(),
  },
}));

vi.mock('@/lib/monitoring/security-monitoring', () => ({
  securityMonitoring: {
    logEvent: vi.fn(),
    handleError: vi.fn(),
  },
  SecurityEvent: {
    AI_CONSULTATION_REQUEST: 'AI_CONSULTATION_REQUEST',
    AI_CONSULTATION_SUCCESS: 'AI_CONSULTATION_SUCCESS',
    AI_CONSULTATION_FAILED: 'AI_CONSULTATION_FAILED',
  },
}));

describe('/api/ai/consultation', () => {
  const mockUser = {
    id: 'test-user-123',
    first_name: 'Test',
    last_name: 'User',
    username: 'testuser',
  };

  const mockRequest = {
    query: 'Как подать иск в суд?',
    context: {
      area: 'civil' as const,
      jurisdiction: 'russia' as const,
      urgency: 'medium' as const,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/ai/consultation', () => {
    it('should handle successful consultation request', async () => {
      const { getAuthUser } = await import('@/lib/auth/get-current-user');
      const { MultiAgentSystem } = await import('@/lib/ai/multi-agent-system');
      const { ragService } = await import('@/lib/ai/rag-service');

      // Mock authenticated user
      vi.mocked(getAuthUser).mockResolvedValue(mockUser);

      // Mock AI response
      const mockAIResponse = {
        advice: 'Для подачи иска в суд необходимо...',
        confidence: 0.85,
        sources: [
          {
            id: '1',
            title: 'Гражданский процессуальный кодекс',
            type: 'law' as const,
            relevance: 0.9,
            excerpt: 'Статья 131. Форма и содержание искового заявления',
          },
        ],
        suggestions: [
          {
            id: '1',
            type: 'document' as const,
            title: 'Создать исковое заявление',
            description: 'Создать документ на основе вашего случая',
            confidence: 0.8,
          },
        ],
        reasoning: 'На основе анализа вашего вопроса...',
        agent: 'CivilLawAgent',
        tokensUsed: 150,
        cost: 0.02,
      };

      const mockMultiAgentSystem = new MultiAgentSystem();
      vi.mocked(mockMultiAgentSystem.consult).mockResolvedValue(mockAIResponse);

      // Mock RAG service
      vi.mocked(ragService.search).mockResolvedValue([
        {
          id: '1',
          content: 'Гражданский процессуальный кодекс РФ...',
          metadata: { source: 'gpk-rf' },
          score: 0.9,
        },
      ]);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/ai/consultation', {
        method: 'POST',
        body: JSON.stringify(mockRequest),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Call the API route
      const response = await POST(request);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        success: true,
        data: {
          advice: mockAIResponse.advice,
          confidence: mockAIResponse.confidence,
          sources: expect.any(Array),
          suggestions: expect.any(Array),
          reasoning: mockAIResponse.reasoning,
          agent: mockAIResponse.agent,
          tokensUsed: mockAIResponse.tokensUsed,
          cost: mockAIResponse.cost,
        },
      });

      // Verify AI service was called
      expect(mockMultiAgentSystem.consult).toHaveBeenCalledWith(
        mockRequest.query,
        expect.objectContaining({
          area: mockRequest.context.area,
          jurisdiction: mockRequest.context.jurisdiction,
          urgency: mockRequest.context.urgency,
          userProfile: expect.objectContaining({
            userId: mockUser.id,
          }),
        })
      );

      // Verify RAG service was called
      expect(ragService.search).toHaveBeenCalledWith(
        mockRequest.query,
        expect.objectContaining({
          area: mockRequest.context.area,
        })
      );
    });

    it('should handle unauthenticated request', async () => {
      const { getAuthUser } = await import('@/lib/auth/get-current-user');

      // Mock unauthenticated user
      vi.mocked(getAuthUser).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/ai/consultation', {
        method: 'POST',
        body: JSON.stringify(mockRequest),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toMatchObject({
        success: false,
        error: 'Unauthorized',
      });
    });

    it('should handle invalid request body', async () => {
      const { getAuthUser } = await import('@/lib/auth/get-current-user');

      // Mock authenticated user
      vi.mocked(getAuthUser).mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/ai/consultation', {
        method: 'POST',
        body: JSON.stringify({}), // Invalid request
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid request'),
      });
    });

    it('should handle AI service failure', async () => {
      const { getAuthUser } = await import('@/lib/auth/get-current-user');
      const { MultiAgentSystem } = await import('@/lib/ai/multi-agent-system');

      // Mock authenticated user
      vi.mocked(getAuthUser).mockResolvedValue(mockUser);

      // Mock AI service failure
      const mockMultiAgentSystem = new MultiAgentSystem();
      vi.mocked(mockMultiAgentSystem.consult).mockRejectedValue(
        new Error('AI service unavailable')
      );

      const request = new NextRequest('http://localhost:3000/api/ai/consultation', {
        method: 'POST',
        body: JSON.stringify(mockRequest),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toMatchObject({
        success: false,
        error: expect.stringContaining('Failed to process consultation'),
      });
    });

    it('should handle rate limiting', async () => {
      const { getAuthUser } = await import('@/lib/auth/get-current-user');

      // Mock authenticated user
      vi.mocked(getAuthUser).mockResolvedValue(mockUser);

      // Mock rate limiting (user has exceeded limit)
      const request = new NextRequest('http://localhost:3000/api/ai/consultation', {
        method: 'POST',
        body: JSON.stringify({
          ...mockRequest,
          context: {
            ...mockRequest.context,
            userProfile: {
              userId: mockUser.id,
              subscriptionStatus: 'free',
              consultationCount: 5, // Exceeded free limit
            },
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data).toMatchObject({
        success: false,
        error: expect.stringContaining('Rate limit exceeded'),
      });
    });
  });
});
