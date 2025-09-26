# LLM Integration Guide

This document explains how to set up and use the AI Assistant with real LLM services.

## Overview

The AI Assistant supports multiple LLM providers:
- **OpenAI** (GPT-3.5, GPT-4)
- **Anthropic** (Claude 3)
- **Local LLMs** (Ollama, LM Studio)

## Quick Start

### Development Mode (Mock Responses)

For development and testing, the AI Assistant uses intelligent mock responses:

```bash
npm run dev
```

The mock responses are context-aware and generate realistic slide content based on your prompts.

### Full Development Mode (With API Server)

To run both the frontend and API server:

```bash
npm run dev:full
```

This starts:
- Frontend on `http://localhost:5173`
- API server on `http://localhost:3001`

## Real LLM Integration

### Environment Variables

Create a `.env` file in the project root:

```env
# LLM Configuration
LLM_PROVIDER=openai
LLM_API_KEY=your_api_key_here
LLM_MODEL=gpt-3.5-turbo
LLM_MAX_TOKENS=1000
LLM_TEMPERATURE=0.7
```

### Supported Providers

#### OpenAI
```env
LLM_PROVIDER=openai
LLM_API_KEY=sk-your-openai-key
LLM_MODEL=gpt-3.5-turbo
```

#### Anthropic
```env
LLM_PROVIDER=anthropic
LLM_API_KEY=sk-ant-your-anthropic-key
LLM_MODEL=claude-3-sonnet-20240229
```

#### Local LLM (Ollama)
```env
LLM_PROVIDER=local
LLM_MODEL=llama2
```

Make sure Ollama is running on `http://localhost:11434`

### Production Deployment

For production, replace the mock API server with a real backend:

1. **Deploy the API server** to your preferred platform (Vercel, Netlify, AWS, etc.)
2. **Update the API endpoint** in `src/contexts/LLMContext.tsx`
3. **Set environment variables** in your production environment

## API Endpoints

### POST /api/generate

Generates slide content based on a prompt.

**Request:**
```json
{
  "prompt": "Here is a current markdown of a slide: ...",
  "model": "gpt-3.5-turbo",
  "max_tokens": 1000,
  "temperature": 0.7
}
```

**Response:**
```json
{
  "content": "# Generated Slide Content\n\n## Key Points\n- Point 1\n- Point 2"
}
```

## Customization

### Adding New LLM Providers

1. **Extend the LLMService class** in `src/api/generate.ts`
2. **Add provider-specific logic** in the `generateWith*` methods
3. **Update the configuration** in `LLM_CONFIG`

### Customizing Mock Responses

Edit the `generateAdvancedMockResponse` function in `src/api/server.ts` to customize mock responses for your use case.

## Troubleshooting

### Common Issues

1. **API Key Not Set**: Make sure `LLM_API_KEY` is set in your environment
2. **CORS Errors**: Ensure the API server is running and accessible
3. **Rate Limiting**: Check your LLM provider's rate limits
4. **Network Issues**: Verify your internet connection and API endpoint

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=llm:*
```

## Security Considerations

1. **Never commit API keys** to version control
2. **Use environment variables** for sensitive configuration
3. **Implement rate limiting** in production
4. **Validate user inputs** before sending to LLM
5. **Monitor API usage** and costs

## Cost Optimization

1. **Use appropriate models** (GPT-3.5 vs GPT-4)
2. **Set reasonable token limits**
3. **Implement caching** for similar requests
4. **Monitor usage** and set alerts

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Open an issue on GitHub
4. Check the LLM provider's documentation
