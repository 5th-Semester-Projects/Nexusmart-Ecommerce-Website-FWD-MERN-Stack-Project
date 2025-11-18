# NexusMart Screenshots

This directory contains app screenshots for the PWA manifest and app store listings.

## Required Screenshots

As defined in manifest.json:

1. **home.png** (1280x720)

   - Capture: Home page with AI recommendations section
   - Show: Hero banner, featured products, personalized recommendations
   - Label: "Home page with AI recommendations and featured products"

2. **products.png** (1280x720)
   - Capture: Products page with filters and grid layout
   - Show: Search bar, category filters, product grid, sort options
   - Label: "Product catalog with advanced filters and search"

## Additional Recommended Screenshots

For better app store presentation:

3. **product-detail.png** (1280x720)

   - Product detail page with 3D viewer and AR try-on buttons
   - Show off unique AR/3D features

4. **cart-checkout.png** (1280x720)

   - Shopping cart and checkout flow
   - Demonstrate smooth purchase experience

5. **ar-experience.png** (1280x720)

   - AR try-on feature in action
   - Show WebXR integration

6. **virtual-showroom.png** (1280x720)
   - 3D virtual showroom environment
   - Highlight immersive shopping

## Capture Guidelines

- **Resolution**: 1280x720 pixels (16:9 aspect ratio)
- **Format**: PNG with transparency or white background
- **Quality**: High-resolution, crisp text and images
- **Content**: Show actual UI with realistic data (not placeholder content)
- **Branding**: Include NexusMart logo in navbar
- **Clean UI**: Close any developer tools, use production build
- **Responsive**: Capture desktop view for better detail visibility

## Capture Tools

### Browser Tools

```bash
# Chrome DevTools
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Set resolution to 1280x720
4. Capture screenshot (Ctrl+Shift+P → "Capture screenshot")
```

### Command Line Tools

```bash
# Using puppeteer-screenshot
npx capture-website https://nexusmart.com --width=1280 --height=720 --output=home.png

# Or install globally
npm install -g capture-website-cli
capture-website https://nexusmart.com --width=1280 --height=720 --output=screenshots/home.png
```

### Design Tools

- **Figma**: Export frames at exact dimensions
- **Photoshop**: Crop and export at 1280x720
- **Browser Extensions**: Full Page Screenshot, Fireshot

## SEO Optimization

Screenshots are indexed by:

- Google Play Store (if wrapped as TWA)
- Microsoft Store (for Windows PWAs)
- Search engines (in rich results)

Make them compelling and feature-rich!

## File Naming

Keep names simple and descriptive:

- ✅ home.png
- ✅ products.png
- ❌ screenshot-2024-01-15-homepage.png
