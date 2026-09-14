# Security policy

HVACCAL is a static, single-file web application. It runs entirely in the browser, has no
server-side code, no accounts, no cookies and no analytics, and stores only navigation preferences
(favorites, recent tools, collapsed groups) in the browser's `localStorage`.

## Reporting a vulnerability

Open a GitHub issue at
<https://github.com/skinyanjui/hvac-and-trades-caluclator-project.-/issues/new> with the word
**security** in the title. If the report could put users at risk before a fix ships (for example a
cross-site-scripting vector), leave the technical detail out of the public issue and note that you
would like a private channel; a maintainer will reply on the issue with one.

Please include the page (`#tool-id`), the browser and version, and the steps or input that reproduce
the problem. Reports are acknowledged within seven days. Fixes ship to production as a new commit
on `main` and are listed on the in-app **Changelog** page. The machine-readable version of this
policy is published at `/.well-known/security.txt` (RFC 9116).

## What is in scope

- The `index.html` application and the headers in `vercel.json`.
- The verification script in `scripts/` and the documentation in this repository.

Out of scope: the hosting platform itself (Vercel), browsers, and the third-party code and standards
bodies linked from the **Sources** page.

## Controls in place

The controls below were selected from the NIST publications that apply to a public, static web
application: the Cybersecurity Framework 2.0 (with the SP 1300 small-business quick-start guide),
SP 800-53 Rev. 5 control catalog, SP 800-218 Secure Software Development Framework (SSDF),
SP 800-52 Rev. 2 TLS guidance and SP 800-44 Version 2 public web-server guidance. The mapping is
kept in `AUDIT.md` under **NIST security survey**.

| Control | Implementation |
| --- | --- |
| Transport protection (SC-8, SP 800-52) | HTTPS only; `Strict-Transport-Security` two-year max-age with subdomains; CSP `upgrade-insecure-requests`. |
| Platform hardening (PR.PS-01, CM-6, CM-7) | `default-src 'none'` Content-Security-Policy, `frame-ancestors 'none'`, `X-Frame-Options DENY`, `X-Content-Type-Options nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, `X-Permitted-Cross-Domain-Policies none`. |
| Supply chain (GV.SC, SSDF PS.1 / PW.4) | No runtime third-party code or CDN: the Geist font is self-hosted under `/fonts` with its SIL OFL licence; the only development dependency is the headless browser used for smoke tests. |
| Input handling (SI-10) | All numeric inputs are parsed with range checks; every string rendered into the DOM passes through an HTML escaper; the route hash is validated against the calculator list. |
| Data minimisation (PR.DS, SP 800-122) | No personal data is collected or transmitted. `localStorage` keys are validated on read and discarded if malformed. |
| Flaw remediation (SI-2, RV.1) | `Cache-Control: must-revalidate` on the document so fixes reach users on the next load; this policy and `security.txt` describe how to report issues. |
| Verification (SSDF PW.7 / PW.8) | `node scripts/verify.mjs` runs calculator regression tests; headless-browser smoke and fuzz passes are run before release. |

### Accepted residual risk

The application is a single HTML file whose script and styles are inline, so the CSP allows
`'unsafe-inline'` for `script-src` and `style-src`. No user-supplied string is ever inserted as
markup, and there are no third-party scripts, which limits the practical exposure. Moving to a
hash-based CSP would require a build step and is tracked as a possible follow-up.
