/**
 * Sanitizes input text to redact PII (Personally Identifiable Information)
 * and PHI (Protected Health Information) prior to Gemini API prompt submission.
 */
export function sanitizeForGemini(text: string): string {
  if (!text) return '';

  let sanitized = text;

  // Redact Email Addresses
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');

  // Redact Phone Numbers (US formats)
  sanitized = sanitized.replace(/(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, '[REDACTED_PHONE]');

  // Redact SSN patterns
  sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]');

  // Redact exact street addresses (e.g. 123 Main St, Apt 4B)
  sanitized = sanitized.replace(/\b\d{1,5}\s+[A-Z0-9a-z\s.,]+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way)\b/gi, '[REDACTED_ADDRESS]');

  return sanitized;
}
