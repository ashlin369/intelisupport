/**
 * Security & PII/PHI Sanitizer Utilities for InteliSupport
 *
 * All user-generated text must pass through sanitizeForGemini() before
 * being sent to any external AI or cloud service.
 */

// ---- HTML Escaping ----------------------------------------------------------

/**
 * Escapes HTML special characters to prevent XSS injection.
 */
export function sanitizeHTMLText(input: string): string {
  if (typeof input !== 'string' || !input) return '';
  return input
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// ---- PII Redaction Patterns -------------------------------------------------

const PII_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // Social Security Numbers: 123-45-6789
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g,                                                                             replacement: '[REDACTED_SSN]'     },
  // US Phone Numbers: 555-123-4567, 555.123.4567, 5551234567
  { pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,                                                                      replacement: '[REDACTED_PHONE]'   },
  // Email Addresses
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,                                                replacement: '[REDACTED_EMAIL]'   },
  // Street Addresses: 123 Main St, 456 Park Avenue
  { pattern: /\b\d+\s+[A-Za-z0-9\s,.]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Way)\b/gi,   replacement: '[REDACTED_ADDRESS]' }
];

// ---- Public API -------------------------------------------------------------

/**
 * Sanitizes user input before dispatch to Gemini AI:
 *  1. Enforces a 2000-character input cap.
 *  2. Redacts PII (SSNs, phones, emails, addresses).
 *  3. HTML-escapes the result to prevent prompt injection.
 */
export function sanitizeForGemini(text: string): string {
  if (typeof text !== 'string' || !text) return '';

  let sanitized = text.length > 2000 ? text.substring(0, 2000) : text;

  for (const { pattern, replacement } of PII_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }

  return sanitizeHTMLText(sanitized);
}
