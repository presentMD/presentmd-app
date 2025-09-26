// Simple development server for LLM API
// This would be replaced with a real backend in production

import { handleGenerateRequest } from './generate';

export async function handleLLMRequest(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const result = await handleGenerateRequest(body);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
          ? 'https://presentmd.app' 
          : '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    });
  } catch (error) {
    console.error('LLM API Error:', error);
    
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
          ? 'https://presentmd.app' 
          : '*',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    });
  }
}

// For development, we'll use a mock response
export async function handleLLMRequestMock(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { prompt } = body;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Generate a more sophisticated mock response based on the prompt
    const mockResponse = generateAdvancedMockResponse(prompt);
    
    return new Response(JSON.stringify({
      content: mockResponse,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Mock LLM API Error:', error);
    
    return new Response(JSON.stringify({
      error: 'Mock API error occurred',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

function generateAdvancedMockResponse(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // Extract slide content and modification request
  const slideMatch = prompt.match(/Here is a current markdown of a slide:\s*([\s\S]*?)\s*Please suggest new markdown content/);
  const requestMatch = prompt.match(/based on the following ask:\s*(.*?)\s*For easy parsing/);
  
  const originalSlide = slideMatch?.[1]?.trim() || '';
  const modificationRequest = requestMatch?.[1]?.trim() || '';
  
  // Analyze the original slide to understand its structure
  const hasTitle = originalSlide.includes('#');
  const hasBullets = originalSlide.includes('-') || originalSlide.includes('*');
  const hasSubheadings = originalSlide.includes('##');
  
  // Generate response based on modification request
  if (modificationRequest.includes('improve') || modificationRequest.includes('better')) {
    return generateImprovedSlide(originalSlide, hasTitle, hasBullets, hasSubheadings);
  }
  
  if (modificationRequest.includes('bullet') || modificationRequest.includes('points')) {
    return generateBulletPointSlide(originalSlide, hasTitle);
  }
  
  if (modificationRequest.includes('engaging') || modificationRequest.includes('compelling')) {
    return generateEngagingSlide(originalSlide, hasTitle);
  }
  
  if (modificationRequest.includes('simplify') || modificationRequest.includes('simple')) {
    return generateSimpleSlide(originalSlide, hasTitle);
  }
  
  if (modificationRequest.includes('call-to-action') || modificationRequest.includes('action')) {
    return generateActionSlide(originalSlide, hasTitle);
  }
  
  // Default improvement
  return generateImprovedSlide(originalSlide, hasTitle, hasBullets, hasSubheadings);
}

function generateImprovedSlide(original: string, hasTitle: boolean, hasBullets: boolean, hasSubheadings: boolean): string {
  const title = hasTitle ? original.match(/#\s*(.+)/)?.[1] || 'Enhanced Slide' : 'Enhanced Slide';
  
  return `# ${title}

## Key Improvements
- Enhanced structure and flow
- More engaging content
- Clearer messaging

## Main Points
- Improved readability
- Better visual hierarchy
- Actionable insights

## Next Steps
- Review and customize
- Apply to presentation`;
}

function generateBulletPointSlide(original: string, hasTitle: boolean): string {
  const title = hasTitle ? original.match(/#\s*(.+)/)?.[1] || 'Key Points' : 'Key Points';
  
  return `# ${title}

## Important Points
- First key point with clear value
- Second point highlighting benefits
- Third point addressing concerns
- Fourth point with next steps

## Supporting Details
- Relevant statistics
- Real-world examples
- Actionable insights

## Summary
- Key takeaway
- Call to action`;
}

function generateEngagingSlide(original: string, hasTitle: boolean): string {
  const title = hasTitle ? original.match(/#\s*(.+)/)?.[1] || 'Compelling Content' : 'Compelling Content';
  
  return `# ${title}

## Why This Matters
- **Impact**: Clear value proposition
- **Benefits**: Specific advantages
- **Results**: Measurable outcomes

## Key Insights
- Insight 1: Supporting evidence
- Insight 2: Real-world application
- Insight 3: Future implications

## Take Action
- Immediate next steps
- How to get started
- Resources and support`;
}

function generateSimpleSlide(original: string, hasTitle: boolean): string {
  const title = hasTitle ? original.match(/#\s*(.+)/)?.[1] || 'Simple Message' : 'Simple Message';
  
  return `# ${title}

## Main Message
One clear, focused message.

## Key Points
- Point 1
- Point 2
- Point 3

## Summary
Brief conclusion.`;
}

function generateActionSlide(original: string, hasTitle: boolean): string {
  const title = hasTitle ? original.match(/#\s*(.+)/)?.[1] || 'Take Action' : 'Take Action';
  
  return `# ${title}

## The Challenge
Brief problem description.

## The Solution
How we address this.

## Take Action
- **Immediate**: What to do now
- **Next Steps**: Follow-up actions
- **Contact**: Get help

## Call to Action
Clear, compelling request to act.`;
}
