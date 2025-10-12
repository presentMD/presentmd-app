import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { sanitizePrompt } from '@/lib/security';
import { handleLLMError } from '@/lib/errorHandler';
import { API, TIMEOUTS } from '@/constants';
import { log } from '@/lib/logger';
import { generateMockResponse } from '@/services/mockLLM';

interface LLMContextType {
  isGenerating: boolean;
  generateText: (prompt: string) => Promise<string>;
  isSupported: boolean;
  error: string | null;
}

const LLMContext = createContext<LLMContextType | undefined>(undefined);

interface LLMProviderProps {
  children: ReactNode;
}

export const LLMProvider: React.FC<LLMProviderProps> = ({ children }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported] = useState(() => {
    // Check for WebGPU support
    return typeof navigator !== 'undefined' && 
           'gpu' in navigator && 
           typeof window !== 'undefined';
  });

  const generateText = useCallback(async (prompt: string): Promise<string> => {
    setIsGenerating(true);
    setError(null);

    try {
      // Sanitize the prompt to prevent injection attacks
      const sanitizedPrompt = sanitizePrompt(prompt);
      
      if (!sanitizedPrompt) {
        throw new Error('Invalid prompt provided');
      }

      // Try to use a real LLM service
      const response = await fetch(API.ENDPOINTS.GENERATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: sanitizedPrompt,
          model: API.MODELS.GPT_3_5_TURBO,
          max_tokens: API.DEFAULT_OPTIONS.MAX_TOKENS,
          temperature: API.DEFAULT_OPTIONS.TEMPERATURE,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data.content || data.text || data.choices?.[0]?.message?.content || 'No content generated';
    } catch (err) {
      // Fallback to mock response if API is not available
      log.warn('LLM API not available, using mock response', err);
      
      // Simulate processing time
      const startTime = Date.now();
      await new Promise(resolve => setTimeout(resolve, TIMEOUTS.MOCK_API_RESPONSE));
      const duration = Date.now() - startTime;
      
      // Generate a more realistic mock response based on the prompt
      const mockResponse = generateMockResponse(prompt);
      log.llmRequest(prompt, false, duration);
      return mockResponse;
    } finally {
      setIsGenerating(false);
    }
  }, []);


  const value: LLMContextType = {
    isGenerating,
    generateText,
    isSupported,
    error,
  };

  return (
    <LLMContext.Provider value={value}>
      {children}
    </LLMContext.Provider>
  );
};

export const useLLM = (): LLMContextType => {
  const context = useContext(LLMContext);
  if (context === undefined) {
    throw new Error('useLLM must be used within an LLMProvider');
  }
  return context;
};
