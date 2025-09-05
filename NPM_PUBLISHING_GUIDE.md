# 📦 Publishing to npm Registry

Complete guide to publish `imzo-agnost` to npm so users can install it with
`pnpm add imzo-agnost`.

## 🚀 Quick Publishing Steps

### 1. Setup npm Account (if you don't have one)

```bash
# Create account at: https://www.npmjs.com/signup
# Or login if you have an account
npm login
```

### 2. Build and Test

```bash
# Run all quality checks and build
pnpm run prepublishOnly

# Test the build
pnpm run publish:dry
```

### 3. Publish to npm

```bash
# Publish the package
pnpm run publish:npm

# Or use npm directly
npm publish
```

## ✅ Pre-Publication Checklist

- [x] **Package name available**: `imzo-agnost` is unique
- [x] **License file**: LICENSE added with ISC license
- [x] **Repository links**: GitHub repository configured
- [x] **Build configuration**: TypeScript builds to dist/
- [x] **Export maps**: ESM, CJS, and TypeScript definitions
- [x] **Quality checks**: All tests, linting, and formatting pass

## 🔧 What Happens When You Publish

1. **Pre-publish script runs**: `prepublishOnly`
   - Runs quality checks (TypeScript, ESLint, Prettier)
   - Builds the package to `dist/` folder
2. **Files included** in npm package:
   - `dist/` - Built JavaScript and TypeScript definitions
   - `README.md` - Package documentation
   - `LICENSE` - ISC license file
   - `package.json` - Package metadata

3. **Published to**: https://www.npmjs.com/package/imzo-agnost

## 📋 After Publishing

### Users can install with:

```bash
# pnpm (recommended)
pnpm add imzo-agnost

# npm
npm install imzo-agnost

# yarn
yarn add imzo-agnost

# bun
bun add imzo-agnost
```

### Package will be available at:

- **npm**: https://www.npmjs.com/package/imzo-agnost
- **CDN**: https://cdn.skypack.dev/imzo-agnost
- **unpkg**: https://unpkg.com/imzo-agnost

## 🔄 Publishing Updates

### Version Management

```bash
# Patch version (1.0.0 → 1.0.1)
npm version patch && npm publish

# Minor version (1.0.0 → 1.1.0)
npm version minor && npm publish

# Major version (1.0.0 → 2.0.0)
npm version major && npm publish
```

### Automated Publishing (Future)

We can add GitHub Actions to auto-publish on version tags:

```yaml
# .github/workflows/publish.yml
name: Publish to npm
on:
  push:
    tags: ['v*']
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          registry-url: 'https://registry.npmjs.org'
      - run: pnpm install
      - run: pnpm run prepublishOnly
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 🛡️ Security Considerations

- **Two-factor authentication**: Enable 2FA on npm account
- **Scoped packages**: Consider `@username/imzo-agnost` for organization
- **npm audit**: Run `npm audit` to check for vulnerabilities
- **Dependencies**: Keep dependencies updated and secure

## 💰 Cost

- **Publishing to npm**: **100% FREE**
- **Package hosting**: **FREE** (unlimited downloads)
- **CDN delivery**: **FREE** via npm CDN
- **No bandwidth limits**: **FREE** for open source packages

## 🎯 What Users Get After Publishing

- **Easy installation**: `pnpm add imzo-agnost`
- **TypeScript support**: Full type definitions included
- **Modern formats**: ESM, CJS, and UMD builds
- **CDN access**: Direct browser imports
- **Documentation**: Links to GitHub Pages site
- **Professional package**: Proper versioning and metadata

## 🚨 Troubleshooting

### Common Issues:

#### Package name already taken

```bash
# Error: 403 Forbidden - PUT https://registry.npmjs.org/imzo-agnost
# Solution: Choose a different name or use scoped package
```

#### Not logged in

```bash
# Error: need to auth first
npm login
```

#### Build fails

```bash
# Error: prepublishOnly script failed
pnpm run quality  # Fix any linting/type errors
pnpm run build    # Ensure build succeeds
```

## 📞 Support

- **npm help**: `npm help publish`
- **npm registry**: https://www.npmjs.com/package/imzo-agnost
- **GitHub issues**: https://github.com/Erkinov97/imzo-agnost/issues

---

**Ready to publish?** Run `npm login` then `pnpm run publish:npm`! 🚀
