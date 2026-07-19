/**
 * Security and sanitization utilities for StadiumPulse AI
 */

/**
 * Escapes unsafe HTML characters to prevent XSS attacks.
 */
export function escapeHTML(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitizes user inputs by trimming and removing potential script tag injections.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s*on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * Validates and sanitizes colors for CSS insertion to prevent CSS injection.
 */
export function sanitizeCssColor(color: string): string {
  const allowedVarPattern = /^var\(--[a-zA-Z0-9-]+\)$/;
  const allowedHexPattern = /^#([0-9a-fA-F]{3}){1,2}$/;
  const allowedRgbPattern = /^rgba?\([^)]+\)$/;

  if (
    allowedVarPattern.test(color) ||
    allowedHexPattern.test(color) ||
    allowedRgbPattern.test(color)
  ) {
    return color;
  }
  return '#cccccc';
}
