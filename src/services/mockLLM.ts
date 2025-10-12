/**
 * Mock LLM service for when the real API is not available
 * Provides realistic responses based on common prompt patterns
 */

export const generateMockResponse = (prompt: string): string => {
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
