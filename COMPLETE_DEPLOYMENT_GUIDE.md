# 🚀 Complete Publishing & Deployment Guide

Step-by-step guide to publish your `imzo-agnost` package and enable GitHub
Pages.

## 📦 Part 1: Publish to npm Registry

### Step 1: Create npm Account (if needed)

1. Go to [npmjs.com/signup](https://www.npmjs.com/signup)
2. Create account with email verification
3. Enable 2FA for security (recommended)

### Step 2: Login to npm

```bash
npm login
```

Enter your npm username, password, and email.

### Step 3: Publish Package

```bash
# Test the build first
pnpm run publish:dry

# If all looks good, publish
pnpm run publish:npm
```

### Step 4: Verify Publication

- Check: https://www.npmjs.com/package/imzo-agnost
- Test installation: `pnpm add imzo-agnost` in a test project

## 🌐 Part 2: Enable GitHub Pages

### Step 1: Enable Pages in Repository Settings

1. Go to your GitHub repository: https://github.com/Erkinov97/imzo-agnost
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select "GitHub Actions"
5. Click **Save**

### Step 2: Deploy Documentation

```bash
# Push latest changes to trigger deployment
git add .
git commit -m "🚀 Ready for GitHub Pages deployment"
git push origin main
```

### Step 3: Check Deployment

- Go to **Actions** tab in your repository
- Wait for "Deploy Documentation" workflow to complete
- Visit: https://erkinov97.github.io/imzo-agnost/

## 🏷️ Part 3: Automated Publishing (Optional)

### Setup npm Token for Auto-Publishing

1. Go to [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens)
2. Click "Generate New Token" → "Automation"
3. Copy the token
4. In GitHub repository → Settings → Secrets and variables → Actions
5. Add new secret: `NPM_TOKEN` with your token value

### Publish New Versions

```bash
# Increment version and create tag
npm version patch  # or minor/major
git push origin main --tags

# This triggers automatic publishing via GitHub Actions
```

## ✅ Verification Checklist

### After npm Publishing:

- [ ] Package appears at https://www.npmjs.com/package/imzo-agnost
- [ ] Users can install with `pnpm add imzo-agnost`
- [ ] TypeScript definitions work
- [ ] All export formats available (ESM, CJS)

### After GitHub Pages:

- [ ] Documentation site loads at https://erkinov97.github.io/imzo-agnost/
- [ ] Navigation works
- [ ] Search functionality works
- [ ] Mobile responsive

### After Auto-Publishing Setup:

- [ ] npm token added to GitHub secrets
- [ ] Version tags trigger publishing
- [ ] GitHub releases created automatically

## 🎯 Expected Results

### For Users:

```bash
# They can now install your package
pnpm add imzo-agnost

# Use in their projects
import { EImzoClient } from 'imzo-agnost';
```

### Professional Package:

- **npm registry**: https://www.npmjs.com/package/imzo-agnost
- **Documentation**: https://erkinov97.github.io/imzo-agnost/
- **TypeScript support**: Full type definitions
- **Modern builds**: ESM, CJS, UMD formats
- **Professional CI/CD**: Automated testing and publishing

## 🆘 Troubleshooting

### npm Publishing Issues:

```bash
# If package name taken
Error: 403 Forbidden
# Solution: Change package name or use scoped @username/imzo-agnost

# If not logged in
Error: need to auth first
# Solution: npm login

# If build fails
Error: prepublishOnly script failed
# Solution: Fix TypeScript/ESLint errors first
```

### GitHub Pages Issues:

- **404 on deployment**: Enable Pages in Settings first
- **Build fails**: Check Actions tab for detailed errors
- **Old content**: Pages may take 5-10 minutes to update

## 💰 Cost Summary

- **npm hosting**: 100% FREE forever
- **GitHub Pages**: 100% FREE for public repos
- **GitHub Actions**: 2,000 minutes/month FREE
- **CDN delivery**: 100% FREE via npm/GitHub

## 🎉 Success!

Once completed, your professional package will be:

1. **📦 Available on npm**: Users can install with package managers
2. **📚 Documented online**: Professional VitePress documentation site
3. **🔄 Auto-updating**: CI/CD pipeline for quality and deployment
4. **🌍 Globally accessible**: CDN delivery worldwide
5. **💼 Production ready**: Type-safe, tested, and versioned

Run the commands above and your package will be live! 🚀
