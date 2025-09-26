#!/usr/bin/env node

import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple mock response generator
function generateAdvancedMockResponse(prompt) {
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

function generateImprovedSlide(original, hasTitle, hasBullets, hasSubheadings) {
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

function generateBulletPointSlide(original, hasTitle) {
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

function generateEngagingSlide(original, hasTitle) {
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

function generateSimpleSlide(original, hasTitle) {
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

function generateActionSlide(original, hasTitle) {
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

async function handleLLMRequestMock(req) {
  try {
    const body = await req.json();
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

const PORT = 3001;

const server = createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle LLM API requests
  if (req.method === 'POST' && req.url === '/api/generate') {
    try {
      const response = await handleLLMRequestMock(req);
      
      // Copy response headers
      Object.entries(response.headers.raw()).forEach(([key, values]) => {
        values.forEach(value => res.setHeader(key, value));
      });
      
      res.writeHead(response.status);
      res.end(await response.text());
    } catch (error) {
      console.error('Error handling LLM request:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
    return;
  }

  // Handle other requests
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`🚀 LLM Development Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/generate`);
  console.log(`🔧 Using mock responses for development`);
  console.log(`💡 To use real LLM, set environment variables:`);
  console.log(`   LLM_PROVIDER=openai|anthropic|local`);
  console.log(`   LLM_API_KEY=your_api_key_here`);
  console.log(`   LLM_MODEL=gpt-3.5-turbo|gpt-4|claude-3-sonnet-20240229`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down LLM Development Server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down LLM Development Server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
