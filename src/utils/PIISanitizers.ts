/**
 * Security & PII/PHI Sanitizer Utilities for InteliSupport
 */

export function sanitizeHTMLText(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeForGemini(text: string): string {
  if (!text) return '';
  let sanitized = text;

  // Max Input Length Cap
  if (sanitized.length > 2000) {
    sanitized = sanitized.substring(0, 2000);
  }

  // Redact SSN
  sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]');

  // Redact Phone Numbers
  sanitized = sanitized.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[REDACTED_PHONE]');

  // Redact Email Addresses
  sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[REDACTED_EMAIL]');

  // Redact Street Addresses (e.g., 123 Main St, 456 Park Ave)
  sanitized = sanitized.replace(/\b\d+\s+[A-Za-z0-9\s,.]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Way)\b/gi, '[REDACTED_ADDRESS]');

  return sanitizeHTMLText(sanitized);
}
