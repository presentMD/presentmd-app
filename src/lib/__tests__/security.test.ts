import { describe, it, expect, vi } from 'vitest'
import {
  sanitizeHTML,
  sanitizeCSS,
  isValidUrl,
  sanitizeThemeName,
  sanitizeMarkdown,
  sanitizePrompt,
} from '../security'

describe('Security Utils', () => {
  describe('sanitizeHTML', () => {
    it('should sanitize dangerous HTML tags', () => {
      const dangerousHTML = '<script>alert("xss")</script><p>Safe content</p>'
      const result = sanitizeHTML(dangerousHTML)
      expect(result).toBe('<p>Safe content</p>')
    })

    it('should preserve safe HTML tags', () => {
      const safeHTML = '<p>Safe content</p><strong>Bold text</strong>'
      const result = sanitizeHTML(safeHTML)
      expect(result).toBe('<p>Safe content</p><strong>Bold text</strong>')
    })

    it('should remove dangerous attributes', () => {
      const htmlWithDangerousAttr = '<p onclick="alert(1)">Click me</p>'
      const result = sanitizeHTML(htmlWithDangerousAttr)
      expect(result).toBe('<p>Click me</p>')
    })
  })

  describe('sanitizeCSS', () => {
    it('should remove javascript: URLs', () => {
      const dangerousCSS = 'background: url(javascript:alert(1))'
      const result = sanitizeCSS(dangerousCSS)
      expect(result).not.toContain('javascript:')
    })

    it('should remove expression() functions', () => {
      const dangerousCSS = 'width: expression(alert(1))'
      const result = sanitizeCSS(dangerousCSS)
      expect(result).not.toContain('expression(')
    })

    it('should preserve safe CSS', () => {
      const safeCSS = 'color: red; background: blue;'
      const result = sanitizeCSS(safeCSS)
      expect(result).toContain('color: red')
      expect(result).toContain('background: blue')
    })
  })

  describe('isValidUrl', () => {
    it('should validate HTTP URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true)
      expect(isValidUrl('https://example.com')).toBe(true)
    })

    it('should reject non-HTTP URLs', () => {
      expect(isValidUrl('ftp://example.com')).toBe(false)
      expect(isValidUrl('javascript:alert(1)')).toBe(false)
    })

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('')).toBe(false)
    })
  })

  describe('sanitizeThemeName', () => {
    it('should allow alphanumeric characters and hyphens', () => {
      expect(sanitizeThemeName('my-theme-123')).toBe('my-theme-123')
    })

    it('should remove dangerous characters', () => {
      expect(sanitizeThemeName('../../../etc/passwd')).toBe('etcpasswd')
      expect(sanitizeThemeName('theme<script>')).toBe('themescript')
    })
  })

  describe('sanitizeMarkdown', () => {
    it('should remove script tags', () => {
      const dangerousMarkdown = '<script>alert("xss")</script># Safe heading'
      const result = sanitizeMarkdown(dangerousMarkdown)
      expect(result).toBe('# Safe heading')
    })

    it('should remove iframe tags', () => {
      const dangerousMarkdown = '<iframe src="evil.com"></iframe># Safe heading'
      const result = sanitizeMarkdown(dangerousMarkdown)
      expect(result).toBe('# Safe heading')
    })

    it('should preserve safe markdown', () => {
      const safeMarkdown = '# Heading\n\n**Bold text**'
      const result = sanitizeMarkdown(safeMarkdown)
      expect(result).toBe(safeMarkdown)
    })
  })

  describe('sanitizePrompt', () => {
    it('should remove code blocks', () => {
      const promptWithCode = 'Generate content\n```\nmalicious code\n```\nMore content'
      const result = sanitizePrompt(promptWithCode)
      expect(result).toBe('Generate content\nMore content')
    })

    it('should remove HTML tags', () => {
      const promptWithHTML = 'Generate <script>alert(1)</script> content'
      const result = sanitizePrompt(promptWithHTML)
      expect(result).toBe('Generate  content')
    })

    it('should limit length', () => {
      const longPrompt = 'a'.repeat(15000)
      const result = sanitizePrompt(longPrompt)
      expect(result.length).toBeLessThanOrEqual(10000)
    })

    it('should remove dangerous protocols', () => {
      const promptWithProtocols = 'Generate javascript:alert(1) and data:text/html content'
      const result = sanitizePrompt(promptWithProtocols)
      expect(result).not.toContain('javascript:')
      expect(result).not.toContain('data:')
    })
  })
})
