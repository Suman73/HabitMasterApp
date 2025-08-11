# HabitMaster Edge Extension - GitHub Pages Deployment

This guide will help you deploy the HabitMaster Edge extension to GitHub Pages, making it accessible online for users to try before installing.

## 🚀 Quick Start

### 1. Repository Setup

1. **Fork or Clone** this repository to your GitHub account
2. **Enable GitHub Pages** in your repository settings:
   - Go to `Settings` → `Pages`
   - Set source to `GitHub Actions`
   - This will automatically use the workflow we've configured

### 2. Automatic Deployment

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that will automatically:
- Deploy your extension to GitHub Pages on every push to `main` branch
- Make the extension available at `https://yourusername.github.io/HabitMaster/`

### 3. Manual Deployment

If you prefer manual deployment:

1. **Create a new branch** called `gh-pages`
2. **Copy the extension files** to the root of that branch
3. **Enable GitHub Pages** and set source to `gh-pages` branch

## 📁 File Structure

```
edge-extension/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment
├── gh-pages.html              # GitHub Pages demo page
├── popup.html                 # Extension popup
├── popup.js                   # Extension logic
├── styles.css                 # Styling
├── background.js              # Service worker
├── storage.js                 # Data storage
├── date-utils.js             # Date utilities
├── manifest.json              # Extension manifest
└── README-GITHUB-PAGES.md    # This file
```

## 🌐 GitHub Pages Features

### Demo Page (`gh-pages.html`)
- **Full-featured demo** of the extension functionality
- **Installation instructions** for users
- **Responsive design** that works on all devices
- **Direct download links** to extension files

### Extension Files
- All extension files are available for download
- Users can test the extension before installing
- Complete source code is accessible

## 🔧 Customization

### Update Repository URL
In `gh-pages.html`, update the GitHub repository URL:
```html
<a href="https://github.com/yourusername/HabitMaster" class="btn">View on GitHub</a>
```

### Modify Styling
The GitHub Pages demo uses custom CSS in the `<style>` tag. You can:
- Change colors and themes
- Adjust layout and spacing
- Add your branding elements

### Add Features
Consider adding:
- **Screenshots** of the extension in action
- **Video demos** showing usage
- **User testimonials** or reviews
- **Changelog** or version history

## 📱 Extension Installation

Users can install the extension by:

1. **Downloading** the extension files from GitHub Pages
2. **Opening Edge** and navigating to `edge://extensions/`
3. **Enabling** Developer mode
4. **Loading** the unpacked extension

## 🚀 Deployment Workflow

The GitHub Actions workflow automatically:

1. **Triggers** on push to main branch
2. **Checks out** the repository
3. **Configures** GitHub Pages
4. **Uploads** the extension files as artifacts
5. **Deploys** to GitHub Pages

## 🔍 Troubleshooting

### Pages Not Loading
- Check if GitHub Pages is enabled
- Verify the workflow ran successfully
- Check for any build errors in Actions tab

### Extension Not Working
- Ensure all JavaScript files are properly linked
- Check browser console for errors
- Verify file paths are correct

### Styling Issues
- Check if CSS files are loading
- Verify CSS selectors match HTML structure
- Test on different browsers/devices

## 📊 Analytics & Monitoring

Consider adding:
- **Google Analytics** to track usage
- **GitHub Insights** to monitor repository activity
- **User feedback** collection forms

## 🔒 Security Considerations

- **No sensitive data** in the demo
- **Local storage only** for user data
- **No external API calls** without user consent
- **HTTPS enforced** by GitHub Pages

## 📈 Performance Optimization

- **Minify** CSS and JavaScript for production
- **Optimize** images and assets
- **Enable** GitHub Pages caching
- **Use** CDN for external resources if needed

## 🎯 Next Steps

After successful deployment:

1. **Test** the live demo thoroughly
2. **Share** the GitHub Pages URL
3. **Collect** user feedback
4. **Iterate** and improve based on usage
5. **Monitor** performance and analytics

## 📞 Support

If you encounter issues:
- Check the [GitHub Actions](https://github.com/features/actions) documentation
- Review [GitHub Pages](https://pages.github.com/) guides
- Open an issue in the repository
- Check browser developer tools for errors

---

**Happy Deploying! 🚀**

Your HabitMaster Edge extension will be live at:
`https://yourusername.github.io/HabitMaster/`
