# 🚀 GitHub Pages Setup Instructions

To enable the **FREE** documentation website at
`https://erkinov97.github.io/imzo-agnost/`, follow these simple steps:

## ⚠️ IMPORTANT: Enable Pages First!

**You MUST enable GitHub Pages before the deployment workflow will work.**

### Step 1: Enable GitHub Pages

1. **Go to repository Settings**:
   https://github.com/Erkinov97/imzo-agnost/settings/pages
2. **Under "Source"**: Select **"GitHub Actions"** from the dropdown
3. **Click "Save"**

### Step 2: Trigger Deployment

After enabling Pages, trigger the first deployment:

1. **Go to Actions tab**: https://github.com/Erkinov97/imzo-agnost/actions
2. **Click "Deploy Documentation"** workflow (left sidebar)
3. **Click "Run workflow"** → **"Run workflow"** button
4. **Wait 2-3 minutes** for completion

### Step 3: Access Your Website

- **Your site**: https://erkinov97.github.io/imzo-agnost/
- **Auto-deploys**: Every push to main branch
- **Build time**: ~2 minutes per deployment

## 💰 Cost Breakdown (100% FREE!)

- ✅ **GitHub Pages**: FREE for public repositories
- ✅ **GitHub Actions**: 2000 FREE minutes/month for public repos
- ✅ **VitePress**: Open source, no licensing costs
- ✅ **Domain**: FREE github.io subdomain included
- ✅ **SSL Certificate**: FREE HTTPS included
- ✅ **CDN**: FREE global content delivery

**Total Monthly Cost: $0.00** 💯

## 🌟 What You Get

- **Professional Documentation Website** with modern design
- **Interactive Examples** and API reference
- **Mobile-Responsive** design that works on all devices
- **Search Functionality** with instant results
- **SEO Optimized** for better discoverability
- **Automatic Updates** when you push to main branch

## 🔧 Technical Details

- **Node.js Support**: 18, 20, 22 (automatically tested)
- **Build Time**: ~2-3 minutes for full deployment
- **Update Frequency**: Instant on every push to main
- **Hosting**: GitHub's global CDN infrastructure
- **Uptime**: 99.9% SLA (same as GitHub)

## 📱 Features Included

- 📚 **Complete API Documentation**
- 🚀 **Getting Started Guide**
- 💻 **Framework Examples** (React, Vue, Node.js)
- 🔍 **Local Search** functionality
- 📱 **Mobile-First** responsive design
- 🌙 **Dark/Light** theme support
- 📝 **Edit on GitHub** links for contributions

## 🛠️ Development Commands

```bash
# Start development server
pnpm run docs:dev

# Build for production
pnpm run docs:build

# Preview built site
pnpm run docs:preview
```

## 🤝 Contributing to Docs

1. Edit files in `/docs-site/` directory
2. Run `pnpm run docs:dev` to preview changes
3. Commit and push - deployment is automatic!

---

**Note**: The first deployment might take 5-10 minutes as GitHub sets up the
Pages environment. Subsequent deployments are much faster (1-2 minutes).
