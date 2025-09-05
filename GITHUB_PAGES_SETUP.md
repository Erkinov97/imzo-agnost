# 🚀 GitHub Pages Setup Instructions

To enable the **FREE** documentation website at
`https://erkinov97.github.io/imzo-agnost/`, follow these simple steps:

## Step 1: Enable GitHub Pages

1. **Go to your repository**: https://github.com/Erkinov97/imzo-agnost
2. **Click on "Settings"** tab (top right of repository)
3. **Scroll down to "Pages"** in the left sidebar
4. **Select Source**: Choose "GitHub Actions" from dropdown
5. **Save the settings**

## Step 2: Manual Trigger (First Time)

Since Pages wasn't enabled before, manually trigger the deployment:

1. **Go to "Actions" tab** in your repository
2. **Click on "Deploy Documentation"** workflow
3. **Click "Run workflow"** → **"Run workflow"** button
4. **Wait for completion** (2-3 minutes)

## Step 3: Check Deployment Status

1. **Monitor the workflow** in the Actions tab
2. **Look for green checkmarks** ✅ on all steps
3. **Your site will be available** at: https://erkinov97.github.io/imzo-agnost/
4. **Future pushes** will auto-deploy

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
