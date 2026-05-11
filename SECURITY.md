# Security Policy

## 🔐 Supported Versions

We currently support the latest release with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | ✅ Active          |

## 🛡️ Security Features

- **Credential Vaulting**: Server passwords are stored hashed in MongoDB
- **SSH via node-pty**: Remote commands run through isolated PTY sessions
- **Preload Bridge Isolation**: Renderer access is strictly limited via contextBridge
- **CSP Headers**: Content Security Policy enforced in production builds
- **MongoDB Sanitization**: All queries use parameterized Mongoose queries

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability, **please do NOT open a public issue**.

Instead, send an email to **hnazarnejad76@gmail.com** with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You should receive a response within **48 hours**. We will keep you informed
as the issue is investigated and resolved.

## 🧪 Best Practices for Users

1. **Use strong passwords** for server credentials stored in the app
2. **Keep MongoDB secured** — don't expose it publicly without authentication
3. **Regular updates**: Update to the latest version for security patches
4. **Review SSH keys**: Only add trusted keys for remote server access
5. **API keys**: Store DeepSeek and other API keys securely

## 📜 Disclosure Policy

We follow a coordinated disclosure process:
1. Report received & acknowledged
2. Investigation & patch development
3. Patch released & vulnerability disclosed publicly

Thank you for helping keep **Project Manager Pro** secure! 🔒
EOF 