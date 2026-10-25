# Security Policy & Hardening Architecture (UtsavAI Pro v4.0)

## 1. Defense-in-Depth Controls Implemented
- **DOM XSS Prevention (`src/utils/security.js`)**: All dynamic strings and user inputs pass through `escapeHTML()` and `sanitizeText()` before DOM insertion. Unsafe `eval()`, `Function()`, and raw unescaped `innerHTML` sinks are strictly prohibited and enforced via `.eslintrc.json`.
- **Protocol & Payload Validation**: `sanitizeText()` strips `javascript:`, `vbscript:`, and `data:` schemes and control characters (`\\u0000-\\u001F`). `validateEventInput()` enforces strict numeric and integer boundaries on budgets (`₹10,000` to `₹10,00,00,000`) and guest counts (`10` to `10,000`).
- **Ephemeral Credential Isolation**: Optional user-supplied Google Gemini API keys are validated against strict regex format (`validateGeminiKeyFormat`), masked in the UI (`maskApiKey`), and held only in ephemeral memory/`sessionStorage`—never persisted in plaintext `localStorage` or committed to Git.
- **Sliding-Window Rate Limiting**: `RateLimiter` enforces a token-bucket limit of 12 requests per 60-second window with `AbortController` 8-second request timeouts to prevent API quota exhaustion.
- **Enterprise HTTP Security Headers (`vercel.json`)**:
  - `Content-Security-Policy` restricting script, style, and connect origins (`https://generativelanguage.googleapis.com`).
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`

## 2. Automated Security Verification
Run the automated security test suite via:
```bash
npm run test:security
```
