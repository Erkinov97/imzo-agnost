# Getting Started

Welcome to IMZO Agnost! This guide will help you get up and running with the
library in just a few minutes.

## What is IMZO Agnost?

IMZO Agnost is a modern TypeScript library that provides a comprehensive,
type-safe interface for working with E-IMZO (Electronic Digital Signature) in
Uzbekistan. It supports all major E-IMZO operations including:

- **Digital Signature Creation** - PKCS#7 signatures with full compliance
- **Certificate Management** - PFX files and hardware tokens (FTJC)
- **Document Authentication** - Secure document signing and verification
- **PKI Operations** - Complete public key infrastructure support

## Prerequisites

Before you begin, make sure you have:

- **Node.js 20+** or **modern browser** with ES2022 support
- **E-IMZO installed** on the target machine
- **Valid certificates** (PFX files or hardware tokens)
- **Package manager** (pnpm, npm, or yarn)

## Architecture Overview

IMZO Agnost uses a plugin-based architecture:

```
┌─────────────────┐
│   Your App      │
├─────────────────┤
│  IMZO Agnost    │  ← Main API
├─────────────────┤
│    Plugins      │  ← PFX, PKCS7, FTJC, etc.
├─────────────────┤
│   CAPIWS        │  ← WebSocket communication
├─────────────────┤
│   E-IMZO        │  ← Native E-IMZO application
└─────────────────┘
```

## Key Concepts

### 1. Certificates

Certificates are digital identities used for signing. They can be:

- **PFX files** - Software certificates stored in files
- **FTJC tokens** - Hardware security modules

### 2. Digital Signatures

Digital signatures provide:

- **Authentication** - Proves who signed the document
- **Integrity** - Ensures document hasn't been modified
- **Non-repudiation** - Signer cannot deny signing

### 3. Plugin System

Each operation (PFX, PKCS7, etc.) is implemented as a plugin:

- **Modular** - Only load what you need
- **Extensible** - Easy to add new functionality
- **Type-safe** - Full TypeScript support

## Next Steps

1. **[Install the library](/guide/installation)** - Get IMZO Agnost installed
2. **[Quick Start Guide](/guide/quick-start)** - Basic usage examples
3. **[Configuration](/guide/configuration)** - Set up your environment
4. **[Examples](/examples/)** - See practical implementations

## Need Help?

- Check our [API Reference](/api/) for detailed documentation
- Browse [Examples](/examples/) for common use cases
- Report issues on [GitHub](https://github.com/Erkinov97/imzo-agnost/issues)

Let's get started with the [installation process](/guide/installation)!
