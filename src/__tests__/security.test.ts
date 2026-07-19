import { describe, it, expect } from 'vitest';
import { escapeHTML, sanitizeInput, sanitizeCssColor } from '../utils/security';

describe('Security Utilities', () => {
  describe('escapeHTML', () => {
    it('escapes HTML special characters correctly', () => {
      expect(escapeHTML('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(escapeHTML("Maria's Ticket & Pass")).toBe('Maria&#039;s Ticket &amp; Pass');
    });

    it('handles empty or null input gracefully', () => {
      expect(escapeHTML('')).toBe('');
    });
  });

  describe('sanitizeInput', () => {
    it('removes script tags and inline event handlers', () => {
      expect(sanitizeInput('<script>alert(1)</script>Hello')).toBe('Hello');
      expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
      expect(sanitizeInput('Hello <img src="x" onclick="alert(1)">')).toBe('Hello <img src="x">');
    });

    it('trims whitespace', () => {
      expect(sanitizeInput('   MetLife Stadium   ')).toBe('MetLife Stadium');
    });
  });

  describe('sanitizeCssColor', () => {
    it('allows valid CSS var, hex, and rgb colors', () => {
      expect(sanitizeCssColor('var(--fifa-blue)')).toBe('var(--fifa-blue)');
      expect(sanitizeCssColor('#10B981')).toBe('#10B981');
      expect(sanitizeCssColor('rgb(255, 0, 0)')).toBe('rgb(255, 0, 0)');
    });

    it('rejects invalid or malicious color strings and provides fallback', () => {
      expect(sanitizeCssColor('url(javascript:alert(1))')).toBe('#cccccc');
      expect(sanitizeCssColor('red; background: url(x)')).toBe('#cccccc');
    });
  });
});
