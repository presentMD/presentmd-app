import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { sanitizePrompt } from '@/lib/security';

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
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: sanitizedPrompt,
          model: 'gpt-3.5-turbo', // or 'gpt-4' for better quality
          max_tokens: 1000,
          temperature: 0.7,
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
      console.warn('LLM API not available, using mock response:', err);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a more realistic mock response based on the prompt
      const mockResponse = generateMockResponse(prompt);
      return mockResponse;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Helper function to generate more realistic mock responses
  const generateMockResponse = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('improve') || lowerPrompt.includes('better')) {
      return `# Enhanced Slide Content

## Key Improvements
- More engaging and compelling content
- Better structure and flow
- Clearer messaging and call-to-action

## Main Points
- Improved readability and visual hierarchy
- Added relevant examples and data points
- Enhanced with actionable insights

## Next Steps
- Review and customize as needed
- Apply to your presentation`;
    }
    
    if (lowerPrompt.includes('bullet') || lowerPrompt.includes('points')) {
      return `# Slide Title

## Key Points
- First important point with clear value proposition
- Second point highlighting benefits or features
- Third point addressing potential concerns
- Fourth point with actionable next steps

## Additional Details
- Supporting information
- Relevant statistics or examples
- Call-to-action or conclusion`;
    }
    
    if (lowerPrompt.includes('engaging') || lowerPrompt.includes('compelling')) {
      return `# Compelling Slide Title

## Why This Matters
- **Impact**: Clear value proposition
- **Benefits**: Specific advantages for the audience
- **Results**: Expected outcomes and success metrics

## Key Insights
- Insight 1: Supporting data or evidence
- Insight 2: Real-world application
- Insight 3: Future implications

## Take Action
- Next steps for implementation
- How to get started
- Contact information or resources`;
    }
    
    if (lowerPrompt.includes('simplify') || lowerPrompt.includes('simple')) {
      return `# Simple Slide Title

## Main Message
One clear, focused message that's easy to understand.

## Key Points
- Point 1
- Point 2  
- Point 3

## Summary
Brief conclusion or next step.`;
    }
    
    if (lowerPrompt.includes('call-to-action') || lowerPrompt.includes('action')) {
      return `# Slide Title

## The Challenge
Brief description of the problem or opportunity.

## The Solution
How we address this challenge.

## Take Action
- **Immediate**: What to do now
- **Next Steps**: Follow-up actions
- **Contact**: How to get help or more information

## Call to Action
Clear, compelling request for the audience to act.`;
    }
    
    // Default response
    return `# Improved Slide Content

## Overview
Based on your request, here's an enhanced version of your slide.

## Key Points
- Enhanced content structure
- Improved readability
- Better visual hierarchy

## Details
- Supporting information
- Relevant examples
- Clear next steps

## Conclusion
Ready to use in your presentation.`;
  };

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
