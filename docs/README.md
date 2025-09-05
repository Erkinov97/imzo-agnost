# E-IMZO Agnostic Library - Documentation

Welcome to the comprehensive documentation for E-IMZO Agnostic Library - a
modern, type-safe, plugin-based TypeScript library for working with E-IMZO
cryptographic operations.

## 📚 Documentation Structure

### Getting Started

- [Installation Guide](./installation.md) - How to install and set up the
  library
- [Quick Start](./quickstart.md) - Your first steps with the library
- [Migration Guide](./migration.md) - Migrating from legacy E-IMZO
  implementations

### Core Concepts

- [Architecture Overview](./architecture.md) - Understanding the plugin-based
  architecture
- [Plugin System](./plugins.md) - How to work with and create plugins
- [TypeScript Support](./typescript.md) - Leveraging type safety and
  IntelliSense

### API Reference

- [Core API](./api/core.md) - Main EIMZOApi class and core functionality
- [Plugin APIs](./api/plugins.md) - Detailed reference for each plugin
- [Type Definitions](./api/types.md) - Complete TypeScript type reference

### Plugin Documentation

- [PFX Plugin](./plugins/pfx.md) - Working with PFX key storage files
- [PKCS7 Plugin](./plugins/pkcs7.md) - PKCS#7/CMS operations
- [FTJC Plugin](./plugins/ftjc.md) - USB FT Javacard tokens
- [CryptoAuth Plugin](./plugins/cryptoauth.md) - Low-level cryptographic
  operations
- [Certificate Management](./plugins/certificates.md) - X.509 certificates and
  chains

### Examples

- [Complete Examples](./examples/README.md) - Comprehensive usage examples
- [Browser Integration](./examples/browser.md) - Using in web applications
- [Node.js Integration](./examples/nodejs.md) - Server-side usage
- [Common Patterns](./examples/patterns.md) - Best practices and common use
  cases

### Advanced Topics

- [Error Handling](./advanced/error-handling.md) - Comprehensive error handling
  strategies
- [Performance Optimization](./advanced/performance.md) - Tips for optimal
  performance
- [Security Considerations](./advanced/security.md) - Security best practices
- [Custom Plugins](./advanced/custom-plugins.md) - Creating your own plugins

### Development

- [Contributing](./contributing.md) - How to contribute to the project
- [Testing](./testing.md) - Running and writing tests
- [Building](./building.md) - Build system and development setup

## 🚀 Quick Navigation

### Common Tasks

| Task                 | Documentation                                  |
| -------------------- | ---------------------------------------------- |
| Install the library  | [Installation Guide](./installation.md)        |
| Sign a document      | [PKCS7 Plugin](./plugins/pkcs7.md)             |
| List certificates    | [PFX Plugin](./plugins/pfx.md)                 |
| Verify signatures    | [PKCS7 Plugin](./plugins/pkcs7.md)             |
| Handle ID cards      | [FTJC Plugin](./plugins/ftjc.md)               |
| Create custom plugin | [Custom Plugins](./advanced/custom-plugins.md) |

### By User Type

**📱 Frontend Developers**

- [Browser Integration](./examples/browser.md)
- [TypeScript Support](./typescript.md)
- [Quick Start](./quickstart.md)

**🖥️ Backend Developers**

- [Node.js Integration](./examples/nodejs.md)
- [Security Considerations](./advanced/security.md)
- [Performance Optimization](./advanced/performance.md)

**🔧 Plugin Developers**

- [Plugin System](./plugins.md)
- [Custom Plugins](./advanced/custom-plugins.md)
- [API Reference](./api/plugins.md)

**🚀 DevOps Engineers**

- [Building](./building.md)
- [Testing](./testing.md)
- [Contributing](./contributing.md)

## 📋 Requirements

Before using this library, ensure you have:

- E-IMZO installed on user's machine
- Modern browser with WebSocket support (for web applications)
- Node.js 16+ (for server-side usage)
- TypeScript 4.5+ (for development with full type support)

## 🆘 Need Help?

1. **Check the documentation** - Most questions are answered here
2. **Look at examples** - See [examples directory](./examples/)
3. **Search issues** - Check if your question was already asked
4. **Ask for help** - Open a new issue with detailed information

## 📝 Contributing to Documentation

Documentation improvements are always welcome! See our
[Contributing Guide](./contributing.md) for details on how to help improve these
docs.

---

**Next Steps:** Start with the [Installation Guide](./installation.md) or jump
to [Quick Start](./quickstart.md) if you're ready to code!
