# Security Policy

## Reporting a vulnerability

Please do not publish exploitable security details, credentials, private messages, or personal data in a public issue.

Report suspected vulnerabilities privately through GitHub's **Report a vulnerability** feature on the NOOK repository, if available. Include:
- A concise description of the issue.
- The affected component or version.
- Steps to reproduce using a safe test environment.
- The potential impact and any suggested fix.

Do not test against systems or accounts you do not own or have permission to test.

## Secret handling

Never commit production credentials, Supabase service-role keys, passwords, access tokens, or real user data. If a secret is exposed, revoke or rotate it immediately; removing it from the latest commit alone does not make it safe.

## Scope

This policy covers security issues in the NOOK source code and its project configuration. Hosting-provider, database-provider, and third-party dependency issues may need to be reported to the relevant provider as well.
